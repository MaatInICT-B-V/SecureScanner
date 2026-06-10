# SecureScanner

**By MaatInICT B.V. — Quality Engineering & Identity Expertise**

SecureScanner is a free Visual Studio Code extension that scans your open workspace for security vulnerabilities, hardcoded credentials, insecure coding patterns, and misconfigurations all without leaving your editor.

## What It Does

SecureScanner analyzes the code in your current workspace and flags potential security issues before you ship. It runs automatically when you open or save files, and can also scan your entire workspace on demand.

### Scanning Categories

| Category | What It Checks |
|----------|---------------|
| **Credentials & Secrets** | Hardcoded cloud and service tokens — AWS (incl. `ASIA` session keys), GitHub (classic + fine-grained `github_pat_`, `ghs_`/`ghu_`/`ghr_`), GitLab, npm, PyPI, Hugging Face, OpenAI, Anthropic, Google, Azure, Stripe, SendGrid, Twilio, Slack webhooks, Sentry, DigitalOcean, Discord, Telegram — plus private keys, passwords, JWT tokens and database connection strings. Generic secret rules detect unquoted values (`.env`, shell, YAML) with an entropy + placeholder filter to cut false positives. |
| **OWASP Top 10** | SQL injection (concatenation, template literals, f-strings, `.format()`/`%`), XSS, command injection, `eval()`, SSRF, XXE, open redirect, insecure cookies, JWT auth failures, disabled TLS verification, sensitive data in logs, insecure deserialization, weak cryptography (MD5/SHA-1), CSRF and path traversal |
| **Vulnerable Dependencies** | Known vulnerabilities in your real npm and pip dependencies — read from manifests and lockfiles (including **transitive** dependencies) and matched server-side by the OSV.dev database, with a built-in offline fallback |
| **Misconfigurations** | Wildcard CORS, disabled TLS verification (`verify=False`), debug mode, insecure random (Math.random), empty catch blocks, hardcoded IPs, missing Helmet.js, binding to 0.0.0.0 |
| **File Hygiene** | Missing or incomplete .gitignore and .aiignore files, sensitive files (.env, *.pem, *.key, credentials.json, SSH keys) not excluded from version control or AI tools |

### Features

- **Real-time scanning** — Automatically scans files on open and save (including `.jsx`/`.tsx` React components)
- **Workspace scan** — Scan up to 5,000 files in one go; cancelable, with a warning when the cap is reached
- **OSV-powered dependency scanning** — Resolves your real dependencies (incl. transitive, from lockfiles) and checks them against OSV.dev, with an offline fallback to built-in rules
- **Security Dashboard** — Visual overview with severity cards, filters, and clickable results
- **Sidebar tree view** — Browse findings by category in the VS Code activity bar
- **Hover tooltips** — See finding details, CWE references, and OWASP IDs by hovering over flagged code
- **Quick fixes** — Suppress a finding with an inline comment, permanently dismiss it via the baseline, move secrets to environment variables, or replace innerHTML with textContent
- **Baseline suppression** — Permanently dismiss accepted findings in `.securescanner-baseline.json` (fingerprinted, no secrets stored) so they stay hidden across scans
- **Secret noise filtering** — Entropy scoring and a placeholder denylist suppress template/example values; findings inside comments are downgraded to Info
- **Pip update checker** — Check installed packages (`pip list`) and requirements.txt for updates against PyPI or a Nexus 3 Repository Manager (auto-detected from URL), with per-package update buttons
- **Test environment mode** — Toggle to suppress findings that are common in test environments (e.g. `verify=False`, debug mode)
- **Export reports** — Export findings as a styled HTML report that can be opened in any browser and shared with colleagues (print-friendly for PDF export)

### Supported Languages

JavaScript, TypeScript (incl. React `.jsx`/`.tsx`), Python, Java, C#, Go, PHP, Ruby, and framework-specific patterns (React, Express, Django, Flask). Credential, dependency and file-hygiene checks are language-agnostic.

## How to Use

1. Install the extension (VSIX or Marketplace)
2. Open any project folder in VS Code
3. SecureScanner starts scanning automatically
4. Click the shield icon in the status bar to open the Security Dashboard
5. Use the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):
   - `SecureScanner: Scan Current File`
   - `SecureScanner: Scan Workspace`
   - `SecureScanner: Open Security Dashboard`

## Suppressing Findings

When a finding is a false positive, use the quick-fix menu (the lightbulb, or `Ctrl+.` / `Cmd+.`) on the flagged line:

- **Suppress this finding** — inserts a `securescanner-ignore <RULE-ID>` comment (with the correct comment marker for the language) on that line. The engine reads it back and skips the finding. A bare `securescanner-ignore` suppresses every rule on the line.
- **Add … to baseline (ignore permanently)** — records the finding's fingerprint in `.securescanner-baseline.json` in your workspace root, so it stays suppressed across scans without touching your source. The file stores only hashes, never the matched secret. Commit it to share the baseline with your team.

## Dependency Scanning & OSV.dev

SecureScanner uses [OSV.dev](https://osv.dev), Google's open source vulnerability database, as its data source for known vulnerabilities. OSV.dev aggregates data from sources such as the National Vulnerability Database (NVD), GitHub Advisory Database, and ecosystem-specific advisories.

When `secureScanner.enableOsvOnlineScan` is on (the default), SecureScanner reads the dependencies declared in your workspace — `package.json`, `package-lock.json` (including transitive dependencies) and `requirements.txt` — and sends the resolved package names and versions to OSV.dev's batch API. **Only package names and versions are transmitted; your source code never leaves your machine.** OSV performs the version-range matching server-side, so results are accurate and current without maintaining a local rule list.

If you are offline or disable online scanning, SecureScanner falls back to its built-in vulnerability rules. The **Update CVE Database** button in the Security Dashboard refreshes that built-in/offline data set from OSV.dev.

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `secureScanner.enableOnSave` | `true` | Scan files automatically when saved |
| `secureScanner.enableOnOpen` | `true` | Scan files automatically when opened |
| `secureScanner.severityThreshold` | `Low` | Minimum severity level to report |
| `secureScanner.ignorePaths` | `node_modules, dist, .git, out, build` | Glob patterns for paths to ignore |
| `secureScanner.enabledCategories` | All categories | Which scanner categories to enable |
| `secureScanner.enableOsvOnlineScan` | `true` | Check dependencies online against OSV.dev (sends only package names + versions). Falls back to built-in rules when off/offline |
| `secureScanner.excludeFolders` | `results` | Folder names to exclude from scans, separated by `;` (each matched as `**/name/**`) |
| `secureScanner.projectType` | `auto` | Whether to run git-related checks (`auto` / `git` / `local`) |
| `secureScanner.pipIndexUrl` | `https://pypi.org/pypi` | Pip package index URL for update checks (use your Nexus/Artifactory URL for internal repos) |
| `secureScanner.isTestEnvironment` | `false` | Suppress findings common in test environments (e.g. `verify=False`, debug mode) |
| `secureScanner.maxFileSizeKB` | `512` | Maximum file size to scan (KB) |

## Disclaimer

SecureScanner is provided free of charge by MaatInICT B.V. on an "as is" basis, without warranties of any kind. Use of this tool is entirely at your own risk. MaatInICT B.V. shall not be held liable for any damages or consequences arising from its use. This tool does not replace professional security audits or penetration testing.

---

&copy; MaatInICT B.V. — Quality Engineering & Identity Expertise
