# Changelog

All notable changes to SecureScanner will be documented in this file.

## [1.2.4] - 2026-06-10

A false-positive release.

### Fixed
- **CRED-005 (Hardcoded Password) false positives on variable references** — The placeholder heuristic now recognizes more kinds of runtime references, so they are no longer reported as hardcoded secrets: bare attribute references (`password = self.password`, `itshop_password = config.itshop_password`), UPPER_SNAKE_CASE constant / environment-variable names (`'API_PASSWORD': 'API_PASSWORD'`), and brace interpolations such as f-strings (`Password={self.password}` inside `f"…;Password={self.password}"`). Genuine literal assignments and lowercase word passwords (e.g. `password = 'hunter2xy'`) are still detected.

## [1.2.2] - 2026-06-10

A false-positive release.

### Fixed
- **CRED-005 (Hardcoded Password) false positives on function calls** — Assignments whose value is a function or method call rather than a literal are no longer reported as hardcoded secrets. The placeholder heuristic now recognizes (dotted) code expressions, so `api_password = config.get('API_PASSWORD')` and `password = self._get_variable('API_PASSWORD')` are correctly treated as runtime lookups instead of credentials. Genuine literal assignments (e.g. `password = 'aB3xK9mQ7zP2wL5n'`) are still detected.

## [1.2.1] - 2026-06-10

A false-positive and polish release.

### Fixed
- **CRED-005 (Hardcoded Password) false positives** — Type-annotated parameters and fields (`password: Optional[str] = None`, `password: string | null`) and prose/docstring values (an `Args:` line like `password: Password.`) are no longer reported as hardcoded secrets. The placeholder heuristic now rejects type annotations and code expressions, and strips surrounding punctuation before the placeholder-word check.
- **OWASP-032 (Sensitive Data in Logs) false positives** — The rule now fires only when a secret-named *variable* is actually interpolated, concatenated or passed to the log call, instead of whenever the word "password" appears as descriptive text. Cases such as `logger.info("Password is empty …")`, `logger.info(f"… placeholder='{password_placeholder}'")` and masked output like `print(f"Password: {'*' * len(config.itshop_password)}")` are no longer flagged, while genuine `log(password)` / `f"…{password}…"` logging is still detected.

### Changed
- **Dashboard branding** — The MaatInICT logo inside the shield no longer spins during a scan; it is now shown as a static, business-appropriate mark.
- **Production packaging** — Release builds are minified and ship without source maps or the `src/` folder (`vscode:prepublish` now runs `build:prod`).

## [1.2.0] - 2026-06-10

A major accuracy and coverage release. Dependency scanning is rebuilt on OSV's
batch API over your real dependencies, secret detection is modernized, OWASP
coverage is broadened across more languages, and several engine bugs are fixed.

### Added
- **Dependency scanning over real workspace dependencies** — Instead of checking a fixed list of "popular" packages, SecureScanner now reads your actual manifests and lockfiles (`package.json`, `package-lock.json`, `requirements.txt`) and queries OSV.dev's `/v1/querybatch` API. OSV performs version-range matching server-side, including **transitive dependencies** resolved from `package-lock.json` (v2/v3). Lockfiles are exempt from the file-size limit.
- **New setting `secureScanner.enableOsvOnlineScan`** (default `true`) — Check dependencies online against OSV.dev (only package names and versions are sent, never source code). When disabled or offline, SecureScanner falls back to its built-in rules.
- **Modern secret detection** — New token rules for GitHub fine-grained PATs (`github_pat_`) and `ghs_`/`ghu_`/`ghr_`, GitLab (`glpat-`), npm (`npm_`), PyPI (`pypi-`), Hugging Face (`hf_`), OpenAI, Anthropic, Google OAuth (`GOCSPX-`), AWS session keys (`ASIA`), Azure storage keys, Stripe (`rk_live_`/`whsec_`), SendGrid, Twilio, Slack webhooks, Sentry DSNs, DigitalOcean, Discord and Telegram.
- **Quote-optional secret detection with noise filtering** — Generic API-key/password/secret rules now match unquoted values (`.env`, shell, Dockerfile, YAML), with an entropy score and placeholder denylist (`changeme`, `${VAR}`, `{{ template }}`, `<your-key>`, …) to suppress false positives.
- **Broader OWASP coverage** — SSRF, XXE, open redirect, insecure cookies, JWT auth failures, disabled TLS verification, logging of sensitive data, and insecure deserialization. New language coverage for **C#, Go, PHP, Ruby and Java** (deserialization, command injection, SQL injection, XXE, TLS).
- **Baseline suppression** — A new "Add to baseline (ignore permanently)" quick fix records a finding's fingerprint in `.securescanner-baseline.json` so it is suppressed in future scans without editing source files.
- **Cancelable workspace scan** — The workspace scan can now be cancelled, and warns when the 5,000-file cap is reached so results are not silently truncated.

### Fixed
- **Empty CVE update no longer wipes the database** — An offline/failed "Update CVE Database" can no longer overwrite the rules with empty results and silently disable dependency scanning.
- **`.jsx`/`.tsx` files are now scanned** — React dialects are normalized to their base language, so JS/TS rules apply to React components.
- **Suppress comments now work** — `// securescanner-ignore <RULE-ID>` (with the correct comment marker per language) is read back by the engine and suppresses the finding.
- **OWASP-009 (`yaml.load`)** — Rewritten so safe `Loader=yaml.SafeLoader` calls are no longer flagged, and the catastrophic-backtracking ReDoS is eliminated.
- **OWASP-003 (`eval`)** — No longer flags `model.eval()` / `df.eval()` (PyTorch/pandas).
- **Weak-hash rules (MD5/SHA-1)** — Now correctly detect `hashlib.md5`, `CryptoJS.MD5`, Java `MessageDigest.getInstance("SHA-1")`, etc.
- **Connection-string rule (CRED-010)** — Now covers `postgresql://`, `mongodb+srv://`, `rediss://`, `amqps://`, `mssql://` and basic-auth in HTTP(S) URLs.
- **Per-file scan debounce** — "Save All" now scans every saved document instead of just the last one.
- **Dashboard & hover hardening** — Dynamic values are HTML-escaped in the dashboard, and the hover no longer marks dynamic markdown as trusted (prevents command-URI injection).
- **Ignore-path globbing** — `*.min.js` no longer also matches `admin.json`.

## [1.1.2] - 2026-04-15

### Fixed
- **MISC-001 false positive on W3C namespaces** — Standard W3C namespace URLs (e.g. `http://www.w3.org/2000/svg`, `http://www.w3.org/1999/xhtml`) are no longer flagged as "Insecure HTTP URL". These namespaces are part of the XML/HTML specification and cannot be changed to HTTPS in web code.

## [1.1.1] - 2026-04-14

### Changed
- **HTML report export** — Export report is now a styled HTML page instead of raw JSON. The report includes summary cards per severity, category breakdown, and a full findings table with CWE references. Can be opened in any browser and shared directly with colleagues. Print-friendly styling included for PDF export via the browser.

## [1.1.0] - 2026-04-14

### Added
- **Exclude Folders setting** — New setting `secureScanner.excludeFolders` (default: `["results"]`) to skip specific folders during scans. Add folder names like `results` or `management` via VS Code settings (Ctrl+,) and the scanner will automatically exclude them. Prevents false positives from Robot Framework HTML/XML reports and other generated files (e.g. MISC-001 Insecure HTTP URL)

## [1.0.8] - 2026-04-14

### Added
- **Per-package update button** — Each outdated pip package now has an "Update" button that opens a VS Code terminal and runs `pip install --upgrade <package>`
- New "Action" column in the pip package updates table

### Changed
- **Redesigned "Check for Updates" button** — Now uses proper VS Code button styling (matching "Scan Workspace") instead of the previous link-style appearance

## [1.0.7] - 2026-04-14

### Fixed
- **Nexus Repository support for pip update checker** — The pip update checker now correctly queries Nexus 3 Repository Manager search API (`/service/rest/v1/search?format=pypi&name=...`) instead of constructing an invalid PyPI-style URL path
- Automatic detection of Nexus search endpoints vs standard PyPI indexes based on the configured URL
- Pagination support via Nexus `continuationToken` to retrieve all available versions
- Semver-based sorting to reliably determine the latest version from Nexus results

## [1.0.6] - 2026-04-14

### Added
- **Pip package update checker** — Check installed packages (`pip list`) and requirements.txt for available updates against PyPI or a custom Nexus/Artifactory repository
- New `secureScanner.pipIndexUrl` setting (default: `https://pypi.org/pypi`) for configuring internal package indexes
- Dashboard section showing outdated pip packages with current vs latest version
- **Comment detection** — Findings inside code comments are automatically downgraded to Info severity and marked with "(in comment)" to reduce false positives

## [1.0.4] - 2026-04-13

### Added
- **Test Environment toggle** — Dashboard toggle to mark a project as a test environment, suppressing findings that are common in test setups (e.g. `verify=False`, debug mode enabled)
- New `secureScanner.isTestEnvironment` workspace setting
- `testEnvironmentSafe` flag on scanner rules to control which rules are suppressed

### Changed
- Redesigned extension logo — shield with embedded MaatInICT logo (PNG)
- Version bump to 1.0.4

## [1.0.0] - 2026-03-26

### Changed
- Official v1.0.0 release
- Updated all branding to MaatInICT B.V.
- Added extension icon (SecureScannerLogo.png) for marketplace and sidebar
- Added MIT license
- Added GitHub repository link

## [0.1.2] - 2026-03-26

### Added
- README with full feature overview, usage instructions, and configuration reference
- This changelog

### Changed
- Version bump to 0.1.2

## [0.1.1] - 2026-03-26

### Added
- **File Hygiene Scanner** — New scanning category that checks .gitignore and .aiignore files
  - 10 checks for missing .gitignore patterns (.env, *.pem, *.key, *.p12, *.pfx, *.sqlite, credentials.json, SSH keys, .htpasswd, *.keystore)
  - 5 checks for missing .aiignore patterns (.env, *.pem, *.key, credentials.json, SSH keys)
  - Workspace-level detection of missing .gitignore and .aiignore files
  - Detection of sensitive files that exist but are not gitignored
- **MaatInICT branding** — Logo and company info in the Security Dashboard
- **Disclaimer** — Legal disclaimer in the dashboard footer
- File Hygiene filter option in the dashboard

### Changed
- Publisher updated to MaatInICT
- Dashboard CSP updated to allow logo images

## [0.1.0] - 2026-03-24

### Added
- Initial release
- **Credential Scanner** — 13 rules detecting hardcoded secrets (AWS keys, GitHub tokens, Slack tokens, Stripe keys, JWT, private keys, API keys, database connection strings)
- **OWASP Scanner** — 15 rules covering OWASP Top 10 2021 (SQL injection, XSS, command injection, eval, insecure deserialization, weak cryptography, CSRF, path traversal)
- **Dependency Scanner** — Scans package.json (npm) and requirements.txt (pip) for known vulnerable versions with semver matching
- **Misconfiguration Scanner** — 10 rules for common misconfigurations (wildcard CORS, disabled TLS, debug mode, Math.random, empty catch blocks, hardcoded IPs, missing Helmet.js)
- **Security Dashboard** — Interactive webview with summary cards, filterable findings table, and export functionality
- **CVE Database Updates** — Fetch latest vulnerability data from OSV.dev API
- **Diagnostics Provider** — Inline VS Code diagnostics with CWE references
- **Tree View** — Sidebar panel with findings grouped by category
- **Hover Provider** — Rich markdown tooltips with severity, CWE/OWASP links
- **Code Action Provider** — Quick fixes for suppression, env var migration, and textContent replacement
- **Auto-scanning** — On file open, save, and editor change (300ms debounce)
- **Workspace scanning** — Bulk scan up to 5,000 files
- **Report export**
- Configurable severity threshold, ignore paths, enabled categories, and max file size
