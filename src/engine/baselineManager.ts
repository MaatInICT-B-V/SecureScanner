import * as fs from 'fs';
import * as path from 'path';

export const BASELINE_FILENAME = '.securescanner-baseline.json';

interface BaselineFile {
  fingerprints: string[];
}

/**
 * Manages a per-workspace baseline of accepted findings. Findings whose
 * fingerprint is in the baseline are suppressed in future scans, letting users
 * permanently dismiss false positives without editing source files.
 */
export class BaselineManager {
  private fingerprints = new Set<string>();
  private loadedRoot: string | null = null;

  private baselinePath(root: string): string {
    return path.join(root, BASELINE_FILENAME);
  }

  /** Load the baseline for a workspace root if not already loaded for it. */
  ensureLoaded(root: string): void {
    if (this.loadedRoot === root) {
      return;
    }
    this.load(root);
  }

  load(root: string): void {
    this.loadedRoot = root;
    this.fingerprints.clear();
    try {
      const raw = fs.readFileSync(this.baselinePath(root), 'utf8');
      const parsed = JSON.parse(raw) as BaselineFile | string[];
      const list = Array.isArray(parsed) ? parsed : parsed.fingerprints;
      if (Array.isArray(list)) {
        for (const fp of list) {
          if (typeof fp === 'string') {
            this.fingerprints.add(fp);
          }
        }
      }
    } catch {
      // No baseline file yet, or it is unreadable — treat as empty.
    }
  }

  has(fingerprint: string): boolean {
    return this.fingerprints.has(fingerprint);
  }

  /** Add fingerprints to the baseline for a root and persist the file. */
  add(root: string, fingerprintsToAdd: string[]): void {
    this.ensureLoaded(root);
    for (const fp of fingerprintsToAdd) {
      this.fingerprints.add(fp);
    }
    this.save(root);
  }

  private save(root: string): void {
    const body: BaselineFile = { fingerprints: [...this.fingerprints].sort() };
    fs.writeFileSync(this.baselinePath(root), JSON.stringify(body, null, 2), 'utf8');
  }
}
