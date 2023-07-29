import * as vscode from 'vscode';
import { isPubspecFile, readPackageLines, checkForUpdates, analyzeFileContent } from './analyze_dependencies';
import { Dependency } from './model/dependency';
import { CustomDiagnostic } from './model/custom_dialog';
import { MyCodeActionProvider } from './quick_fix';

let customDiagnosticList: CustomDiagnostic[] = [];

export function activate(context: vscode.ExtensionContext) {
	let analyzingInProgress = false;

	const diagnosticCollection = vscode.languages.createDiagnosticCollection("myExtension");

	context.subscriptions.push(
		diagnosticCollection,

		vscode.commands.registerCommand('pubspec-dependency-inspector.analyzeDependencies', async () => {
			if (!analyzingInProgress) {
				analyzingInProgress = true;
				const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);


				let document: vscode.TextDocument;
				const activeEditor = vscode.window.activeTextEditor;

				if (!activeEditor) {
					return;
				}
				document = activeEditor.document;
				let file = activeEditor.document.fileName.toString();

				let dependenciesList: Dependency[] = [];

				if (file !== '' && isPubspecFile(file)) {
					// Set the text and show the loading spinner
					statusBarItem.text = "$(sync~spin) Analyzing dependencies...";
					statusBarItem.show();

					let dependencies = analyzeFileContent(file);

					if (dependencies.length <= 0) {
						return;
					}

					dependenciesList = await checkForUpdates(dependencies);

					if (dependenciesList.length <= 0) {
						return;
					}

					let diagnosticList = [];
					customDiagnosticList = [];

					for (let i = 0; i < dependenciesList.length; i++) {
						if (dependenciesList[i].updateAvailable) {
							let dependency = dependenciesList[i];

							let range = new vscode.Range(document.positionAt(dependency.dependencyStartOffset), document.positionAt(dependency.dependencyEndOffset));
							let diagnostic = new vscode.Diagnostic(range, `${dependenciesList[i].name} has a update from ${dependenciesList[i].currentVersion} -> ${dependenciesList[i].latestVersion}`, vscode.DiagnosticSeverity.Warning);
							let customDiagnostic: CustomDiagnostic = {
								diagnostic: diagnostic,
								dependency: dependenciesList[i]
							};
							diagnostic.code = "updateDependency";

							diagnosticList.push(diagnostic);
							customDiagnosticList.push(customDiagnostic);
						}
					}

					if (diagnosticList.length > 0) {
						diagnosticCollection.set(document.uri, diagnosticList);
					}

					statusBarItem.text = "$(check) Analyze completed!";
					setTimeout(() => statusBarItem.hide(), 1000);
					setTimeout(() => analyzingInProgress = false, 900);
				}
				else {
					vscode.window.showInformationMessage('Not a pubspec.yaml file');
					statusBarItem.text = "$(notebook-state-error) Analyze failed!";
					setTimeout(() => statusBarItem.hide(), 1000);
					setTimeout(() => analyzingInProgress = false, 900);
				}
			}
		}),

		vscode.commands.registerCommand('pubspec-dependency-inspector.updateDependency', async (diagnostic: vscode.Diagnostic) => {
			const activeEditor = vscode.window.activeTextEditor;

			if (!activeEditor) {
				return;
			}

			let document: vscode.TextDocument = activeEditor.document;

			for (let i = 0; i < customDiagnosticList.length; i++) {
				if (diagnostic.message === customDiagnosticList[i].diagnostic.message) {
					const dependency = customDiagnosticList[i].dependency;

					const edit = new vscode.WorkspaceEdit();
					let range = new vscode.Range(document.positionAt(dependency.currentVersionStartOffset), document.positionAt(dependency.currentVersionEndOffset));
					edit.replace(document.uri, range, dependency.latestVersion!);
					await vscode.workspace.applyEdit(edit);

					let diagnosticList = diagnosticCollection.get(document.uri)?.map(diagnostic => diagnostic);
					let diagnosticIndex = diagnosticList?.findIndex(d => d === diagnostic);
					if (diagnosticList !== undefined && diagnosticIndex !== undefined) {
						diagnosticList.splice(diagnosticIndex, 1);
						customDiagnosticList.splice(i, 1);
						diagnosticCollection.set(document.uri, diagnosticList);
					}

					// TODO: Check if this is needed
					if (dependency.hasPrefix && diagnosticIndex !== undefined) {
						for (let index = diagnosticIndex; index < customDiagnosticList.length; index++) {
							const dependency = customDiagnosticList[index].dependency;
							// const diagnostic = customDiagnosticList[index].diagnostic;

							dependency.dependencyStartOffset = dependency.dependencyStartOffset - 1;
							dependency.dependencyEndOffset = dependency.dependencyEndOffset - 1;
							dependency.currentVersionStartOffset = dependency.currentVersionStartOffset;
							dependency.currentVersionEndOffset = dependency.currentVersionEndOffset;
						}
					}

					let versionOffset = dependency.currentVersion.length - dependency.latestVersionOffset!;
					if (versionOffset !== 0 && diagnosticIndex !== undefined) {
						for (let index = diagnosticIndex; index < customDiagnosticList.length; index++) {
							const dependencyDiagnostic = customDiagnosticList[index].dependency;

							dependencyDiagnostic.dependencyStartOffset = dependencyDiagnostic.dependencyStartOffset - versionOffset;
							dependencyDiagnostic.dependencyEndOffset = dependencyDiagnostic.dependencyEndOffset - versionOffset;
							dependencyDiagnostic.currentVersionStartOffset = dependencyDiagnostic.currentVersionStartOffset - versionOffset;
							dependencyDiagnostic.currentVersionEndOffset = dependencyDiagnostic.currentVersionEndOffset - versionOffset;
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

	vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
		if (isPubspecFile(document.fileName)) {
			vscode.commands.executeCommand('pubspec-dependency-inspector.analyzeDependencies');
		}
	});

	vscode.window.onDidChangeActiveTextEditor((editor: vscode.TextEditor | undefined) => {
		if (editor !== undefined && isPubspecFile(editor.document.fileName)) {
			vscode.commands.executeCommand('pubspec-dependency-inspector.analyzeDependencies');
		}
	});
}

// This method is called when your extension is deactivated
export function deactivate() { }
