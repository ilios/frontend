import jwtDecode from 'dummy/utils/jwt-decode';
import { module, test } from 'qunit';

module('Unit | Utility | jwt decode');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ';
test('it decodes a token', function(assert) {
  let obj = jwtDecode(token);
  assert.equal(obj.sub, '1234567890');
  assert.equal(obj.name, 'John Doe');
  assert.equal(obj.admin, true);

});
