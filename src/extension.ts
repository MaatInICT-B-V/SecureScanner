import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ScannerEngine } from './engine/scannerEngine';
import { DiagnosticsProvider } from './providers/diagnosticsProvider';
import { FindingsTreeViewProvider } from './providers/treeViewProvider';
import { SecurityCodeActionProvider } from './providers/codeActionProvider';
import { SecurityHoverProvider } from './providers/hoverProvider';
import { DashboardPanel } from './webview/dashboardPanel';
import { debounceByKey } from './utils/debounce';
import { getLineCommentMarker } from './engine/ruleEngine';

let engine: ScannerEngine;

export function activate(context: vscode.ExtensionContext): void {
  engine = new ScannerEngine();

  // Load previously saved vulnerability database if it exists
  const globalStoragePath = context.globalStorageUri.fsPath;
  const vulnDbPath = path.join(globalStoragePath, 'vulnDb.json');
  if (fs.existsSync(vulnDbPath)) {
    engine.loadExternalVulnDb(vulnDbPath);
  }

  // Providers
  const diagnosticsProvider = new DiagnosticsProvider(engine);
  const treeViewProvider = new FindingsTreeViewProvider(engine);
  const hoverProvider = new SecurityHoverProvider(engine);
  const codeActionProvider = new SecurityCodeActionProvider();

  // Register tree view
  const treeView = vscode.window.createTreeView('secureScanner.findings', {
    treeDataProvider: treeViewProvider,
    showCollapseAll: true,
  });

  // Register hover provider for all languages
  context.subscriptions.push(
    vscode.languages.registerHoverProvider({ scheme: 'file' }, hoverProvider)
  );

  // Register code action provider
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      { scheme: 'file' },
      codeActionProvider,
      { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }
    )
  );

  // Debounced scan function, keyed per document so that "Save All" (which fires
  // one save event per document) scans every document instead of just the last.
  const debouncedScan = debounceByKey(
    (document: vscode.TextDocument) => {
      engine.scanDocument(document);
    },
    300,
    document => document.uri.toString()
  );

  // Auto-scan on save
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(document => {
      const config = vscode.workspace.getConfiguration('secureScanner');
      if (config.get<boolean>('enableOnSave', true)) {
        debouncedScan(document);
      }
    })
  );

  // Auto-scan on open
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(document => {
      const config = vscode.workspace.getConfiguration('secureScanner');
      if (config.get<boolean>('enableOnOpen', true)) {
        debouncedScan(document);
      }
    })
  );

  // Auto-scan on active editor change
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(editor => {
      if (editor) {
        const config = vscode.workspace.getConfiguration('secureScanner');
        if (config.get<boolean>('enableOnOpen', true)) {
          debouncedScan(editor.document);
        }
      }
    })
  );

  // Commands
  context.subscriptions.push(
    vscode.commands.registerCommand('secureScanner.scanFile', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const findings = engine.scanDocument(editor.document);
        vscode.window.showInformationMessage(
          `SecureScanner: Found ${findings.length} issue(s) in ${editor.document.fileName.split(/[/\\]/).pop()}`
        );
      } else {
        vscode.window.showWarningMessage('SecureScanner: No active file to scan.');
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('secureScanner.scanWorkspace', async () => {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'SecureScanner: Scanning workspace...',
          cancellable: false,
        },
        async () => {
          const findings = await engine.scanWorkspace();
          vscode.window.showInformationMessage(
            `SecureScanner: Workspace scan complete. Found ${findings.length} issue(s).`
          );
        }
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('secureScanner.openDashboard', () => {
      DashboardPanel.createOrShow(engine, context.extensionUri, context.globalStorageUri);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('secureScanner.clearFindings', () => {
      engine.clearFindings();
      diagnosticsProvider.clear();
      vscode.window.showInformationMessage('SecureScanner: All findings cleared.');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('secureScanner.suppressFinding', (document: vscode.TextDocument, diagnostic: vscode.Diagnostic) => {
      const edit = new vscode.WorkspaceEdit();
      const line = document.lineAt(diagnostic.range.start.line);
      // diagnostic.code is "RULE-ID (CWE-xxx)" when a CWE is attached — keep only
      // the rule id so the engine can match the suppression token.
      const rawCode = typeof diagnostic.code === 'object' ? diagnostic.code.value : diagnostic.code;
      const ruleId = String(rawCode ?? '').split(/\s+/)[0];
      const marker = getLineCommentMarker(document.languageId);
      edit.insert(
        document.uri,
        line.range.end,
        ` ${marker} securescanner-ignore ${ruleId}`
      );
      vscode.workspace.applyEdit(edit);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('secureScanner.moveToEnv', (_document: vscode.TextDocument, _range: vscode.Range) => {
      vscode.window.showInformationMessage(
        'SecureScanner: Replace the hardcoded value with process.env.YOUR_VARIABLE_NAME and add the value to your .env file.'
      );
    })
  );

  // Register all disposables
  context.subscriptions.push(diagnosticsProvider, treeViewProvider, treeView, engine);

  // Scan currently open files on activation
  if (vscode.window.activeTextEditor) {
    engine.scanDocument(vscode.window.activeTextEditor.document);
  }

  // Auto-scan workspace on activation (runs in background)
  setTimeout(async () => {
    const config = vscode.workspace.getConfiguration('secureScanner');
    if (config.get<boolean>('enableOnOpen', true)) {
      const findings = await engine.scanWorkspace();
      if (findings.length > 0) {
        vscode.window.showInformationMessage(
          `SecureScanner: Found ${findings.length} security issue(s) in workspace. Click to view.`,
          'Open Dashboard'
        ).then(selection => {
          if (selection === 'Open Dashboard') {
            vscode.commands.executeCommand('secureScanner.openDashboard');
          }
        });
      }
    }
  }, 2000);

  // Status bar item
  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBar.text = '$(shield) SecureScanner';
  statusBar.command = 'secureScanner.openDashboard';
  statusBar.tooltip = 'Open Security Dashboard';
  statusBar.show();
  context.subscriptions.push(statusBar);
}

export function deactivate(): void {
  if (engine) {
    engine.dispose();
  }
}
