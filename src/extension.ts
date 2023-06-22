import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "pubspec-dependency-inspector" is now active!');

	context.subscriptions.push(
		vscode.commands.registerCommand('pubspec-dependency-inspector.helloWorld', () => {
			vscode.window.showInformationMessage('Hello World from Pubspec dependency inspector!');
		}),

		vscode.commands.registerCommand('pubspec-dependency-inspector.analyzeDependencies', () => {
			vscode.window.showInformationMessage('Analyzing dependencies...');
		}),
	);

	vscode.workspace.onDidOpenTextDocument((document: vscode.TextDocument) => {
		// Check if the opened document is the specific file you want to target
        if (document.fileName === 'path/to/your/file') {
            // Execute your desired command here
            vscode.commands.executeCommand('pubspec-dependency-inspector.analyzeDependencies');
        }
	});
}

// This method is called when your extension is deactivated
export function deactivate() {}
