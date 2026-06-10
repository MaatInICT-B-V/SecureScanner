import * as vscode from 'vscode';
import { ScannerEngine } from '../engine/scannerEngine';
import { severityToLabel } from '../utils/configManager';

export class SecurityHoverProvider implements vscode.HoverProvider {
  constructor(private engine: ScannerEngine) {}

  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.Hover | undefined {
    const findings = this.engine.getAllFindings().get(document.uri.fsPath);
    if (!findings) {
      return undefined;
    }

    for (const finding of findings) {
      const range = new vscode.Range(
        finding.location.startLine,
        finding.location.startColumn,
        finding.location.endLine,
        finding.location.endColumn
      );

      if (range.contains(position)) {
        const md = new vscode.MarkdownString();
        // Do NOT trust this markdown: it embeds dynamic text (e.g. OSV
        // summaries) that could otherwise smuggle a clickable command: URI.
        // Only theme icons are needed; https links render without trust.
        md.supportThemeIcons = true;

        md.appendMarkdown(`### $(shield) SecureScanner: ${finding.title}\n\n`);
        md.appendMarkdown(`**Severity:** ${severityToLabel(finding.severity)}\n\n`);
        md.appendMarkdown(`**Category:** ${finding.category}\n\n`);
        md.appendMarkdown(`${finding.description}\n\n`);

        if (finding.cweId) {
          md.appendMarkdown(
            `**Reference:** [${finding.cweId}](https://cwe.mitre.org/data/definitions/${finding.cweId.replace('CWE-', '')}.html)\n\n`
          );
        }
        if (finding.owaspId) {
          md.appendMarkdown(`**OWASP:** ${finding.owaspId}\n\n`);
        }

        md.appendMarkdown(`*Rule: ${finding.id}*`);

        return new vscode.Hover(md, range);
      }
    }

    return undefined;
  }
}
