import { countRelated } from 'ilios-common/helpers/count-related';
import { module, test } from 'qunit';

module('Unit | Helper | count related', function () {
  test('calls has many on object', function (assert) {
    assert.expect(2);
    const object = {
      hasMany(what) {
        assert.strictEqual(what, 'stuff');

        return {
          ids() {
            return ['rhett', 'pat'];
          },
        };
      },
    };
    const result = countRelated([object, 'stuff']);
    assert.strictEqual(result, 2);
  });

  test('missing what returns false', function (assert) {
    const object = {
      countRelated() {},
    };
    const result = countRelated([object, null]);
    assert.notOk(result);
  });

  test('missing object returns false', function (assert) {
    const result = countRelated([null, 'what']);
    assert.notOk(result);
  });

  test('object with no countRelated method returns false', function (assert) {
    const object = {};
    const result = countRelated([object, 'what']);
    assert.notOk(result);
  });
});
