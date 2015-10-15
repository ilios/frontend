import { isEqual } from '../../../helpers/is-equal';
import { module, test } from 'qunit';

module('Unit | Helper | is equal');

test('correctly compares values', function(assert) {
  var result = isEqual([42, 42]);
  assert.ok(result);
  result = isEqual([42, '42']);
  assert.ok(!result);
  result = isEqual(['42', '42']);
  assert.ok(result);
});
