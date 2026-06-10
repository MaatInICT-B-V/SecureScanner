import * as semver from 'semver';

export type Ecosystem = 'npm' | 'PyPI';

export interface ResolvedDependency {
  ecosystem: Ecosystem;
  name: string;
  version: string;
  /** true when the version comes from a lockfile/pin, false for a range's lower bound. */
  resolved: boolean;
  /** File the finding should point at. */
  manifestPath: string;
  /** 0-based line within manifestPath, or 0 if not located. */
  line: number;
}

/** Find the 0-based line index of the first line containing the needle. */
function findLine(content: string, needle: string): number {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(needle)) {
      return i;
    }
  }
  return 0;
}

/**
 * Parse a package-lock.json. Handles lockfile v2/v3 (the flat `packages` map,
 * which includes transitive dependencies with resolved versions) and falls back
 * to v1 (the nested `dependencies` tree).
 */
export function parsePackageLock(content: string, manifestPath: string): ResolvedDependency[] {
  const deps: ResolvedDependency[] = [];
  let lock: unknown;
  try {
    lock = JSON.parse(content);
  } catch {
    return deps;
  }
  if (!lock || typeof lock !== 'object') { return deps; }
  const lockObj = lock as Record<string, unknown>;

  // v2 / v3: flat "packages" map keyed by install path ("node_modules/<name>...").
  const packages = lockObj.packages as Record<string, { version?: string; name?: string; link?: boolean }> | undefined;
  if (packages) {
    for (const [pkgPath, info] of Object.entries(packages)) {
      if (!pkgPath || !info || info.link || !info.version) { continue; }
      const marker = 'node_modules/';
      const idx = pkgPath.lastIndexOf(marker);
      const name = info.name || (idx >= 0 ? pkgPath.substring(idx + marker.length) : pkgPath);
      if (!name) { continue; }
      deps.push({
        ecosystem: 'npm',
        name,
        version: info.version,
        resolved: true,
        manifestPath,
        line: findLine(content, `"${pkgPath}"`),
      });
    }
    if (deps.length > 0) { return deps; }
  }

  // v1: nested "dependencies" tree.
  const walk = (tree: Record<string, { version?: string; dependencies?: Record<string, unknown> }> | undefined): void => {
    if (!tree) { return; }
    for (const [name, info] of Object.entries(tree)) {
      if (info && info.version) {
        deps.push({
          ecosystem: 'npm',
          name,
          version: info.version,
          resolved: true,
          manifestPath,
          line: findLine(content, `"${name}"`),
        });
      }
      if (info && info.dependencies) {
        walk(info.dependencies as Record<string, { version?: string; dependencies?: Record<string, unknown> }>);
      }
    }
  };
  walk(lockObj.dependencies as Record<string, { version?: string; dependencies?: Record<string, unknown> }> | undefined);

  return deps;
}

/**
 * Parse declared dependencies from package.json. Used only when no lockfile is
 * present, so versions are the lower bound of the declared range. Unbounded
 * specs (*, latest, git/url/workspace protocols) are skipped — querying them
 * would produce noise rather than a meaningful match.
 */
export function parsePackageJson(content: string, manifestPath: string): ResolvedDependency[] {
  const deps: ResolvedDependency[] = [];
  let pkg: { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
  try {
    pkg = JSON.parse(content);
  } catch {
    return deps;
  }

  const all: Record<string, string> = { ...pkg.dependencies, ...pkg.devDependencies };
  for (const [name, range] of Object.entries(all)) {
    if (!range || range.includes(':') || range === '*' || range === 'x' || range === 'latest') {
      continue; // git/url/file/workspace protocol or unbounded range
    }
    const min = semver.minVersion(range);
    if (!min || min.version === '0.0.0') { continue; }
    deps.push({
      ecosystem: 'npm',
      name,
      version: min.version,
      resolved: false,
      manifestPath,
      line: findLine(content, `"${name}"`),
    });
  }
  return deps;
}

/** Normalize a PyPI project name per PEP 503. */
function normalizePyPiName(name: string): string {
  return name.toLowerCase().replace(/[-_.]+/g, '-');
}

/**
 * Parse requirements.txt. Pinned entries (==, ===) are treated as resolved;
 * lower-bound operators (>=, ~=) use the stated version as a best-effort lower
 * bound. Wildcards and unparseable lines are skipped.
 */
export function parseRequirementsTxt(content: string, manifestPath: string): ResolvedDependency[] {
  const deps: ResolvedDependency[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line || line.startsWith('#') || line.startsWith('-')) { continue; }
    // Strip inline comment and environment markers.
    line = line.split(' #')[0].split(';')[0].trim();

    const match = line.match(/^([A-Za-z0-9._-]+)\s*(?:\[[^\]]*\])?\s*(==|===|>=|~=)\s*([A-Za-z0-9.*+!-]+)/);
    if (!match) { continue; }

    const [, rawName, op, version] = match;
    if (version.includes('*')) { continue; }

    deps.push({
      ecosystem: 'PyPI',
      name: normalizePyPiName(rawName),
      version,
      resolved: op === '==' || op === '===',
      manifestPath,
      line: i,
    });
  }
  return deps;
}
