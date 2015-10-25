import { isEqual } from '../../../helpers/is-equal';
import { module, test } from 'qunit';
import {a as testgroup} from 'ilios/tests/helpers/test-groups';

module('Unit | Helper | is equal' + testgroup);

test('correctly compares values', function(assert) {
  var result = isEqual([42, 42]);
  assert.ok(result);
  result = isEqual([42, '42']);
  assert.ok(!result);
  result = isEqual(['42', '42']);
  assert.ok(result);
});
