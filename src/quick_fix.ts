import * as vscode from 'vscode';

export class MyCodeActionProvider implements vscode.CodeActionProvider {
	provideCodeActions(
		document: vscode.TextDocument,
		range: vscode.Range,
		context: vscode.CodeActionContext,
	): vscode.ProviderResult<vscode.CodeAction[]> {

		const codeActions: vscode.CodeAction[] = [];

		for (const diagnostic of context.diagnostics) {
			if (diagnostic.code === "updateDependency") {
				const fixAction = new vscode.CodeAction('Update dependency', vscode.CodeActionKind.QuickFix);
				fixAction.command = {
					command: 'pubspec-dependency-inspector.updateDependency',
					title: 'Update dependency',
					arguments: [diagnostic],
				};
				
				codeActions.push(fixAction);
			}
			
		}

		return codeActions;
	}
}


