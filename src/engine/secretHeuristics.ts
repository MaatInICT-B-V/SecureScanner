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
  /\{[^}]*\}/,                  // {self.password} f-string, {{ template }}, {0} — any brace interpolation
  /%[A-Za-z0-9_]+%/,            // %VAR% (Windows)
  /<[^>]+>/,                    // <your-token>
  /^process\.env\b/i,           // process.env.X
  /^os\.environ\b/i,            // os.environ[...]
  /^env\[/i,                    // ENV['X']
  /^System\.getenv\b/i,
];

// Strong placeholder indicators that may appear anywhere in the value.
const PLACEHOLDER_SUBSTRINGS = /(example|changeme|change[_-]?me|placeholder|your[_-]?|dummy|redacted|sample|xxxx+|\.\.\.|todo|fixme)/i;

// Type annotations and code expressions captured from declarations like
// `password: Optional[str] = None` or `password: string | null`. These are
// parameter/field signatures, not literal secrets, so the captured "value"
// (Optional[str], str, string | null, …) must never be treated as a secret.
const TYPE_ANNOTATION = /^(?:Optional|Union|List|Dict|Set|Tuple|Sequence|Mapping|Iterable|Callable|Any|Type|str|int|float|bool|bytes|None|object|string|number|boolean|array|Array|Promise)\b|[[\]<>|]/;

// The value is the start of a function/method call rather than a literal
// secret: `config.get(`, `self._get_variable(`, `os.getenv(`, `getSecret(`.
// The secret-capturing regexes stop at the opening quote of the call argument,
// so a value that is a (dotted) identifier followed by "(" is a code reference
// whose real value is produced at runtime — never a hardcoded credential.
const CODE_EXPRESSION = /^[A-Za-z_$][\w$]*\s*(?:\.\s*[A-Za-z_$][\w$]*\s*)*\(/;

// A bare dotted reference reads another variable/attribute at runtime rather
// than being a literal secret: `password = self.password`,
// `config.itshop_password`, `this.creds.password`. At least one dot is required
// so a lone word like `hunter2` is still treated as a possible real password.
const DOTTED_REFERENCE = /^[A-Za-z_$][\w$]*(?:\s*\.\s*[A-Za-z_$][\w$]*)+$/;

// An UPPER_SNAKE_CASE token (`API_PASSWORD`, `DB_SECRET`) is, by convention, an
// environment-variable or constant name being referenced — e.g. the mapping
// `'API_PASSWORD': 'API_PASSWORD'` — not a literal credential value.
const CONSTANT_NAME = /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+$/;

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

  // Strip surrounding/trailing punctuation so prose and docstring values such as
  // "Password." (from an `Args:` section) or "(secret)" reduce to the bare word
  // and match the placeholder list instead of being reported as real secrets.
  const word = v.replace(/^[^A-Za-z0-9_]+/, '').replace(/[^A-Za-z0-9_]+$/, '');
  if (word !== v && PLACEHOLDER_WORDS.has(word.toLowerCase())) { return true; }

  if (PLACEHOLDER_SUBSTRINGS.test(v)) { return true; }

  // Type annotations / code expressions (Optional[str], string | null, …) are
  // never literal secrets.
  if (TYPE_ANNOTATION.test(v)) { return true; }

  // Function/method calls (config.get(...), self._get_variable(...)) are code
  // references, not hardcoded secrets.
  if (CODE_EXPRESSION.test(v)) { return true; }

  // Bare attribute references (self.password, config.itshop_password) read a
  // value at runtime; they are not hardcoded secrets.
  if (DOTTED_REFERENCE.test(v)) { return true; }

  // UPPER_SNAKE_CASE constant / env-var names (API_PASSWORD) are references.
  if (CONSTANT_NAME.test(v)) { return true; }

  return false;
}
