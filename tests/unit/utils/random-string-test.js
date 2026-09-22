import randomString from '../../../utils/random-string';
import { module, test } from 'qunit';

module('Unit | Utility | random string', function () {
  test('gives some random strings', function (assert) {
    var result1 = randomString();
    var result2 = randomString();
    assert.ok(result1);
    assert.ok(result2);
    assert.notEqual(result1, result2);
  });
});
