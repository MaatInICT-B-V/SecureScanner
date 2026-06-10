import { Finding, FindingLocation, Severity } from '../types/finding';
import { IScannerRule, ScanContext } from '../types/scanner';
import { isPlaceholder, shannonEntropy } from './secretHeuristics';

interface CommentRange {
  start: number;
  end: number;
}

/**
 * Return the single-line comment markers for a given language.
 */
function getCommentMarkers(languageId: string): string[] {
  switch (languageId) {
    case 'python':
    case 'ruby':
    case 'shellscript':
    case 'yaml':
    case 'dockerfile':
    case 'perl':
    case 'r':
    case 'powershell':
    case 'pip-requirements':
    case 'dotenv':
    case 'properties':
    case 'ini':
    case 'toml':
    case 'makefile':
      return ['#'];
    case 'javascript':
    case 'typescript':
    case 'javascriptreact':
    case 'typescriptreact':
    case 'java':
    case 'c':
    case 'cpp':
    case 'csharp':
    case 'go':
    case 'rust':
    case 'swift':
    case 'kotlin':
    case 'php':
    case 'scss':
    case 'less':
      return ['//'];
    default:
      return ['//', '#'];
  }
}

/**
 * Return the primary single-line comment marker for a language. Used when
 * writing a suppression comment so it is valid for the file's language
 * (e.g. '#' for Python/YAML/requirements.txt instead of a hard-coded '//').
 */
export function getLineCommentMarker(languageId: string): string {
  return getCommentMarkers(languageId)[0];
}

const SUPPRESS_MARKER = 'securescanner-ignore';

/**
 * Determine whether a line of source carries a suppression directive for the
 * given rule. A bare `securescanner-ignore` suppresses every rule on that line;
 * `securescanner-ignore RULE-ID [RULE-ID...]` suppresses only the listed rules.
 * Tolerates the legacy composite form ("RULE-ID (CWE-xxx)") since the rule id
 * still appears as its own token.
 */
function lineSuppresses(ruleId: string, lineText: string): boolean {
  const idx = lineText.indexOf(SUPPRESS_MARKER);
  if (idx === -1) {
    return false;
  }
  const rest = lineText.substring(idx + SUPPRESS_MARKER.length).trim();
  if (rest.length === 0) {
    return true;
  }
  return rest.split(/[\s,]+/).includes(ruleId);
}

/**
 * Read the text of a given (0-based) line from content using the line offset index.
 */
function getLineText(content: string, lineOffsets: number[], line: number): string {
  if (line < 0 || line >= lineOffsets.length) {
    return '';
  }
  const start = lineOffsets[line];
  const end = line + 1 < lineOffsets.length ? lineOffsets[line + 1] - 1 : content.length;
  return content.substring(start, end);
}

/**
 * Normalize language dialects to their base family so that rules which only
 * declare the base language (e.g. javascript/typescript) still apply to their
 * dialects. Without this, React files (javascriptreact/typescriptreact) are
 * skipped by nearly every rule and scanned for nothing.
 */
function normalizeLanguageId(languageId: string): string {
  switch (languageId) {
    case 'javascriptreact':
      return 'javascript';
    case 'typescriptreact':
      return 'typescript';
    default:
      return languageId;
  }
}

/**
 * Build a sorted list of character ranges that fall inside comments.
 * Handles single-line (//, #) and multi-line comments.
 */
function buildCommentRanges(content: string, languageId: string, lineOffsets: number[]): CommentRange[] {
  const ranges: CommentRange[] = [];
  const markers = getCommentMarkers(languageId);

  // Single-line comments: for each line, find the first unquoted marker
  for (let i = 0; i < lineOffsets.length; i++) {
    const lineStart = lineOffsets[i];
    const lineEnd = i + 1 < lineOffsets.length ? lineOffsets[i + 1] - 1 : content.length;
    const line = content.substring(lineStart, lineEnd);

    for (const marker of markers) {
      const idx = findUnquotedMarker(line, marker);
      if (idx !== -1) {
        ranges.push({ start: lineStart + idx, end: lineEnd });
        break;
      }
    }
  }

  // Multi-line comments: /* ... */
  let mlMatch: RegExpExecArray | null;
  const mlRegex = /\/\*[\s\S]*?\*\//g;
  while ((mlMatch = mlRegex.exec(content)) !== null) {
    ranges.push({ start: mlMatch.index, end: mlMatch.index + mlMatch[0].length });
  }

  // HTML comments: <!-- ... -->
  const htmlRegex = /<!--[\s\S]*?-->/g;
  while ((mlMatch = htmlRegex.exec(content)) !== null) {
    ranges.push({ start: mlMatch.index, end: mlMatch.index + mlMatch[0].length });
  }

  return ranges;
}

/**
 * Find the first occurrence of a comment marker that is not inside a string literal.
 * Returns -1 if no unquoted marker is found.
 */
function findUnquotedMarker(line: string, marker: string): number {
  let inSingle = false;
  let inDouble = false;
  let inBacktick = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const prev = i > 0 ? line[i - 1] : '';

    if (prev === '\\') { continue; }

    if (ch === "'" && !inDouble && !inBacktick) { inSingle = !inSingle; continue; }
    if (ch === '"' && !inSingle && !inBacktick) { inDouble = !inDouble; continue; }
    if (ch === '`' && !inSingle && !inDouble) { inBacktick = !inBacktick; continue; }

    if (!inSingle && !inDouble && !inBacktick) {
      if (line.substring(i, i + marker.length) === marker) {
        return i;
      }
    }
  }
  return -1;
}

/**
 * Check whether a character offset falls inside any comment range.
 */
function isInComment(offset: number, commentRanges: CommentRange[]): boolean {
  return commentRanges.some(r => offset >= r.start && offset < r.end);
}

/**
 * Build a line offset index for fast offset-to-line/column conversion.
 * Returns an array where index i is the character offset where line i starts.
 */
function buildLineOffsets(content: string): number[] {
  const offsets: number[] = [0];
  for (let i = 0; i < content.length; i++) {
    if (content[i] === '\n') {
      offsets.push(i + 1);
    }
  }
  return offsets;
}

/**
 * Convert a character offset to a line and column number (0-based).
 */
function offsetToPosition(offset: number, lineOffsets: number[]): { line: number; column: number } {
  let low = 0;
  let high = lineOffsets.length - 1;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (lineOffsets[mid] <= offset) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }
  return { line: low, column: offset - lineOffsets[low] };
}

/**
 * Execute a single rule against file content with a timeout guard.
 */
function executeRule(
  rule: IScannerRule,
  context: ScanContext,
  lineOffsets: number[],
  commentRanges: CommentRange[]
): Finding[] {
  const findings: Finding[] = [];

  // Skip rules marked as safe in test environments
  if (context.isTestEnvironment && rule.testEnvironmentSafe) {
    return findings;
  }

  // Check language filter (dialects normalized to their family, so React
  // variants are scanned by rules that only declare javascript/typescript)
  if (rule.languages && rule.languages.length > 0) {
    const contextLanguage = normalizeLanguageId(context.languageId);
    const ruleLanguages = rule.languages.map(normalizeLanguageId);
    if (!ruleLanguages.includes(contextLanguage)) {
      return findings;
    }
  }

  // Check file pattern filter
  if (rule.filePatterns && rule.filePatterns.length > 0) {
    const fileName = context.filePath.split(/[/\\]/).pop() || '';
    const matches = rule.filePatterns.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        return regex.test(fileName);
      }
      return fileName === pattern;
    });
    if (!matches) {
      return findings;
    }
  }

  // Ensure global flag is set for iteration
  const flags = rule.pattern.flags.includes('g')
    ? rule.pattern.flags
    : rule.pattern.flags + 'g';
  const regex = new RegExp(rule.pattern.source, flags);

  const startTime = Date.now();
  const TIMEOUT_MS = 200;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(context.content)) !== null) {
    // Timeout guard against catastrophic backtracking
    if (Date.now() - startTime > TIMEOUT_MS) {
      break;
    }

    const start = offsetToPosition(match.index, lineOffsets);
    const end = offsetToPosition(match.index + match[0].length, lineOffsets);

    // Honor suppression comments on the match line or the line directly above.
    const onLine = getLineText(context.content, lineOffsets, start.line);
    const aboveLine = getLineText(context.content, lineOffsets, start.line - 1);
    if (lineSuppresses(rule.id, onLine) || lineSuppresses(rule.id, aboveLine)) {
      if (match[0].length === 0) {
        regex.lastIndex++;
      }
      continue;
    }

    // Heuristic noise filter for generic secret rules: skip placeholders and
    // low-entropy values (env-var references, templates, validation text, …).
    if (rule.secretGroup !== undefined) {
      const candidate = match[rule.secretGroup] ?? '';
      const tooLowEntropy =
        rule.minEntropy !== undefined && shannonEntropy(candidate) < rule.minEntropy;
      if (isPlaceholder(candidate) || tooLowEntropy) {
        continue;
      }
    }

    const location: FindingLocation = {
      filePath: context.filePath,
      startLine: start.line,
      startColumn: start.column,
      endLine: end.line,
      endColumn: end.column,
    };

    // Redact matched text for credential findings
    let matchedText = match[0];
    if (rule.category === 'credential' && matchedText.length > 8) {
      matchedText = matchedText.substring(0, 4) + '****' + matchedText.substring(matchedText.length - 4);
    }

    // Downgrade severity for matches found inside comments
    const inComment = isInComment(match.index, commentRanges);
    const severity = inComment ? Severity.Info : rule.severity;
    const title = inComment ? `${rule.title} (in comment)` : rule.title;

    findings.push({
      id: rule.id,
      category: rule.category,
      severity,
      title,
      description: rule.description,
      location,
      matchedText,
      cweId: rule.cweId,
      owaspId: rule.owaspId,
    });

    // Prevent infinite loops on zero-length matches
    if (match[0].length === 0) {
      regex.lastIndex++;
    }
  }

  return findings;
}

/**
 * Run all provided rules against a scan context and return findings.
 */
export function runRules(rules: IScannerRule[], context: ScanContext): Finding[] {
  const lineOffsets = buildLineOffsets(context.content);
  const commentRanges = buildCommentRanges(context.content, context.languageId, lineOffsets);
  const findings: Finding[] = [];

  for (const rule of rules) {
    try {
      const ruleFindings = executeRule(rule, context, lineOffsets, commentRanges);
      findings.push(...ruleFindings);
    } catch {
      // Skip rules that error (e.g., invalid regex)
      console.warn(`SecureScanner: Rule ${rule.id} failed on ${context.filePath}`);
    }
  }

  return findings;
}
