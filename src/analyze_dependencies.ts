import * as fs from "fs";
import { fetchDependency } from "./network";
import { Dependency, DependencyFromPubDev } from "./model/dependency";
import exp = require("constants");

const REGEX_DEPENDENCY_NAME =
    /^\s*(?!version|sdk|ref)\S+:\s*[<=>|^]*([0-9]+\.[0-9]+\.[0-9]+\+?\S*)/;
const REGEX_DEPENDENCY_VERSION = /\^*(\d+\.\d+\.\d+(\+\d)*)/;

const PUBSPEC_FILE_REGEX = /pubspec.(yaml|yml)$/;

// return the name of the dependency
export function getDependencyName(input: string): string {
    let temp = input.split(":");
    let name = temp[0].trim();
    return name;
}

// return the version of the dependency
export function getDependencyVersion(input: string): [string, number, boolean] {
    const match = input.match(REGEX_DEPENDENCY_VERSION);
    let versionNumber = '';
    if (match && match.length > 1) {
        versionNumber = match[0];
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


// checks if the file is a pubspec.yaml file
export function isPubspecFile(filePath: string): boolean {
    return filePath.match(PUBSPEC_FILE_REGEX) !== null;
}


// checks if the line is a dependency
export function isPubPackageName(input: string): boolean {
    const regexPattern = new RegExp(REGEX_DEPENDENCY_NAME);
    return regexPattern.test(input);
}

export function readFileContent(filePath: string): string {
    return fs.readFileSync(filePath, 'utf-8');
}

export function analyzeFileContent(filePath: string): Dependency[] {
    let fileContent = readFileContent(filePath);

    let dependencies = readPackageLines(fileContent);

    return dependencies;
}

// read the file and return a list of the dependencies
export function readPackageLines(
    fileContent: string
): Dependency[] {

    const dependenciesList: Dependency[] = [];
    let line = '';
    let counter = 0;
    let dependenciesReached = false;

    for (let i = 0; i < fileContent.length; i++) {
        const char = fileContent[i];
        counter++;

        if (char === '\n' || char === '\r') {
            if (line.includes('dependencies:')) {
                dependenciesReached = true;
            }

            if (!line.startsWith('#') && isPubPackageName(line) && dependenciesReached) {
                var name = getDependencyName(line);
                var version = getDependencyVersion(line);
                var dependencyStart = counter - 1 - line.length + (line.length - line.trimStart().length);
                var dependencyEnd = counter - 1 - (line.length - line.trimEnd().length);
                var hasPrefix = version[2];
                var versionStart = dependencyStart + name.length + 2;
                var versionEnd = versionStart + version[1];

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
            line = '';
        } else {
            line += char;
        }

    }
    return dependenciesList;
}

// check for updates for each dependency and return a list of the dependencies with the latest version
// and whether an update is available or not
export async function checkForUpdates(dependencies: Dependency[]): Promise<Dependency[]> {
    for (let i = 0; i < dependencies.length; i++) {

        let response = await fetchDependency(dependencies[i]);
        if (response === null) {
            return [];
        }

        let latestVersion = response.latestVersion;
        latestVersion = '^' + latestVersion;
        if (latestVersion !== dependencies[i].currentVersion) {
            dependencies[i].latestVersion = latestVersion;
            dependencies[i].latestVersionOffset = latestVersion.length;
            dependencies[i].updateAvailable = true;

        } else {
            dependencies[i].latestVersion = '';
            dependencies[i].updateAvailable = false;
        }

    }

    return dependencies;
}

export function newAdd(a: number, b: number) {
    return add(a, b);
}

export function add(a: number, b: number) {
    return a + b;
}