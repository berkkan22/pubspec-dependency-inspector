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

export class DependencyFromPubDev {
    name: string;
    latestVersion: string;
    description: string;

    constructor(name: string, latestVersion: string, description: string) {
        this.name = name;
        this.latestVersion = latestVersion;
        this.description = description;
    }

    static fromJson(json: any): DependencyFromPubDev {
        return new DependencyFromPubDev(
            json.latest.name,
            json.latest.version,
            json.latest.pubspec.description
        );
    }
}

// class Dependency  {
//     name: string;
//     currentVersion: string;
//     latestVersion?: string;
//     updateAvailable?: boolean;
//     dependencyStartOffset: number;
//     dependencyEndOffset: number;
//     currentVersionStartOffset: number;
//     currentVersionEndOffset: number;
//     latestVersionStartOffset?: number;
//     latestVersionEndOffset?: number;
//     hasPrefix: boolean;
//     latestVersionOffset?: number;

//     constructor(name: string, currentVersion: string, latestVersion: string, updateAvailable: boolean, dependencyStartOffset: number, dependencyEndOffset: number, currentVersionStartOffset: number, currentVersionEndOffset: number, latestVersionStartOffset: number, latestVersionEndOffset: number, hasPrefix: boolean, latestVersionOffset: number) {
//         this.name = name;
//         this.currentVersion = currentVersion;
//         this.latestVersion = latestVersion;
//         this.updateAvailable = updateAvailable;
//         this.dependencyStartOffset = dependencyStartOffset;
//         this.dependencyEndOffset = dependencyEndOffset;
//         this.currentVersionStartOffset = currentVersionStartOffset;
//         this.currentVersionEndOffset = currentVersionEndOffset;
//         this.latestVersionStartOffset = latestVersionStartOffset;
//         this.latestVersionEndOffset = latestVersionEndOffset;
//         this.hasPrefix = hasPrefix;
//         this.latestVersionOffset = latestVersionOffset;
//     }

// }