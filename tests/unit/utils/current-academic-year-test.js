import currentAcademicYear from 'ilios-common/utils/current-academic-year';
import { module, test } from 'qunit';

module('Unit | Utility | current-academic-year', function () {
  test('it works', function (assert) {
    //these tests are dumb, I acknowledge that
    let result = currentAcademicYear();
    assert.ok(result);
    assert.strictEqual(typeof result, 'number');
    assert.ok(result > 2023);
    assert.ok(result < 2040);
  });
});
