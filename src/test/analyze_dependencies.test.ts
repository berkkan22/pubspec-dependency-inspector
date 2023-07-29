import * as assert from 'assert';
import { getDependencyName, getDependencyVersion, isPubPackageName, isPubspecFile, readPackageLines } from "../analyze_dependencies";

suite('analyze_dependencies', () => {

    test("check if it is pubspec file", () => {
        const filePathOne = "pubspec.yaml";
        const filePathTwo = "pubspec.yml";
        const filePathThree = "pubspec.yam";
        const filePathFour = "pubspec.ymla";

        assert.equal(true, isPubspecFile(filePathOne));
        assert.equal(true, isPubspecFile(filePathTwo));
        assert.equal(false, isPubspecFile(filePathThree));
        assert.equal(false, isPubspecFile(filePathFour));
    });

    test("check if pubspec package name", () => {
        const packageOne = "path_provider: 2.0.1";
        const packageTwo = "hive_flutter: 1.1.0 # Add this line";
        const packageThree = "provider: ^1.2.3";
        const packageFour = "flutter_local_notifications: ^15.1.0+1";
        const packageFive = "flutter_local_notifications: 15.1.0+1";

        assert.equal(true, isPubPackageName(packageOne));
        assert.equal(true, isPubPackageName(packageTwo));
        assert.equal(true, isPubPackageName(packageThree));
        assert.equal(true, isPubPackageName(packageFour));
        assert.equal(true, isPubPackageName(packageFive));
    });

    test("get dependency version and name", () => {
        const packageOne = "path_provider: 2.0.1";
        const packageTwo = "hive_flutter: 1.1.0 # Add this line";
        const packageThree = "provider: ^1.2.3";
        const packageFour = "flutter_local_notifications: ^15.1.0+1";
        const packageFive = "flutter_local_notifications: 15.1.0+1";

        let name = getDependencyName(packageOne);
        let version = getDependencyVersion(packageOne);
        assert.equal(name, "path_provider");
        assert.equal(version[0], "2.0.1");
        assert.equal(version[1], 5);
        assert.equal(version[2], false);

        name = getDependencyName(packageTwo);
        version = getDependencyVersion(packageTwo);
        assert.equal(name, "hive_flutter");
        assert.equal(version[0], "1.1.0");
        assert.equal(version[1], 5);
        assert.equal(version[2], false);

        name = getDependencyName(packageThree);
        version = getDependencyVersion(packageThree);
        assert.equal(name, "provider");
        assert.equal(version[0], "^1.2.3");
        assert.equal(version[1], 6);
        assert.equal(version[2], true);

        name = getDependencyName(packageFour);
        version = getDependencyVersion(packageFour);
        assert.equal(name, "flutter_local_notifications");
        assert.equal(version[0], "^15.1.0+1");
        assert.equal(version[1], 9);
        assert.equal(version[2], true);

        name = getDependencyName(packageFive);
        version = getDependencyVersion(packageFive);
        assert.equal(name, "flutter_local_notifications");
        assert.equal(version[0], "15.1.0+1");
        assert.equal(version[1], 8);
        assert.equal(version[2], false);
    });

    test("read package lines", () => {
        let fileContent = `
        dependencies:
            provider: ^6.0.5
            hive: ^2.2.3
            hive_flutter: 1.1.0 # Add this line
            path_provider: 2.0.1
            flutter_local_notifications: ^15.1.0+1
            carousel_slider: ^4.2.1
        `;

        let dependencies = readPackageLines(fileContent);
        assert.equal(dependencies.length, 6);
    });

});