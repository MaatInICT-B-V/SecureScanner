import * as vscode from 'vscode';

export class SecurityCodeActionProvider implements vscode.CodeActionProvider {
  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    context: vscode.CodeActionContext
  ): vscode.CodeAction[] {
    const actions: vscode.CodeAction[] = [];

    for (const diagnostic of context.diagnostics) {
      if (diagnostic.source !== 'SecureScanner') {
        continue;
      }

      const code = typeof diagnostic.code === 'object' ? diagnostic.code.value : diagnostic.code;
      const codeStr = String(code || '');

      // Suppress finding action
      const suppressAction = new vscode.CodeAction(
        `Suppress: ${codeStr}`,
        vscode.CodeActionKind.QuickFix
      );
      suppressAction.command = {
        command: 'secureScanner.suppressFinding',
        title: 'Suppress this finding',
        arguments: [document, diagnostic],
      };
      actions.push(suppressAction);

      // Permanently dismiss via the workspace baseline (no source edit).
      const baselineAction = new vscode.CodeAction(
        `Add ${codeStr} to baseline (ignore permanently)`,
        vscode.CodeActionKind.QuickFix
      );
      baselineAction.command = {
        command: 'secureScanner.addToBaseline',
        title: 'Add to baseline',
        arguments: [document, diagnostic],
      };
      actions.push(baselineAction);

      // Specific quick fixes based on rule type
      if (codeStr.startsWith('CRED')) {
        const envAction = new vscode.CodeAction(
          'Move to environment variable',
          vscode.CodeActionKind.QuickFix
        );
        envAction.diagnostics = [diagnostic];
        envAction.isPreferred = true;
        envAction.command = {
          command: 'secureScanner.moveToEnv',
          title: 'Move to environment variable',
          arguments: [document, range],
        };
        actions.push(envAction);
      }

      if (codeStr.includes('OWASP-005') || codeStr.includes('OWASP-006')) {
        const fixAction = new vscode.CodeAction(
          'Use textContent instead',
          vscode.CodeActionKind.QuickFix
        );
        fixAction.edit = new vscode.WorkspaceEdit();
        const text = document.getText(diagnostic.range);
        if (text.includes('innerHTML')) {
          fixAction.edit.replace(
            document.uri,
            diagnostic.range,
            text.replace('innerHTML', 'textContent')
          );
          fixAction.diagnostics = [diagnostic];
          actions.push(fixAction);
        }
      }
    }

    return actions;
  }
}
