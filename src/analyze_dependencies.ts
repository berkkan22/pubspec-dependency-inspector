import * as fs from "fs";
import * as vscode from "vscode";
import { fetchDependency } from "./network";
import { off } from "process";

export interface Dependency {
    name: string;
    currentVersion: string;
    latestVersion?: string;
    updateAvailable?: boolean;
    dependencyStartOffset: number;
    dependencyEndOffset: number;
    currentVersionStartOffset: number;
    currentVersionEndOffset: number;
    latestVersionStartOffset?: number;
    latestVersionEndOffset?: number;
    hasPrefix: boolean;
    latestVersionOffset?: number;
}

export interface CustomDiagnostic {
    diagnostic: vscode.Diagnostic;
    dependency: Dependency;
}

// return the name of the dependency
export function getDependencyName(input: string): string {
    let temp = input.split(":");
    let name = temp[0].trim();
    return name;
}

// return the version of the dependency
export function getDependencyVersion(input: string): [string, number, boolean] {
    const regex = /\^*(\d+\.\d+\.\d+)(\+\d)*/;
    const match = input.match(regex);
    let versionNumber = '';
    if (match && match.length > 1) {
        versionNumber = match[0];
        console.log(versionNumber); // Output: 1.0.0
        console.log(match[1]); // Output: 1.0.0
    } else {
        console.log('No version number found in the line.');
    }

    if (versionNumber.includes("^")) {
        return [versionNumber, versionNumber.length, true];
    }
    else {
        return [versionNumber, versionNumber.length, false];
    }
}

const REGEX_DEPENDENCY =
    /^\s*(?!version|sdk|ref)\S+:\s*[<=>|^]*([0-9]+\.[0-9]+\.[0-9]+\+?\S*)/;

// checks if the file is a pubspec.yaml file
export function isPubspecFile(filePath: string): boolean {
    return filePath.includes("pubspec.yaml") || filePath.includes("pubspec.yml")
}

// checks if the file content contains "dependencies" keyword
export function isPubspecFileContent(fileContent: string): boolean {
    return fileContent.includes("dependencies:");
}

// checks if the line is a dependency
export function isPubPackageName(input: string): boolean {
    const regexPattern = new RegExp(REGEX_DEPENDENCY);
    return regexPattern.test(input);
}

// read the file and return a list of the dependencies
export function readPackageLines(
    filePath: string
): Dependency[] {
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    const dependenciesList: Dependency[] = [];
    let line = '';
    let counter = 0;
    let dependenciesReached = false;


    for (let i = 0; i < fileContent.length; i++) {
        const char = fileContent[i];
        counter++;

        if (char === '\n' || char === '\r') {
            if (line === 'dependencies:') {
                dependenciesReached = true;
            }

            if (!line.startsWith('#') && isPubPackageName(line) && dependenciesReached) {
                // TODO: get dependency name and version
                var name = getDependencyName(line);
                var version = getDependencyVersion(line);
                var dependencyStart = counter - 1 - line.length + (line.length - line.trimStart().length);
                var dependencyEnd = counter - 1 - (line.length - line.trimEnd().length);
                var hasPrefix = version[2];
                var versionStart = dependencyStart + name.length + 2;
                var versionEnd = versionStart + version[1];
                console.log(`name: ${name}`);
                console.log(`line length: ${line.length}`);
                console.log(`dependencyStart: ${dependencyStart}`);
                console.log(`dependencyEnd: ${dependencyEnd}`);
                console.log(`versionStart: ${versionStart}`);
                console.log(`versionEnd: ${versionEnd}`);
                dependenciesList.push({
                    name: name,
                    currentVersion: version[0],
                    dependencyStartOffset: dependencyStart,
                    dependencyEndOffset: dependencyEnd,
                    currentVersionStartOffset: versionStart,
                    currentVersionEndOffset: versionEnd,
                    hasPrefix: hasPrefix
                });
            }
            //  provider: ^6.0.3  
            // extensionHostProcess.js:105
            // 319
            // extensionHostProcess.js:105
            // 318
            // extensionHostProcess.js:105
            // 317
            line = '';
        } else {
            line += char;
        }

    }
    return dependenciesList;
}

function getLineEnding(line: string): string | null {
    const lastCharacters = line.slice(-2);
    if (lastCharacters === '\r\n') {
        return 'CRLF'; // Carriage Return + Line Feed
    } else if (lastCharacters.endsWith('\r') || lastCharacters.endsWith('\n')) {
        return 'LF'; // Line Feed or Carriage Return
    }
    return null; // Line ending not found
}

// check for updates for each dependency and return a list of the dependencies with the latest version
// and whether an update is available or not
export async function checkForUpdates(dependencies: Dependency[]): Promise<Dependency[]> {
    for (let i = 0; i < dependencies.length; i++) {

        let response = await fetchDependency(dependencies[i]);
        if (response !== null) {
            let latestVersion = response.data.latest.version;

            if (dependencies[i].hasPrefix) {
                latestVersion = '^' + latestVersion;
                if (latestVersion !== dependencies[i].currentVersion) {
                    dependencies[i].latestVersion = latestVersion;
                    dependencies[i].latestVersionOffset = latestVersion.length;
                    dependencies[i].updateAvailable = true;

                } else {
                    // console.log(
                    //     `No update available for ${packageName}: ${currentPackageVersion}`
                    // );
                    dependencies[i].latestVersion = '';
                    dependencies[i].updateAvailable = false;
                }
            }
            else {
                if (latestVersion !== dependencies[i].currentVersion) {
                    dependencies[i].latestVersion = latestVersion;
                    dependencies[i].latestVersionOffset = latestVersion.length;
                    dependencies[i].updateAvailable = true;
                } else {
                    // console.log(
                    //     `No update available for ${packageName}: ${currentPackageVersion}`
                    // );
                    dependencies[i].latestVersion = '';
                    dependencies[i].updateAvailable = false;
                }
            }
        }
    }

    return dependencies;
}
