import { isEqual } from '../../../helpers/is-equal';
import { module, test } from 'qunit';

module('Unit | Helper | is equal', function() {
  test('correctly compares values', function(assert) {
    let result = isEqual([ 42, 42 ]);
    assert.ok(result);

    result = isEqual([ 42, '42' ]);
    assert.notOk(result);

    result = isEqual([ '42', '42' ]);
    assert.ok(result);
  });

  test('returns false when arguments are empty or `isBlank`', function(assert) {
    let result = isEqual([]);
    assert.notOk(result);

    result = isEqual([ 42 ]);
    assert.notOk(result);

    result = isEqual([ undefined, undefined ]);
    assert.notOk(result);
  });
});