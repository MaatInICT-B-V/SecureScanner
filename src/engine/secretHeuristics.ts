/**
 * Shannon entropy of a string in bits per character. Random secrets (base64,
 * hex tokens) score high; dictionary words and short strings score low.
 */
export function shannonEntropy(value: string): number {
  if (!value) { return 0; }
  const freq = new Map<string, number>();
  for (const ch of value) {
    freq.set(ch, (freq.get(ch) || 0) + 1);
  }
  let entropy = 0;
  for (const count of freq.values()) {
    const p = count / value.length;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

// Structural markers that indicate the value is a reference/template, not a secret.
const PLACEHOLDER_PATTERNS: RegExp[] = [
  /\$\{[^}]*\}/,                 // ${VAR}
  /\$\([^)]*\)/,                 // $(VAR)
  /\{\{[^}]*\}\}/,              // {{ template }}
  /%[A-Za-z0-9_]+%/,            // %VAR% (Windows)
  /<[^>]+>/,                    // <your-token>
  /^process\.env\b/i,           // process.env.X
  /^os\.environ\b/i,            // os.environ[...]
  /^env\[/i,                    // ENV['X']
  /^System\.getenv\b/i,
];

// Strong placeholder indicators that may appear anywhere in the value.
const PLACEHOLDER_SUBSTRINGS = /(example|changeme|change[_-]?me|placeholder|your[_-]?|dummy|redacted|sample|xxxx+|\.\.\.|todo|fixme)/i;

// Values that, taken whole, are obviously not real secrets.
const PLACEHOLDER_WORDS = new Set([
  'changeme', 'password', 'passwd', 'secret', 'apikey', 'api_key', 'token',
  'example', 'placeholder', 'dummy', 'test', 'testing', 'redacted', 'sample',
  'none', 'null', 'undefined', 'nil', 'empty', 'default', 'notset', 'not_set',
  'enter', 'insert', 'replace', 'todo', 'fixme', 'foo', 'bar', 'baz', 'qux',
  'admin', 'root', 'user', 'username', 'abc123', '123456', '12345678', 'string',
  'value', 'mykey', 'mysecret', 'mypassword', 'yourkey', 'yoursecret',
]);

/**
 * Heuristically decide whether a captured value is a placeholder rather than a
 * real secret. Used to suppress noise from .env templates, config samples,
 * environment-variable references and validation text.
 */
export function isPlaceholder(value: string): boolean {
  const v = value.trim();
  if (v.length === 0) { return true; }

  // Repeated single character: xxxx, ****, ....
  if (/^(.)\1+$/.test(v)) { return true; }

  for (const re of PLACEHOLDER_PATTERNS) {
    if (re.test(v)) { return true; }
  }

  if (PLACEHOLDER_WORDS.has(v.toLowerCase())) { return true; }

  if (PLACEHOLDER_SUBSTRINGS.test(v)) { return true; }

  return false;
}
