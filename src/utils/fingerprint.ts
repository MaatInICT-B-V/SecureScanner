/**
 * FNV-1a 32-bit hash, returned as zero-padded hex. Deterministic and
 * dependency-free — used to fingerprint findings for the baseline without
 * storing the underlying (possibly secret) matched text.
 */
export function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    // 32-bit FNV prime multiply via shifts to stay in integer range.
    hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

/** Basename of a path, handling both separators. */
function basename(filePath: string): string {
  return filePath.split(/[/\\]/).pop() || filePath;
}

/**
 * Stable fingerprint for a finding. Independent of line number (so it survives
 * edits elsewhere in the file) and of the absolute path (so it is portable
 * across machines). The snippet is hashed, never stored in clear.
 */
export function computeFingerprint(ruleId: string, filePath: string, snippet: string): string {
  return fnv1a(`${ruleId}|${basename(filePath)}|${snippet}`);
}
