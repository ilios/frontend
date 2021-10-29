import jwtDecode from 'dummy/utils/jwt-decode';
import { module, test } from 'qunit';

module('Unit | Utility | jwt decode', function () {
  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ';
  test('it decodes a token', function (assert) {
    const obj = jwtDecode(token);
    assert.strictEqual(obj.sub, '1234567890');
    assert.strictEqual(obj.name, 'John Doe');
    assert.true(obj.admin);
  });
});
