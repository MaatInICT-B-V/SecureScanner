import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { Finding, Severity, FindingCategory } from '../types/finding';
import { ScannerEngine } from '../engine/scannerEngine';
import { severityToLabel, severityToIcon } from '../utils/configManager';
import { fetchVulnerabilityUpdates } from '../engine/vulnDbUpdater';
import { checkPipUpdates, PipPackageStatus } from '../engine/pipUpdateChecker';

export class DashboardPanel {
  public static currentPanel: DashboardPanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private disposables: vscode.Disposable[] = [];

  private constructor(
    panel: vscode.WebviewPanel,
    private engine: ScannerEngine,
    private extensionUri: vscode.Uri,
    private globalStorageUri: vscode.Uri
  ) {
    this.panel = panel;
    this.panel.webview.html = this.getHtmlContent(extensionUri);

    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

    this.panel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'navigateToFinding':
            this.navigateToFinding(message.finding);
            break;
          case 'refresh':
            this.refresh();
            break;
          case 'scanWorkspace':
            this.scanWorkspace();
            break;
          case 'exportReport':
            this.exportReport();
            break;
          case 'updateVulnDb':
            this.updateVulnDb();
            break;
          case 'toggleTestEnvironment':
            this.toggleTestEnvironment(message.value);
            break;
          case 'checkPipUpdates':
            this.checkPipUpdates();
            break;
          case 'updatePipPackage':
            this.updatePipPackage(message.packageName);
            break;
        }
      },
      null,
      this.disposables
    );

    this.disposables.push(
      engine.onFindingsChanged(() => this.refresh())
    );

    this.refresh();
  }

  static createOrShow(engine: ScannerEngine, extensionUri: vscode.Uri, globalStorageUri: vscode.Uri): void {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (DashboardPanel.currentPanel) {
      DashboardPanel.currentPanel.panel.reveal(column);
      DashboardPanel.currentPanel.refresh();
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'secureScanner.dashboard',
      'Security Dashboard',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );

    DashboardPanel.currentPanel = new DashboardPanel(panel, engine, extensionUri, globalStorageUri);
  }

  private refresh(): void {
    const findingsMap = this.engine.getAllFindings();
    const allFindings: Finding[] = [];
    for (const findings of findingsMap.values()) {
      allFindings.push(...findings);
    }
    const config = this.engine.getConfig();
    this.panel.webview.postMessage({
      type: 'findings',
      data: allFindings,
      isTestEnvironment: config.isTestEnvironment,
    });
  }

  private navigateToFinding(finding: Finding): void {
    const uri = vscode.Uri.file(finding.location.filePath);
    const range = new vscode.Range(
      finding.location.startLine,
      finding.location.startColumn,
      finding.location.endLine,
      finding.location.endColumn
    );
    vscode.window.showTextDocument(uri, { selection: range });
  }

  private async scanWorkspace(): Promise<void> {
    this.panel.webview.postMessage({ type: 'scanStatus', status: 'scanning' });
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'SecureScanner: Scanning workspace...',
        cancellable: true,
      },
      async (_progress, token) => {
        const findings = await this.engine.scanWorkspace(token);
        this.panel.webview.postMessage({ type: 'scanStatus', status: 'done', count: findings.length });
        this.refresh();
      }
    );
  }


  private async updateVulnDb(): Promise<void> {
    this.panel.webview.postMessage({ type: 'vulnDbStatus', status: 'updating' });

    try {
      const result = await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'SecureScanner: Updating vulnerability database...',
          cancellable: false,
        },
        async (progress) => {
          return await fetchVulnerabilityUpdates(progress);
        }
      );

      // Guard against an offline/failed update: queryOsv swallows network errors
      // and returns [], so a total failure surfaces here as an empty result.
      // Persisting that would overwrite a good DB and wipe the built-in rules,
      // so treat "nothing at all" as a failed update and keep existing rules.
      if (result.npm.length === 0 && result.pip.length === 0) {
        this.panel.webview.postMessage({ type: 'vulnDbStatus', status: 'error' });
        vscode.window.showErrorMessage(
          'SecureScanner: Update returned no vulnerabilities — likely offline or OSV.dev unreachable. Existing rules kept.'
        );
        return;
      }

      // Save updated rules to global storage (persists across updates)
      const globalStoragePath = this.globalStorageUri.fsPath;
      const vulnDbPath = path.join(globalStoragePath, 'vulnDb.json');

      const vulnDbData = {
        updatedAt: new Date().toISOString(),
        npmVulnerabilities: result.npm,
        pipVulnerabilities: result.pip,
      };

      // Ensure directory exists
      try { fs.mkdirSync(globalStoragePath, { recursive: true }); } catch { /* exists */ }
      fs.writeFileSync(vulnDbPath, JSON.stringify(vulnDbData, null, 2), 'utf8');

      // Reload the scanner engine with updated data
      this.engine.loadExternalVulnDb(vulnDbPath);

      this.panel.webview.postMessage({
        type: 'vulnDbStatus',
        status: 'done',
        npmCount: result.npm.length,
        pipCount: result.pip.length,
      });

      vscode.window.showInformationMessage(
        `SecureScanner: Vulnerability database updated! Found ${result.npm.length} npm + ${result.pip.length} pip vulnerabilities.`
      );

      // Re-scan workspace with updated rules
      const rescan = await vscode.window.showInformationMessage(
        'Re-scan workspace with updated database?',
        'Yes', 'No'
      );
      if (rescan === 'Yes') {
        this.scanWorkspace();
      }
    } catch (err) {
      this.panel.webview.postMessage({ type: 'vulnDbStatus', status: 'error' });
      vscode.window.showErrorMessage(
        `SecureScanner: Failed to update vulnerability database. ${err instanceof Error ? err.message : 'Check your internet connection.'}`
      );
    }
  }

  private async exportReport(): Promise<void> {
    const findingsMap = this.engine.getAllFindings();
    const allFindings: Finding[] = [];
    for (const findings of findingsMap.values()) {
      allFindings.push(...findings);
    }

    // Sort by severity (critical first)
    allFindings.sort((a, b) => a.severity - b.severity);

    const now = new Date();
    const dateStr = now.toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const workspaceName = vscode.workspace.workspaceFolders?.[0]?.name || 'Unknown Project';

    const severityCounts = {
      critical: allFindings.filter(f => f.severity === Severity.Critical).length,
      high: allFindings.filter(f => f.severity === Severity.High).length,
      medium: allFindings.filter(f => f.severity === Severity.Medium).length,
      low: allFindings.filter(f => f.severity === Severity.Low).length,
      info: allFindings.filter(f => f.severity === Severity.Info).length,
    };

    const categoryCounts: Record<string, number> = {};
    for (const f of allFindings) {
      categoryCounts[f.category] = (categoryCounts[f.category] || 0) + 1;
    }

    const categoryLabel = (cat: string): string => {
      switch (cat) {
        case FindingCategory.Credential: return 'Credentials';
        case FindingCategory.OWASP: return 'OWASP';
        case FindingCategory.Dependency: return 'Dependencies';
        case FindingCategory.Misconfiguration: return 'Misconfiguration';
        case FindingCategory.FileHygiene: return 'File Hygiene';
        default: return cat;
      }
    };

    const sevClass = (s: Severity): string => {
      switch (s) {
        case Severity.Critical: return 'critical';
        case Severity.High: return 'high';
        case Severity.Medium: return 'medium';
        case Severity.Low: return 'low';
        case Severity.Info: return 'info';
      }
    };

    const escHtml = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    const findingsRows = allFindings.map(f => {
      const relPath = vscode.workspace.asRelativePath(f.location.filePath);
      const cwe = f.cweId ? `<span class="cwe">CWE: ${escHtml(f.cweId)}</span>` : '';
      return `<tr>
        <td><span class="badge ${sevClass(f.severity)}">${severityToIcon(f.severity)} ${severityToLabel(f.severity)}</span></td>
        <td><strong>${escHtml(f.title)}</strong><br><span class="desc">${escHtml(f.description)}</span></td>
        <td>${escHtml(categoryLabel(f.category))}</td>
        <td class="file-path">${escHtml(relPath)}:${f.location.startLine}</td>
        <td>${cwe}</td>
      </tr>`;
    }).join('\n');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SecureScanner Report - ${escHtml(workspaceName)}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #1a1a2e; color: #e0e0e0; line-height: 1.6; }
  .container { max-width: 1200px; margin: 0 auto; padding: 24px; }
  header { background: linear-gradient(135deg, #16213e, #0f3460); border-radius: 12px; padding: 32px; margin-bottom: 24px; display: flex; align-items: center; gap: 20px; }
  header .logo { font-size: 2.5em; }
  header h1 { font-size: 1.8em; color: #fff; }
  header p { color: #8892b0; font-size: 0.95em; }
  .summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
  .card { background: #16213e; border-radius: 10px; padding: 20px; text-align: center; border: 1px solid #1a1a40; }
  .card .number { font-size: 2.2em; font-weight: 700; }
  .card .label { font-size: 0.85em; color: #8892b0; margin-top: 4px; }
  .card.critical .number { color: #f44336; }
  .card.high .number { color: #ff9800; }
  .card.medium .number { color: #ffc107; }
  .card.low .number { color: #2196f3; }
  .card.info .number { color: #9e9e9e; }
  .card.total .number { color: #fff; }
  .section { background: #16213e; border-radius: 10px; padding: 24px; margin-bottom: 24px; border: 1px solid #1a1a40; }
  .section h2 { font-size: 1.3em; margin-bottom: 16px; color: #fff; }
  table { width: 100%; border-collapse: collapse; font-size: 0.9em; }
  th { text-align: left; padding: 10px 12px; background: #0f3460; border-bottom: 2px solid #1a1a40; color: #ccd6f6; font-weight: 600; }
  td { padding: 10px 12px; border-bottom: 1px solid #1a1a40; vertical-align: top; }
  tr:hover { background: rgba(255,255,255,0.03); }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 4px; font-size: 0.8em; font-weight: 700; white-space: nowrap; }
  .badge.critical { background: #f44336; color: #fff; }
  .badge.high { background: #ff9800; color: #fff; }
  .badge.medium { background: #ffc107; color: #333; }
  .badge.low { background: #2196f3; color: #fff; }
  .badge.info { background: #9e9e9e; color: #fff; }
  .desc { color: #8892b0; font-size: 0.85em; }
  .cwe { background: #2a2a4a; padding: 2px 8px; border-radius: 3px; font-size: 0.8em; color: #8892b0; }
  .file-path { font-family: 'Cascadia Code', 'Fira Code', monospace; font-size: 0.85em; color: #64ffda; word-break: break-all; }
  .category-bar { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
  .category-tag { background: #0f3460; padding: 6px 14px; border-radius: 6px; font-size: 0.85em; }
  .category-tag strong { color: #64ffda; }
  footer { text-align: center; padding: 20px; color: #555; font-size: 0.8em; }
  .no-findings { text-align: center; padding: 40px; color: #4caf50; font-size: 1.1em; }
  @media print { body { background: #fff; color: #333; } .container { max-width: 100%; } header { background: #f5f5f5; } .section { background: #fff; border: 1px solid #ddd; } td, th { color: #333; } .desc { color: #666; } .file-path { color: #00695c; } tr:hover { background: transparent; } }
  @media (max-width: 768px) { .summary-cards { grid-template-columns: repeat(2, 1fr); } header { flex-direction: column; text-align: center; } }
</style>
</head>
<body>
<div class="container">
  <header>
    <div class="logo">🛡️</div>
    <div>
      <h1>SecureScanner Security Report</h1>
      <p>Project: <strong>${escHtml(workspaceName)}</strong> &mdash; Generated: ${escHtml(dateStr)}</p>
    </div>
  </header>

  <div class="summary-cards">
    <div class="card total"><div class="number">${allFindings.length}</div><div class="label">Total Findings</div></div>
    <div class="card critical"><div class="number">${severityCounts.critical}</div><div class="label">Critical</div></div>
    <div class="card high"><div class="number">${severityCounts.high}</div><div class="label">High</div></div>
    <div class="card medium"><div class="number">${severityCounts.medium}</div><div class="label">Medium</div></div>
    <div class="card low"><div class="number">${severityCounts.low}</div><div class="label">Low</div></div>
    <div class="card info"><div class="number">${severityCounts.info}</div><div class="label">Info</div></div>
  </div>

  <div class="section">
    <h2>Categories</h2>
    <div class="category-bar">
      ${Object.entries(categoryCounts).map(([cat, count]) => `<div class="category-tag"><strong>${count}</strong> ${escHtml(categoryLabel(cat))}</div>`).join('\n      ')}
    </div>
  </div>

  <div class="section">
    <h2>Findings</h2>
    ${allFindings.length === 0 ? '<div class="no-findings">✅ No security findings detected!</div>' : `
    <table>
      <thead><tr><th>Severity</th><th>Finding</th><th>Category</th><th>Location</th><th>CWE</th></tr></thead>
      <tbody>${findingsRows}</tbody>
    </table>`}
  </div>

  <footer>
    Generated by SecureScanner for VS Code &mdash; ${escHtml(now.toISOString())}
  </footer>
</div>
</body>
</html>`;

    const uri = await vscode.window.showSaveDialog({
      filters: { 'HTML Report': ['html'] },
      defaultUri: vscode.Uri.file('security-report.html'),
    });

    if (uri) {
      const content = Buffer.from(html, 'utf8');
      await vscode.workspace.fs.writeFile(uri, content);
      vscode.window.showInformationMessage(`Report exported to ${uri.fsPath}`);
    }
  }

  private async checkPipUpdates(): Promise<void> {
    this.panel.webview.postMessage({ type: 'pipUpdateStatus', status: 'checking' });

    try {
      const config = this.engine.getConfig();
      const results = await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'SecureScanner: Checking pip packages for updates...',
          cancellable: false,
        },
        async (progress) => {
          return await checkPipUpdates(config.pipIndexUrl, progress);
        }
      );

      this.panel.webview.postMessage({
        type: 'pipUpdateStatus',
        status: 'done',
        packages: results,
        indexUrl: config.pipIndexUrl,
      });

      if (results.length === 0) {
        vscode.window.showInformationMessage('SecureScanner: All pip packages are up to date!');
      } else {
        vscode.window.showInformationMessage(
          `SecureScanner: ${results.length} pip package(s) have updates available.`
        );
      }
    } catch (err) {
      this.panel.webview.postMessage({ type: 'pipUpdateStatus', status: 'error' });
      vscode.window.showErrorMessage(
        `SecureScanner: Failed to check pip updates. ${err instanceof Error ? err.message : 'Check your internet connection.'}`
      );
    }
  }

  private async updatePipPackage(packageName: string): Promise<void> {
    const terminal = vscode.window.createTerminal({ name: `pip upgrade ${packageName}` });
    terminal.show();
    terminal.sendText(`pip install --upgrade ${packageName}`);

    this.panel.webview.postMessage({
      type: 'pipPackageUpdateStarted',
      packageName,
    });

    vscode.window.showInformationMessage(
      `SecureScanner: Upgrading ${packageName} in terminal. Run "Check for Updates" again after installation completes.`
    );
  }

  private async toggleTestEnvironment(value: boolean): Promise<void> {
    const config = vscode.workspace.getConfiguration('secureScanner');
    await config.update('isTestEnvironment', value, vscode.ConfigurationTarget.Workspace);
    this.scanWorkspace();
  }

  private getHtmlContent(extensionUri: vscode.Uri): string {
    const nonce = getNonce();
    const shieldUri = this.panel.webview.asWebviewUri(
      vscode.Uri.joinPath(extensionUri, 'media', 'shield-only.svg')
    );
    const maatLogoUri = this.panel.webview.asWebviewUri(
      vscode.Uri.joinPath(extensionUri, 'media', 'SecureScannerLogo.png')
    );

    return /*html*/ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${this.panel.webview.cspSource}; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}'; connect-src https://api.osv.dev;">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Security Dashboard</title>
  <style nonce="${nonce}">
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: var(--vscode-font-family);
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
      padding: 20px;
    }
    .branding-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--vscode-panel-border);
    }
    .branding-header .branding-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .branding-header .branding-title {
      font-size: 1.6em;
      font-weight: bold;
    }
    .branding-header .branding-sub {
      font-size: 0.8em;
      opacity: 0.6;
    }
    .shield-logo {
      position: relative;
      width: 60px;
      height: 69px;
      flex-shrink: 0;
    }
    .shield-logo .shield-bg {
      width: 100%;
      height: 100%;
    }
    .shield-logo .inner-logo {
      position: absolute;
      top: 42%;
      left: 50%;
      width: 32px;
      height: 32px;
      transform: translate(-50%, -50%);
      border-radius: 4px;
    }
    .disclaimer {
      margin-top: 32px;
      padding: 16px;
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      background: var(--vscode-editorGroupHeader-tabsBackground);
      font-size: 0.78em;
      line-height: 1.5;
      opacity: 0.75;
    }
    .disclaimer strong { opacity: 1; }
    h1 { font-size: 1.6em; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
      margin-bottom: 24px;
    }
    .card {
      padding: 16px;
      border-radius: 8px;
      text-align: center;
      border: 1px solid var(--vscode-panel-border);
    }
    .card .count { font-size: 2em; font-weight: bold; }
    .card .label { font-size: 0.85em; opacity: 0.8; margin-top: 4px; }
    .card.critical { border-left: 4px solid #f44336; }
    .card.high { border-left: 4px solid #ff9800; }
    .card.medium { border-left: 4px solid #ffc107; }
    .card.low { border-left: 4px solid #2196f3; }
    .card.info { border-left: 4px solid #9e9e9e; }
    .card.total { border-left: 4px solid var(--vscode-focusBorder); }
    .toolbar {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      flex-wrap: wrap;
      align-items: center;
    }
    .toolbar select, .toolbar input, .toolbar button {
      padding: 6px 10px;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      border-radius: 4px;
      font-size: 0.9em;
    }
    .toolbar button {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      border: none;
      cursor: pointer;
      font-weight: 500;
    }
    .toolbar button:hover { background: var(--vscode-button-secondaryHoverBackground); }
    .toolbar button.primary-btn {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      font-weight: bold;
      padding: 8px 16px;
      font-size: 0.95em;
    }
    .toolbar button.primary-btn:hover { background: var(--vscode-button-hoverBackground); }
    .toolbar button:disabled { opacity: 0.5; cursor: not-allowed; }
    .scanning-indicator {
      display: none;
      align-items: center;
      gap: 8px;
      color: var(--vscode-descriptionForeground);
      font-style: italic;
    }
    .scanning-indicator.active { display: flex; }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9em;
    }
    th {
      text-align: left;
      padding: 8px 12px;
      background: var(--vscode-editorGroupHeader-tabsBackground);
      border-bottom: 2px solid var(--vscode-panel-border);
      cursor: pointer;
      user-select: none;
    }
    th:hover { background: var(--vscode-list-hoverBackground); }
    td {
      padding: 8px 12px;
      border-bottom: 1px solid var(--vscode-panel-border);
    }
    tr:hover { background: var(--vscode-list-hoverBackground); }
    tr.clickable { cursor: pointer; }
    .severity-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.8em;
      font-weight: bold;
    }
    .severity-badge.critical { background: #f44336; color: white; }
    .severity-badge.high { background: #ff9800; color: white; }
    .severity-badge.medium { background: #ffc107; color: #333; }
    .severity-badge.low { background: #2196f3; color: white; }
    .severity-badge.info { background: #9e9e9e; color: white; }
    .update-btn {
      background: #388e3c !important;
      color: white !important;
      font-weight: bold;
    }
    .update-btn:hover { background: #2e7d32 !important; }
    .update-btn:disabled { background: #666 !important; opacity: 0.6; }
    .check-updates-btn {
      background: var(--vscode-button-background) !important;
      color: var(--vscode-button-foreground) !important;
      font-weight: bold;
      font-size: 0.95em;
      padding: 8px 18px !important;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .check-updates-btn:hover { background: var(--vscode-button-hoverBackground) !important; }
    .check-updates-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .pkg-update-btn {
      background: #388e3c;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 4px 12px;
      font-size: 0.85em;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
    }
    .pkg-update-btn:hover { background: #2e7d32; }
    .pkg-update-btn:disabled { background: #666; opacity: 0.5; cursor: not-allowed; }
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      opacity: 0.6;
    }
    .empty-state h2 { margin-bottom: 8px; }
    .toggle-switch {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85em;
    }
    .toggle-switch input[type="checkbox"] {
      appearance: none;
      -webkit-appearance: none;
      width: 36px;
      height: 20px;
      background: var(--vscode-input-background);
      border: 1px solid var(--vscode-input-border);
      border-radius: 10px;
      position: relative;
      cursor: pointer;
      transition: background 0.2s;
    }
    .toggle-switch input[type="checkbox"]::before {
      content: '';
      position: absolute;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--vscode-input-foreground);
      top: 2px;
      left: 2px;
      transition: transform 0.2s;
    }
    .toggle-switch input[type="checkbox"]:checked {
      background: var(--vscode-button-background);
      border-color: var(--vscode-button-background);
    }
    .toggle-switch input[type="checkbox"]:checked::before {
      transform: translateX(16px);
    }
    .toggle-switch label {
      cursor: pointer;
      user-select: none;
    }
  </style>
</head>
<body>
  <div class="branding-header">
    <div class="shield-logo" id="shieldLogo">
      <img class="shield-bg" src="${shieldUri}" alt="SecureScanner Shield" />
      <img class="inner-logo" src="${maatLogoUri}" alt="MaatInICT" />
    </div>
    <div class="branding-text">
      <span class="branding-title">SecureScanner</span>
      <span class="branding-sub">Powered by MaatInICT B.V. &mdash; Quality Engineering &amp; Identity Expertise</span>
    </div>
  </div>
  <h1>Security Dashboard</h1>
  <div class="summary-cards" id="summaryCards"></div>
  <div class="toolbar">
    <select id="filterSeverity">
      <option value="all">All Severities</option>
      <option value="0">Critical</option>
      <option value="1">High</option>
      <option value="2">Medium</option>
      <option value="3">Low</option>
      <option value="4">Info</option>
    </select>
    <select id="filterCategory">
      <option value="all">All Categories</option>
      <option value="credential">Credentials</option>
      <option value="owasp">OWASP</option>
      <option value="dependency">Dependencies</option>
      <option value="misconfiguration">Misconfigurations</option>
      <option value="filehygiene">File Hygiene</option>
    </select>
    <input type="text" id="searchInput" placeholder="Search findings...">
    <button id="scanWorkspaceBtn" class="primary-btn">&#128269; Scan Workspace</button>
<button id="refreshBtn">&#8635; Refresh</button>
    <button id="exportBtn">&#128190; Export Report</button>
  </div>
  <div class="toolbar" style="margin-top: -8px; margin-bottom: 16px; border-top: 1px solid var(--vscode-panel-border); padding-top: 8px;">
    <div class="toggle-switch">
      <input type="checkbox" id="testEnvToggle" />
      <label for="testEnvToggle">Test Environment</label>
    </div>
    <span style="opacity: 0.3; margin: 0 4px;">|</span>
    <span style="font-size: 0.85em; opacity: 0.7;">Vulnerability Database:</span>
    <span id="vulnDbInfo" style="font-size: 0.85em; opacity: 0.7;">Built-in rules loaded</span>
    <button id="updateVulnDbBtn" class="update-btn">&#127760; Update CVE Database</button>
    <span id="vulnDbStatusText" style="font-size: 0.85em; display: none;"></span>
  </div>
  <div id="content"></div>

  <div style="margin-top: 24px; border-top: 2px solid var(--vscode-panel-border); padding-top: 16px;">
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
      <h2 style="margin: 0; font-size: 1.2em;">&#128230; Pip Package Updates</h2>
      <button id="checkPipUpdatesBtn" class="check-updates-btn">&#128269; Check for Updates</button>
      <span id="pipUpdateStatusText" style="font-size: 0.85em; display: none;"></span>
    </div>
    <div id="pipUpdatesContent" style="font-size: 0.85em; opacity: 0.7;">Click "Check for Updates" to scan requirements.txt files for outdated packages.</div>
  </div>

  <div class="disclaimer">
    <strong>Disclaimer</strong><br>
    SecureScanner is a free tool provided by <strong>MaatInICT B.V.</strong> on an "as is" basis, without warranties or guarantees of any kind, either express or implied.
    This tool is intended to assist in identifying potential security issues in your codebase, but it does not guarantee the detection of all vulnerabilities nor the absence of false positives.
    By using SecureScanner, you acknowledge and agree that:<br><br>
    &bull; You use this tool entirely at your own risk and responsibility.<br>
    &bull; MaatInICT B.V. shall not be held liable for any damages, losses, security breaches, or other consequences arising from the use of, or reliance on, this tool.<br>
    &bull; This tool does not replace professional security audits, penetration testing, or expert review.<br>
    &bull; Scan results should be validated and verified by qualified personnel before taking action.<br><br>
    &copy; MaatInICT B.V. &mdash; Quality Engineering &amp; Identity Expertise
  </div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    let allFindings = [];

    const severityNames = ['Critical', 'High', 'Medium', 'Low', 'Info'];
    const severityClasses = ['critical', 'high', 'medium', 'low', 'info'];

    function esc(value) {
      return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function renderSummary(findings) {
      const cards = document.getElementById('summaryCards');
      const counts = [0, 0, 0, 0, 0];
      findings.forEach(f => counts[f.severity]++);

      let html = '<div class="card total"><div class="count">' + findings.length + '</div><div class="label">Total</div></div>';
      severityNames.forEach((name, i) => {
        html += '<div class="card ' + severityClasses[i] + '"><div class="count">' + counts[i] + '</div><div class="label">' + name + '</div></div>';
      });
      cards.innerHTML = html;
    }

    function renderFindings(findings) {
      const content = document.getElementById('content');

      if (findings.length === 0) {
        content.innerHTML = '<div class="empty-state"><h2>No security issues found</h2><p>Click <strong>"Scan Workspace"</strong> above to scan all files in your project.</p></div>';
        return;
      }

      let html = '<table><thead><tr>';
      html += '<th>Severity</th><th>ID</th><th>Title</th><th>Category</th><th>File</th><th>Line</th>';
      html += '</tr></thead><tbody>';

      findings.forEach((f, idx) => {
        const fileName = f.location.filePath.split(/[\\/\\\\]/).pop();
        html += '<tr class="clickable" data-index="' + idx + '">';
        html += '<td><span class="severity-badge ' + severityClasses[f.severity] + '">' + severityNames[f.severity] + '</span></td>';
        html += '<td>' + esc(f.id) + '</td>';
        html += '<td>' + esc(f.title) + '</td>';
        html += '<td>' + esc(f.category) + '</td>';
        html += '<td>' + esc(fileName) + '</td>';
        html += '<td>' + (f.location.startLine + 1) + '</td>';
        html += '</tr>';
      });

      html += '</tbody></table>';
      content.innerHTML = html;

      document.querySelectorAll('tr.clickable').forEach(row => {
        row.addEventListener('click', () => {
          const idx = parseInt(row.getAttribute('data-index'));
          vscode.postMessage({ command: 'navigateToFinding', finding: findings[idx] });
        });
      });
    }

    function applyFilters() {
      const severity = document.getElementById('filterSeverity').value;
      const category = document.getElementById('filterCategory').value;
      const search = document.getElementById('searchInput').value.toLowerCase();

      let filtered = allFindings;
      if (severity !== 'all') {
        filtered = filtered.filter(f => f.severity === parseInt(severity));
      }
      if (category !== 'all') {
        filtered = filtered.filter(f => f.category === category);
      }
      if (search) {
        filtered = filtered.filter(f =>
          f.title.toLowerCase().includes(search) ||
          f.description.toLowerCase().includes(search) ||
          f.id.toLowerCase().includes(search)
        );
      }

      renderFindings(filtered);
    }

    document.getElementById('filterSeverity').addEventListener('change', applyFilters);
    document.getElementById('filterCategory').addEventListener('change', applyFilters);
    document.getElementById('searchInput').addEventListener('input', applyFilters);
    document.getElementById('scanWorkspaceBtn').addEventListener('click', () => {
      document.getElementById('scanWorkspaceBtn').disabled = true;
      document.getElementById('scanWorkspaceBtn').textContent = 'Scanning...';
      vscode.postMessage({ command: 'scanWorkspace' });
    });
    document.getElementById('refreshBtn').addEventListener('click', () => {
      vscode.postMessage({ command: 'refresh' });
    });
    document.getElementById('exportBtn').addEventListener('click', () => {
      vscode.postMessage({ command: 'exportReport' });
    });
    document.getElementById('testEnvToggle').addEventListener('change', (e) => {
      vscode.postMessage({ command: 'toggleTestEnvironment', value: e.target.checked });
    });
    document.getElementById('checkPipUpdatesBtn').addEventListener('click', () => {
      const btn = document.getElementById('checkPipUpdatesBtn');
      const statusText = document.getElementById('pipUpdateStatusText');
      btn.disabled = true;
      btn.textContent = 'Checking...';
      statusText.style.display = 'inline';
      statusText.textContent = 'Querying package index...';
      statusText.style.color = 'var(--vscode-descriptionForeground)';
      vscode.postMessage({ command: 'checkPipUpdates' });
    });

    document.getElementById('updateVulnDbBtn').addEventListener('click', () => {
      const btn = document.getElementById('updateVulnDbBtn');
      const statusText = document.getElementById('vulnDbStatusText');
      btn.disabled = true;
      btn.textContent = 'Updating...';
      statusText.style.display = 'inline';
      statusText.textContent = 'Fetching latest CVE data from OSV.dev...';
      statusText.style.color = 'var(--vscode-descriptionForeground)';
      vscode.postMessage({ command: 'updateVulnDb' });
    });

    window.addEventListener('message', event => {
      const message = event.data;
      if (message.type === 'findings') {
        allFindings = message.data;
        if (message.isTestEnvironment !== undefined) {
          document.getElementById('testEnvToggle').checked = message.isTestEnvironment;
        }
        renderSummary(allFindings);
        applyFilters();
      }
      if (message.type === 'scanStatus') {
        const btn = document.getElementById('scanWorkspaceBtn');
        if (message.status === 'done') {
          btn.disabled = false;
          btn.innerHTML = '&#128269; Scan Workspace';
        }
      }
      if (message.type === 'pipUpdateStatus') {
        const btn = document.getElementById('checkPipUpdatesBtn');
        const statusText = document.getElementById('pipUpdateStatusText');
        const content = document.getElementById('pipUpdatesContent');
        if (message.status === 'checking') {
          btn.disabled = true;
          btn.textContent = 'Checking...';
        }
        if (message.status === 'done') {
          btn.disabled = false;
          btn.innerHTML = '&#128269; Check for Updates';
          const packages = message.packages || [];
          if (packages.length === 0) {
            content.innerHTML = '<div style="padding: 12px; opacity: 0.7;">All pip packages are up to date.</div>';
            statusText.style.display = 'inline';
            statusText.textContent = 'All up to date!';
            statusText.style.color = '#4caf50';
          } else {
            let html = '<div style="font-size: 0.85em; opacity: 0.7; margin-bottom: 8px;">Source: ' + esc(message.indexUrl || 'PyPI') + '</div>';
            html += '<table><thead><tr>';
            html += '<th>Package</th><th>Current Version</th><th>Latest Version</th><th>Source</th><th>Action</th>';
            html += '</tr></thead><tbody>';
            packages.forEach(function(pkg) {
              html += '<tr>';
              html += '<td><strong>' + esc(pkg.name) + '</strong></td>';
              html += '<td><span class="severity-badge medium">' + esc(pkg.currentVersion) + '</span></td>';
              html += '<td><span class="severity-badge info" style="background: #4caf50; color: white;">' + esc(pkg.latestVersion) + '</span></td>';
              html += '<td style="opacity: 0.7; font-size: 0.9em;">' + (pkg.source === 'installed' ? '&#128187; pip list' : '&#128196; requirements.txt') + '</td>';
              html += '<td><button class="pkg-update-btn" data-pkg="' + esc(pkg.name) + '">&#11014; Update</button></td>';
              html += '</tr>';
            });
            html += '</tbody></table>';
            content.innerHTML = html;
            content.querySelectorAll('.pkg-update-btn').forEach(function(btn) {
              btn.addEventListener('click', function() {
                var pkgName = btn.getAttribute('data-pkg');
                btn.disabled = true;
                btn.textContent = 'Updating...';
                vscode.postMessage({ command: 'updatePipPackage', packageName: pkgName });
              });
            });
            statusText.style.display = 'inline';
            statusText.textContent = packages.length + ' update(s) available';
            statusText.style.color = '#ff9800';
          }
          setTimeout(function() { statusText.style.display = 'none'; }, 5000);
        }
        if (message.status === 'error') {
          btn.disabled = false;
          btn.innerHTML = '&#128269; Check for Updates';
          statusText.style.display = 'inline';
          statusText.textContent = 'Check failed - verify connection and index URL';
          statusText.style.color = '#f44336';
          content.innerHTML = '<div style="padding: 12px; color: #f44336;">Failed to check for updates. Please verify your internet connection and pip index URL setting.</div>';
        }
      }
      if (message.type === 'pipPackageUpdateStarted') {
        var updatingBtn = document.querySelector('.pkg-update-btn[data-pkg="' + message.packageName + '"]');
        if (updatingBtn) {
          updatingBtn.disabled = true;
          updatingBtn.textContent = 'Opened in terminal';
        }
      }
      if (message.type === 'vulnDbStatus') {
        const btn = document.getElementById('updateVulnDbBtn');
        const statusText = document.getElementById('vulnDbStatusText');
        const infoText = document.getElementById('vulnDbInfo');
        if (message.status === 'done') {
          btn.disabled = false;
          btn.innerHTML = '&#127760; Update CVE Database';
          statusText.style.display = 'inline';
          statusText.textContent = 'Updated successfully!';
          statusText.style.color = '#4caf50';
          infoText.textContent = message.npmCount + ' npm + ' + message.pipCount + ' pip vulnerabilities loaded';
          setTimeout(() => { statusText.style.display = 'none'; }, 5000);
        }
        if (message.status === 'error') {
          btn.disabled = false;
          btn.innerHTML = '&#127760; Update CVE Database';
          statusText.style.display = 'inline';
          statusText.textContent = 'Update failed - check internet connection';
          statusText.style.color = '#f44336';
        }
      }
    });
  </script>
</body>
</html>`;
  }

  private dispose(): void {
    DashboardPanel.currentPanel = undefined;
    this.panel.dispose();
    this.disposables.forEach(d => d.dispose());
  }
}

function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
