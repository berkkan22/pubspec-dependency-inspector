import * as vscode from 'vscode';
import { isPubspecFile, readPackageLines, checkForUpdates, Dependency } from './analyze_dependencies';

export function activate(context: vscode.ExtensionContext) {
	const diagnosticCollection = vscode.languages.createDiagnosticCollection("myExtension");

	console.log('Congratulations, your extension "pubspec-dependency-inspector" is now active!');

	context.subscriptions.push(
		vscode.commands.registerCommand('pubspec-dependency-inspector.helloWorld', (uri: vscode.Uri) => {
			vscode.window.showInformationMessage(`Hello World from Pubspec dependency inspector! ${uri}`);
		}),

		vscode.commands.registerCommand('pubspec-dependency-inspector.analyzeDependencies', async () => {
			vscode.window.showInformationMessage('Analyzing dependencies...');
			let dependenciesList: Dependency[] = [];

			let file = vscode.window.activeTextEditor?.document.fileName.toString() ?? '';
			if (file !== '' && isPubspecFile(file)) {
				let dependencies = readPackageLines(file);

				if (dependencies.length > 0) {
					dependenciesList = await checkForUpdates(dependencies);
				}

				let diagnosticList = [];

				let document: vscode.TextDocument | undefined;

				for (let i = 0; i < dependenciesList.length; i++) {
					if (dependenciesList[i].updateAvailable) {
						console.log(`Update available for ${dependenciesList[i].name}: ${dependenciesList[i].currentVersion} -> ${dependenciesList[i].latestVersion}`);

						// TODO: Diagnostic
						if (dependenciesList[i].offset !== undefined && dependencies[i].lineOffset !== undefined) {
							const activeEditor = vscode.window.activeTextEditor;

							if (!activeEditor) {
								return;
							}
							document = activeEditor.document;
							// Clear any existing diagnostics for the document
							diagnosticCollection.clear();

							// Create a diagnostic for the specified line
							const range = new vscode.Range(document.positionAt(dependencies[i].offset! - dependencies[i].lineOffset!), document.positionAt(dependencies[i].offset!));
							const diagnostic = new vscode.Diagnostic(range, `This package has a update from ${dependencies[i].currentVersion} -> ${dependencies[i].latestVersion}`, vscode.DiagnosticSeverity.Warning);

							diagnosticList.push(diagnostic);
						}

					}
					else {
						console.log(`No update available for ${dependenciesList[i].name}: ${dependenciesList[i].currentVersion}`);
					}
				}

				if (document !== undefined) {
					diagnosticCollection.set(document.uri, diagnosticList);
				}

				// TODO: CodeAction

			}
			else {
				vscode.window.showInformationMessage('Not a pubspec.yaml file');
			}

		}),
	);

	vscode.workspace.onDidOpenTextDocument((document: vscode.TextDocument) => {
		// Check if the opened document is the specific file you want to target
		console.log(document.fileName);
		if (document.fileName === 'path/to/your/file') {
			// Execute your desired command here
			vscode.commands.executeCommand('pubspec-dependency-inspector.analyzeDependencies', document);
		}
		else {
			vscode.window.showInformationMessage('Not a pubspec.yaml file (onDidOpenTextDocument)');
		}
	});


}

// This method is called when your extension is deactivated
export function deactivate() { }
