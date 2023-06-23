import * as fs from "fs";
import * as vscode from "vscode";
import { fetchDependency } from "./network";
import { off } from "process";

export interface Dependency {
    name: string;
    currentVersion: string;
    latestVersion?: string;
    offset?: number;
    updateAvailable?: boolean;
    lineOffset?: number;
    versionOffset?: number;
    hasPrefix?: boolean;
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
    let temp = input.split(":");
    let version = temp[1].trim();
    let offset = temp[1].trim().length;
    if(temp[1].includes("^")) {
        version = version.substring(1);

        return [version, offset, true];
    }
    return [version, offset, false];
}

const REGEX_DEPENDENCY =
    /^\s*(?!version|sdk|ref)\S+:\s*[<=>|^]*([0-9]+\.[0-9]+\.[0-9]+\+?\S*)/;

// checks if the file is a pubspec.yaml file
export function isPubspecFile(filePath: string): boolean {
    const fileContent = fs.readFileSync(filePath, "utf8");
    return isPubspecFileContent(fileContent);
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
    const fileContent = fs.readFileSync(filePath, "utf8");

    const dependenciesList: Dependency[] = [];
    let line = "";
    let counter = 0;
    let dependenciesReached = false;

    for (let i = 0; i < fileContent.length; i++) {
        const char = fileContent[i];
        counter++;

        if (char === "\n") {
            line = line.trim();
            if (line === "dependencies:") {
                dependenciesReached = true;
            }
            if (
                !line.startsWith("#") &&
                isPubPackageName(line) &&
                dependenciesReached
            ) {
                const lineOffset = line.length;
                const name = getDependencyName(line);
                const temp = getDependencyVersion(line);
                const version = temp[0];
                const versionOffset = temp[1];
                const hasPrefix = temp[2];

                let dependencies: Dependency = { name: name, currentVersion: version, offset: counter - 2, lineOffset: lineOffset, };
                dependencies.offset = counter - 2;
                dependencies.lineOffset = lineOffset;
                dependencies.versionOffset = versionOffset;
                dependencies.hasPrefix = hasPrefix;

                dependenciesList.push(dependencies);
            }
            line = "";
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
        if (response !== null) {
            let latestVersion = response.data.latest.version;
            if (latestVersion !== dependencies[i].currentVersion) {
                // console.log(
                //     `Update available for ${packageName}: ${currentPackageVersion} -> ${latestVersion}`
                // );
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

    return dependencies;
}
