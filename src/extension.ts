import * as vscode from 'vscode';
import { isPubspecFile, readPackageLines, checkForUpdates, Dependency } from './analyze_dependencies';
import { MyCodeActionProvider } from './quick_fix';

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

						// Diagnostic
						if (dependenciesList[i].offset !== undefined && dependenciesList[i].lineOffset !== undefined) {
							const activeEditor = vscode.window.activeTextEditor;

							if (!activeEditor) {
								return;
							}
							document = activeEditor.document;
							// Clear any existing diagnostics for the document
							diagnosticCollection.clear();

							// Create a diagnostic for the specified line
							const range = new vscode.Range(document.positionAt(dependenciesList[i].offset! - dependenciesList[i].lineOffset!), document.positionAt(dependenciesList[i].offset!));
							const diagnostic = new vscode.Diagnostic(range, `This package has a update from ${dependenciesList[i].currentVersion} -> ${dependenciesList[i].latestVersion}`, vscode.DiagnosticSeverity.Warning);

							diagnosticList.push(diagnostic);
						}

					}
					else {
						console.log(`No update available for ${dependenciesList[i].name}: ${dependenciesList[i].currentVersion}`);
					}
				}

				if (document !== undefined && diagnosticList.length > 0) {
					diagnosticCollection.set(document.uri, diagnosticList);

					// TODO: CodeAction
					// const codeActionProvider = new CodeActionProvider();
					// context.subscriptions.push(
					// 	vscode.languages.registerCodeActionsProvider(
					// 		"dart",
					// 		codeActionProvider
					// 	)
					// );

				}

			}
			else {
				vscode.window.showInformationMessage('Not a pubspec.yaml file');
			}

		}),



		vscode.languages.registerCodeActionsProvider('*', new MyCodeActionProvider())

	);

	vscode.window.onDidChangeActiveTextEditor((editor: vscode.TextEditor | undefined) => {
		// Check if the opened document is the specific file you want to target
		console.log('onDidOpenTextDocument');
		// console.log(editor?.document.fileName);
		if (editor !== undefined && isPubspecFile(editor.document.fileName)) {
			// Execute your desired command here
			vscode.commands.executeCommand('pubspec-dependency-inspector.analyzeDependencies');

			// TODO: Implement Quick fix
			// TODO: only run it once a day or so
		}
	});


}


// This method is called when your extension is deactivated
export function deactivate() { }
