import jwtDecode from 'test-app/utils/jwt-decode';
import { module, test } from 'qunit';
import { jwtEncode } from 'ilios-common';

module('Unit | Utility | jwt decode', function () {
  test('it decodes a token', function (assert) {
    const token = jwtEncode({ sub: '1234567890', name: 'John Doe', admin: true });
    const obj = jwtDecode(token);
    assert.strictEqual(obj.sub, '1234567890');
    assert.strictEqual(obj.name, 'John Doe');
    assert.true(obj.admin);
  });
});
