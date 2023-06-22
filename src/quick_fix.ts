import * as vscode from 'vscode';

export class MyCodeActionProvider implements vscode.CodeActionProvider {
	provideCodeActions(
	  document: vscode.TextDocument,
	  range: vscode.Range,
	  context: vscode.CodeActionContext,
	  token: vscode.CancellationToken
	): vscode.ProviderResult<vscode.CodeAction[]> {
	  // Check if the diagnostic is within the given range
	  const applicableDiagnostics = context.diagnostics.filter(diagnostic =>
		diagnostic.range.intersection(range)
	  );
  
	  const codeActions: vscode.CodeAction[] = [];
	  for (const diagnostic of applicableDiagnostics) {
		const fixAction = new vscode.CodeAction('Update dependency', vscode.CodeActionKind.QuickFix);
		fixAction.command = {
		  command: 'myExtension.fixIssue',
		  title: 'Update dependency',
		  arguments: [diagnostic],
		};
		codeActions.push(fixAction);
	  }
  
	  return codeActions;
	}
  }
