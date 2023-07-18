import * as assert from 'assert';
import { getDependencyVersion } from "../analyze_dependencies";

suite('analyze_dependencies', () => {
    test('all version variants should be accepted', async () => {
        let result = getDependencyVersion("package_name: ^1.2.3");

        assert.equal(result[0], "^1.2.3");
        assert.equal(result[1], 6);
        assert.equal(result[2], true);
    });
});