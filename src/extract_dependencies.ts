
export interface Dependency {
    name: string;
    currentVersion: string;
    latestVersion: string;
}

const REGEX_DEPENDENCY = /^\s*(?!version|sdk|ref)\S+:\s*[<=>|^]*([0-9]+\.[0-9]+\.[0-9]+\+?\S*)/;

export function isPubPackageName(input: string): boolean {
    const regexPattern = new RegExp(REGEX_DEPENDENCY);
    return regexPattern.test(input);
}