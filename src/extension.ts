import * as vscode from 'vscode';
import { isPubspecFile, readPackageLines, checkForUpdates, Dependency, CustomDiagnostic } from './analyze_dependencies';
import { MyCodeActionProvider } from './quick_fix';

let customDiagnosticList: CustomDiagnostic[] = [];

export function activate(context: vscode.ExtensionContext) {
	const diagnosticCollection = vscode.languages.createDiagnosticCollection("myExtension");


	console.log('Congratulations, your extension "pubspec-dependency-inspector" is now active!');

	context.subscriptions.push(
		diagnosticCollection,

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
				customDiagnosticList = [];

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
							// diagnosticCollection.clear();

							// Create a diagnostic for the specified line
							const range = new vscode.Range(document.positionAt(dependenciesList[i].offset! - dependenciesList[i].lineOffset!), document.positionAt(dependenciesList[i].offset!));
							let diagnostic = new vscode.Diagnostic(range, `This package has a update from ${dependenciesList[i].currentVersion} -> ${dependenciesList[i].latestVersion}`, vscode.DiagnosticSeverity.Warning);
							let customDiagnostic: CustomDiagnostic = {
								diagnostic: diagnostic,
								dependency: dependenciesList[i]
							};
							diagnostic.code = "updateDependency";

							diagnosticList.push(diagnostic);
							customDiagnosticList.push(customDiagnostic);
						}

					}
					else {
						console.log(`No update available for ${dependenciesList[i].name}: ${dependenciesList[i].currentVersion}`);
					}
				}

				if (document !== undefined && diagnosticList.length > 0) {
					diagnosticCollection.set(document.uri, diagnosticList);
				}

			}
			else {
				vscode.window.showInformationMessage('Not a pubspec.yaml file');
			}

		}),

		vscode.commands.registerCommand('pubspec-dependency-inspector.updateDependency', async (diagnostic: vscode.Diagnostic) => {
			let document: vscode.TextDocument | undefined;

			for (let i = 0; i < customDiagnosticList.length; i++) {
				if (diagnostic.message === customDiagnosticList[i].diagnostic.message) {
					const dependency = customDiagnosticList[i].dependency;

					const activeEditor = vscode.window.activeTextEditor;

					if (!activeEditor) {
						return;
					}

					document = activeEditor.document;

					const edit = new vscode.WorkspaceEdit();
					let range = new vscode.Range(document.positionAt(dependency.offset! - dependency.versionOffset!), document.positionAt(dependency.offset!));
					edit.replace(document.uri, range, dependency.latestVersion!);
					await vscode.workspace.applyEdit(edit);


					let diagnosticList = diagnosticCollection.get(document.uri)?.map(diagnostic => diagnostic);
					let index = diagnosticList?.findIndex(d => d === diagnostic);
					if (diagnosticList !== undefined && index !== undefined) {
						diagnosticList.splice(index, 1);
						customDiagnosticList.splice(i, 1);
						diagnosticCollection.set(document.uri, diagnosticList);
					}

					if (dependency.hasPrefix) {
						for (let index = 0; index < customDiagnosticList.length; index++) {
							const dependency = customDiagnosticList[index].dependency;
							// const diagnostic = customDiagnosticList[index].diagnostic;

							dependency.offset = dependency.offset! - 1;
						}
					}

					let versionOffset = dependency.currentVersion.length - dependency.latestVersionOffset!;
					if (versionOffset != 0) {
						for (let index = 0; index < customDiagnosticList.length; index++) {
							const dependency = customDiagnosticList[index].dependency;
							// const diagnostic = customDiagnosticList[index].diagnostic;

							dependency.offset = dependency.offset! - versionOffset;
						}
					}
				}
			}
		}),

		vscode.commands.registerCommand('pubspec-dependency-inspector.updateAllDependencies', async () => {
			await vscode.commands.executeCommand('pubspec-dependency-inspector.analyzeDependencies');

			const activeEditor = vscode.window.activeTextEditor;

			if (!activeEditor) {
				return;
			}

			let document = activeEditor.document;

			for (const diagnostic of diagnosticCollection.get(document.uri) ?? []) {
				if (diagnostic.code === "updateDependency") {
					await vscode.commands.executeCommand('pubspec-dependency-inspector.updateDependency', diagnostic);
				}
			}
		}),

		vscode.languages.registerCodeActionsProvider('yaml', new MyCodeActionProvider())

	);

	// vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
	// 	if (isPubspecFile(document.fileName)) {
	// 		vscode.commands.executeCommand('pubspec-dependency-inspector.analyzeDependencies');
	// 	}
	// });

	vscode.window.onDidChangeActiveTextEditor((editor: vscode.TextEditor | undefined) => {
		console.log('onDidOpenTextDocument');
		if (editor !== undefined && isPubspecFile(editor.document.fileName)) {
			vscode.commands.executeCommand('pubspec-dependency-inspector.analyzeDependencies');

			// TODO: only run it once a day or so
		}
	});
}

// This method is called when your extension is deactivated
export function deactivate() { }
