/**
 * Convert a glob pattern to an anchored RegExp. Unlike a naive
 * replace('*', '.*'), this escapes regex metacharacters (notably '.') and
 * anchors the result, so '*.min.js' no longer also matches 'admin.json'.
 *
 *  - `**` matches across path separators
 *  - `*`  matches anything except '/'
 *  - `?`  matches a single character except '/'
 */
export function globToRegExp(glob: string): RegExp {
  let re = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*') {
      if (glob[i + 1] === '*') {
        re += '.*';
        i++;
        // Let `**/` also match zero leading directories.
        if (glob[i + 1] === '/') {
          i++;
          re += '(?:/)?';
        }
      } else {
        re += '[^/]*';
      }
    } else if (c === '?') {
      re += '[^/]';
    } else if ('\\^$.|+()[]{}'.includes(c)) {
      re += '\\' + c;
    } else {
      re += c;
    }
  }
  return new RegExp('^' + re + '$');
}

/**
 * Test a file path against a glob. Patterns without a '/' are matched against
 * the basename (gitignore-style), so '*.min.js' matches files in any directory
 * while '**\/dist\/**' is matched against the full normalized path.
 */
export function matchesGlob(filePath: string, glob: string): boolean {
  const normalized = filePath.replace(/\\/g, '/');
  const target = glob.includes('/') ? normalized : normalized.split('/').pop() || normalized;
  return globToRegExp(glob).test(target);
}

/** True if the path matches any of the given globs. */
export function matchesAnyGlob(filePath: string, globs: string[]): boolean {
  return globs.some(g => matchesGlob(filePath, g));
}
