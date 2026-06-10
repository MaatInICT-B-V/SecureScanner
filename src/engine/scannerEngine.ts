import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { Finding, FindingCategory, Severity } from '../types/finding';
import { ScanContext } from '../types/scanner';
import { SecureScannerConfig, ProjectType } from '../types/config';
import { ScannerRegistry } from './scannerRegistry';
import { CredentialScanner } from '../scanners/credentialScanner';
import { OwaspScanner } from '../scanners/owaspScanner';
import { DependencyScanner } from '../scanners/dependencyScanner';
import { MisconfigScanner } from '../scanners/misconfigScanner';
import { FileHygieneScanner } from '../scanners/fileHygieneScanner';
import {
  ResolvedDependency,
  parsePackageLock,
  parsePackageJson,
  parseRequirementsTxt,
} from './dependencyResolver';
import { osvQueryBatch, osvGetVulns, osvSeverity, osvFixedVersion } from './osvClient';

export class ScannerEngine {
  private registry: ScannerRegistry;
  private _onFindingsChanged = new vscode.EventEmitter<Map<string, Finding[]>>();
  public readonly onFindingsChanged = this._onFindingsChanged.event;
  private findingsMap: Map<string, Finding[]> = new Map();

  private dependencyScanner: DependencyScanner;
  private fileHygieneScanner: FileHygieneScanner;
  // Dependency scanning is async (OSV network query), so it runs outside the
  // synchronous per-file registry loop. Concurrent triggers share one run.
  private depScanPromise: Promise<Finding[]> | null = null;
  private workspaceScanRunning = false;

  constructor() {
    this.registry = new ScannerRegistry();
    this.registry.register(new CredentialScanner());
    this.registry.register(new OwaspScanner());
    // Kept as a direct reference (not in the sync registry) for the offline
    // fallback path; dependency scanning runs via scanDependencies().
    this.dependencyScanner = new DependencyScanner();
    this.registry.register(new MisconfigScanner());
    this.fileHygieneScanner = new FileHygieneScanner();
    this.registry.register(this.fileHygieneScanner);
  }

  loadExternalVulnDb(vulnDbPath: string): void {
    try {
      const data = fs.readFileSync(vulnDbPath, 'utf8');
      const db = JSON.parse(data);
      const npm = Array.isArray(db.npmVulnerabilities) ? db.npmVulnerabilities : null;
      const pip = Array.isArray(db.pipVulnerabilities) ? db.pipVulnerabilities : null;

      if (!npm || !pip) {
        console.warn('SecureScanner: external vulnerability DB malformed, keeping built-in rules');
        return;
      }

      // Never let an empty external DB (e.g. an offline/failed update that wrote
      // empty arrays) replace the built-in rules — that would silently disable
      // dependency scanning on every startup. Keep the built-in rules instead.
      if (npm.length === 0 && pip.length === 0) {
        console.warn('SecureScanner: external vulnerability DB is empty, keeping built-in rules');
        return;
      }

      this.dependencyScanner.updateVulnerabilities(npm, pip);
    } catch {
      console.warn('SecureScanner: Could not load external vulnerability database');
    }
  }

  getConfig(): SecureScannerConfig {
    const config = vscode.workspace.getConfiguration('secureScanner');
    const thresholdStr = config.get<string>('severityThreshold', 'Low');
    const severityMap: Record<string, Severity> = {
      'Critical': Severity.Critical,
      'High': Severity.High,
      'Medium': Severity.Medium,
      'Low': Severity.Low,
      'Info': Severity.Info,
    };

    return {
      enableOnSave: config.get<boolean>('enableOnSave', true),
      enableOnOpen: config.get<boolean>('enableOnOpen', true),
      severityThreshold: severityMap[thresholdStr] ?? Severity.Low,
      ignorePaths: config.get<string[]>('ignorePaths', [
        '**/node_modules/**', '**/dist/**', '**/.git/**',
      ]),
      enabledCategories: config.get<FindingCategory[]>('enabledCategories', [
        FindingCategory.Credential,
        FindingCategory.OWASP,
        FindingCategory.Dependency,
        FindingCategory.Misconfiguration,
        FindingCategory.FileHygiene,
      ]),
      maxFileSizeKB: config.get<number>('maxFileSizeKB', 512),
      projectType: config.get<ProjectType>('projectType', 'auto'),
      isTestEnvironment: config.get<boolean>('isTestEnvironment', false),
      excludeFolders: config.get<string>('excludeFolders', 'results'),
      pipIndexUrl: config.get<string>('pipIndexUrl', 'https://pypi.org/pypi'),
      enableOsvOnlineScan: config.get<boolean>('enableOsvOnlineScan', true),
    };
  }

  scanDocument(document: vscode.TextDocument): Finding[] {
    const config = this.getConfig();
    const filePath = document.uri.fsPath;

    // Manifests/lockfiles are handled by the async dependency scan, which reads
    // them from disk directly (so it is not subject to the size limit below).
    // Skipped during a workspace scan, which runs the dependency scan once itself.
    if (!this.workspaceScanRunning && this.isManifestFile(filePath)) {
      void this.scanDependencies();
    }

    // Check file size
    const content = document.getText();
    if (content.length > config.maxFileSizeKB * 1024) {
      return [];
    }

    // Build effective ignore paths (add excludeFolders as glob patterns)
    const effectiveIgnorePaths = [...config.ignorePaths];
    const excludeFolders = config.excludeFolders
      .split(';')
      .map(f => f.trim())
      .filter(f => f.length > 0);
    for (const folder of excludeFolders) {
      effectiveIgnorePaths.push(`**/${folder}/**`);
    }

    // Check ignore paths
    for (const pattern of effectiveIgnorePaths) {
      const globPattern = pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/\\\\]*');
      if (new RegExp(globPattern).test(filePath.replace(/\\/g, '/'))) {
        return [];
      }
    }

    // Resolve project type for git-aware scanning
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    const workspaceRoot = workspaceFolder?.uri.fsPath || '';
    const isGitProject = workspaceRoot
      ? this.resolveIsGitProject(config.projectType, workspaceRoot)
      : true; // default to git when no workspace

    const context: ScanContext = {
      filePath,
      content,
      languageId: document.languageId,
      isGitProject,
      isTestEnvironment: config.isTestEnvironment,
    };

    const findings: Finding[] = [];
    const scanners = this.registry.getAll();

    for (const scanner of scanners) {
      // Check if category is enabled
      const scannerFindings = scanner.scan(context);
      const filtered = scannerFindings.filter(f => {
        if (!config.enabledCategories.includes(f.category)) {
          return false;
        }
        if (f.severity > config.severityThreshold) {
          return false;
        }
        return true;
      });
      findings.push(...filtered);
    }

    this.findingsMap.set(filePath, findings);
    this._onFindingsChanged.fire(this.findingsMap);
    return findings;
  }

  async scanWorkspace(): Promise<Finding[]> {
    this.findingsMap.clear();
    const allFindings: Finding[] = [];
    const config = this.getConfig();

    const effectiveIgnorePaths = [...config.ignorePaths];
    const excludeFolders = config.excludeFolders
      .split(';')
      .map(f => f.trim())
      .filter(f => f.length > 0);
    for (const folder of excludeFolders) {
      effectiveIgnorePaths.push(`**/${folder}/**`);
    }

    const ignorePattern = effectiveIgnorePaths.length > 0
      ? '{' + effectiveIgnorePaths.join(',') + '}'
      : undefined;

    const files = await vscode.workspace.findFiles(
      '**/*',
      ignorePattern,
      5000 // max files
    );

    // Suppress the per-file manifest trigger during the loop; dependencies are
    // scanned once explicitly below.
    this.workspaceScanRunning = true;
    for (const file of files) {
      try {
        const document = await vscode.workspace.openTextDocument(file);
        const findings = this.scanDocument(document);
        allFindings.push(...findings);
      } catch {
        // Skip files that can't be opened (binary, etc.)
      }
    }
    this.workspaceScanRunning = false;

    // Scan dependencies against OSV (or built-in rules offline).
    if (config.enabledCategories.includes(FindingCategory.Dependency)) {
      const depFindings = await this.scanDependencies();
      allFindings.push(...depFindings);
    }

    // Run workspace-level file hygiene checks (missing files, unignored sensitive files)
    if (config.enabledCategories.includes(FindingCategory.FileHygiene)) {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (workspaceFolders) {
        for (const folder of workspaceFolders) {
          const isGit = this.resolveIsGitProject(config.projectType, folder.uri.fsPath);
          const hygieneFindings = await this.fileHygieneScanner.scanWorkspace(folder.uri.fsPath, isGit);
          const filtered = hygieneFindings.filter(f => f.severity <= config.severityThreshold);
          allFindings.push(...filtered);

          // Store workspace-level findings under the workspace root path
          this.findingsMap.set(folder.uri.fsPath, filtered);
        }
        this._onFindingsChanged.fire(this.findingsMap);
      }
    }

    return allFindings;
  }

  private isManifestFile(filePath: string): boolean {
    const name = path.basename(filePath);
    return name === 'package.json' || name === 'package-lock.json' || name === 'requirements.txt';
  }

  /**
   * Scan the workspace's dependencies for known vulnerabilities. Concurrent
   * callers share a single in-flight run so rapid manifest saves do not trigger
   * redundant OSV queries. Findings are merged into the findings map and an
   * onFindingsChanged event is fired when the run completes.
   */
  scanDependencies(): Promise<Finding[]> {
    if (this.depScanPromise) {
      return this.depScanPromise;
    }
    this.depScanPromise = this.runDependencyScan().finally(() => {
      this.depScanPromise = null;
    });
    return this.depScanPromise;
  }

  private async runDependencyScan(): Promise<Finding[]> {
    const config = this.getConfig();
    if (!config.enabledCategories.includes(FindingCategory.Dependency)) {
      return [];
    }

    const manifests = await this.discoverManifests(config);
    if (manifests.length === 0) {
      return [];
    }

    const { deps, manifestFiles } = this.resolveDependencies(manifests);
    if (deps.length === 0) {
      return [];
    }

    let findings: Finding[];
    if (config.enableOsvOnlineScan) {
      try {
        findings = await this.scanWithOsv(deps);
      } catch {
        // OSV unreachable (offline, timeout, …): keep some signal via the
        // built-in rule list rather than reporting nothing.
        findings = this.scanWithBuiltinRules(manifestFiles);
      }
    } else {
      findings = this.scanWithBuiltinRules(manifestFiles);
    }

    findings = findings.filter(f => f.severity <= config.severityThreshold);
    this.mergeDependencyFindings(findings);
    this._onFindingsChanged.fire(this.findingsMap);
    return findings;
  }

  private async discoverManifests(
    config: SecureScannerConfig
  ): Promise<Array<{ path: string; content: string; fileName: string }>> {
    const effectiveIgnorePaths = [...config.ignorePaths];
    const excludeFolders = config.excludeFolders
      .split(';')
      .map(f => f.trim())
      .filter(f => f.length > 0);
    for (const folder of excludeFolders) {
      effectiveIgnorePaths.push(`**/${folder}/**`);
    }
    // Always skip nested node_modules manifests; the root lockfile already
    // carries transitive dependencies.
    if (!effectiveIgnorePaths.some(p => p.includes('node_modules'))) {
      effectiveIgnorePaths.push('**/node_modules/**');
    }

    const ignorePattern = effectiveIgnorePaths.length > 0
      ? '{' + effectiveIgnorePaths.join(',') + '}'
      : undefined;

    const files = await vscode.workspace.findFiles(
      '**/{package.json,package-lock.json,requirements.txt}',
      ignorePattern,
      2000
    );

    const out: Array<{ path: string; content: string; fileName: string }> = [];
    for (const file of files) {
      try {
        // Read directly from disk so large lockfiles are not subject to the
        // editor's maxFileSizeKB limit.
        const content = fs.readFileSync(file.fsPath, 'utf8');
        out.push({ path: file.fsPath, content, fileName: path.basename(file.fsPath) });
      } catch {
        // Skip unreadable files.
      }
    }
    return out;
  }

  private resolveDependencies(
    manifests: Array<{ path: string; content: string; fileName: string }>
  ): { deps: ResolvedDependency[]; manifestFiles: Array<{ path: string; content: string; fileName: string }> } {
    const byDir = new Map<string, { pkg?: typeof manifests[0]; lock?: typeof manifests[0] }>();
    const reqFiles: typeof manifests = [];
    const manifestFiles: typeof manifests = [];

    for (const m of manifests) {
      const dir = path.dirname(m.path);
      if (m.fileName === 'package.json') {
        const entry = byDir.get(dir) || {};
        entry.pkg = m;
        byDir.set(dir, entry);
        manifestFiles.push(m);
      } else if (m.fileName === 'package-lock.json') {
        const entry = byDir.get(dir) || {};
        entry.lock = m;
        byDir.set(dir, entry);
      } else if (m.fileName === 'requirements.txt') {
        reqFiles.push(m);
        manifestFiles.push(m);
      }
    }

    const deps: ResolvedDependency[] = [];
    for (const { pkg, lock } of byDir.values()) {
      // Prefer the lockfile (resolved + transitive); fall back to declared ranges.
      if (lock) {
        deps.push(...parsePackageLock(lock.content, lock.path));
      } else if (pkg) {
        deps.push(...parsePackageJson(pkg.content, pkg.path));
      }
    }
    for (const req of reqFiles) {
      deps.push(...parseRequirementsTxt(req.content, req.path));
    }

    return { deps, manifestFiles };
  }

  private async scanWithOsv(deps: ResolvedDependency[]): Promise<Finding[]> {
    const keyOf = (d: { ecosystem: string; name: string; version: string }) =>
      `${d.ecosystem}|${d.name}|${d.version}`;

    // One query per distinct (ecosystem, name, version).
    const uniqueQueries = new Map<string, { name: string; ecosystem: string; version: string }>();
    for (const d of deps) {
      const k = keyOf(d);
      if (!uniqueQueries.has(k)) {
        uniqueQueries.set(k, { name: d.name, ecosystem: d.ecosystem, version: d.version });
      }
    }
    const queries = [...uniqueQueries.values()];
    const idsPerQuery = await osvQueryBatch(queries);

    const idsByKey = new Map<string, string[]>();
    queries.forEach((q, i) => idsByKey.set(keyOf(q), idsPerQuery[i] || []));

    const allIds = idsPerQuery.flat();
    if (allIds.length === 0) {
      return [];
    }
    const details = await osvGetVulns(allIds);

    const findings: Finding[] = [];
    const seen = new Set<string>();
    for (const d of deps) {
      const ids = idsByKey.get(keyOf(d)) || [];
      for (const id of ids) {
        const dedupKey = `${d.manifestPath}|${d.name}|${id}`;
        if (seen.has(dedupKey)) { continue; }
        seen.add(dedupKey);

        const detail = details.get(id);
        const severity = detail ? osvSeverity(detail) : 'medium';
        const fixed = detail ? osvFixedVersion(detail, d.name, d.ecosystem) : '';
        const summary =
          detail?.summary || detail?.details?.substring(0, 200) || 'Known security vulnerability';
        const fixNote = fixed ? ` Update to ${fixed} or later.` : '';
        const versionNote = d.resolved ? '' : ' (declared range lower bound)';

        findings.push({
          id: `DEP-${id}`,
          category: FindingCategory.Dependency,
          severity: this.mapSeverityString(severity),
          title: `Vulnerable dependency: ${d.name}@${d.version}${versionNote}`,
          description: `${summary} (${id}).${fixNote}`,
          location: {
            filePath: d.manifestPath,
            startLine: d.line,
            startColumn: 0,
            endLine: d.line,
            endColumn: 1000,
          },
          cweId: 'CWE-1035',
        });
      }
    }
    return findings;
  }

  private scanWithBuiltinRules(
    manifestFiles: Array<{ path: string; content: string; fileName: string }>
  ): Finding[] {
    const findings: Finding[] = [];
    for (const m of manifestFiles) {
      const context: ScanContext = {
        filePath: m.path,
        content: m.content,
        languageId: '',
        isTestEnvironment: false,
      };
      findings.push(...this.dependencyScanner.scan(context));
    }
    return findings;
  }

  /**
   * Replace dependency findings everywhere with a fresh set, preserving findings
   * from other categories on the same files (e.g. a secret inside package.json).
   */
  private mergeDependencyFindings(findings: Finding[]): void {
    for (const [filePath, existing] of this.findingsMap) {
      const nonDep = existing.filter(f => f.category !== FindingCategory.Dependency);
      if (nonDep.length !== existing.length) {
        this.findingsMap.set(filePath, nonDep);
      }
    }
    const byPath = new Map<string, Finding[]>();
    for (const f of findings) {
      const arr = byPath.get(f.location.filePath) || [];
      arr.push(f);
      byPath.set(f.location.filePath, arr);
    }
    for (const [filePath, depFindings] of byPath) {
      const existing = this.findingsMap.get(filePath) || [];
      this.findingsMap.set(filePath, [...existing, ...depFindings]);
    }
  }

  private mapSeverityString(severity: 'critical' | 'high' | 'medium' | 'low'): Severity {
    switch (severity) {
      case 'critical': return Severity.Critical;
      case 'high': return Severity.High;
      case 'medium': return Severity.Medium;
      case 'low': return Severity.Low;
      default: return Severity.Info;
    }
  }

  getAllFindings(): Map<string, Finding[]> {
    return new Map(this.findingsMap);
  }

  clearFindings(): void {
    this.findingsMap.clear();
    this._onFindingsChanged.fire(this.findingsMap);
  }

  /**
   * Resolve whether this is a git project based on the projectType setting.
   * 'auto' checks for the existence of a .git folder in the workspace root.
   */
  private resolveIsGitProject(projectType: ProjectType, workspaceRoot: string): boolean {
    if (projectType === 'git') {
      return true;
    }
    if (projectType === 'local') {
      return false;
    }
    // auto: check if .git directory exists
    return fs.existsSync(path.join(workspaceRoot, '.git'));
  }

  dispose(): void {
    this._onFindingsChanged.dispose();
  }
}
