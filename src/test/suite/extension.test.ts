import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';
import * as network from '../../network';
import { Dependency } from '../../analyze_dependencies';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});

	test('Sample test 2', () => {
		var dependency: Dependency = {
			name: 'provider',
			currentVersion: '^6.0.5',
			dependencyStartOffset: 0,
			dependencyEndOffset: 0,
			currentVersionStartOffset: 0,
			currentVersionEndOffset: 0,
			hasPrefix: false
		};

		assert.equal("te", "te", "ERROR");
		
	});
});
