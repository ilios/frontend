import { decodedJwtHasLtiAudienceClaims, jwtDecode } from 'ilios-common/utils/jwt-utils';
import { module, test } from 'qunit';
import { jwtEncode } from 'ilios-common';

module('Unit | Utility | jwt-utils', function () {
  test('it decodes a token', function (assert) {
    const token = jwtEncode({ sub: '1234567890', name: 'John Doe', admin: true });
    const obj = jwtDecode(token);
    assert.strictEqual(obj.sub, '1234567890');
    assert.strictEqual(obj.name, 'John Doe');
    assert.true(obj.admin);
  });

  test.each(
    'decoded token has LTI audience claim',
    [
      [undefined, false],
      [null, false],
      [{ not: 'an array or string' }, false],
      [[], false],
      [['foo', 'bar'], false],
      ['lti-dashboard', true],
      [['lti-dashboard'], true],
      ['lti-course-manager', true],
      [['lti-course-manager'], true],
      [['lti-dashboard', 'lti-course-manager'], true],
      [['lti-dashboard', 'lti-course-manager', 'foo'], true],
      [['lti-dashboard', 'foo'], true],
      [['lti-course-manager', 'foo'], true],
    ],
    async function (assert, [aud, expected]) {
      const decodedJwt = { aud };
      assert.strictEqual(decodedJwtHasLtiAudienceClaims(decodedJwt), expected);
    },
  );
});
