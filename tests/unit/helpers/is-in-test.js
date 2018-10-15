import { isIn } from 'ilios-common/helpers/is-in';
import { module, test } from 'qunit';

module('Unit | Helper | is in');

test('correctly calculates if a value is in an array', function(assert) {
  var result = isIn([[42], 42]);
  assert.ok(result);
  result = isIn([[42], '42']);
  assert.ok(!result);
  result = isIn([['42'], '42']);
  assert.ok(result);
  let obj1 = {};
  let obj2 = {};
  let obj3 = {};
  result = isIn([[obj1, obj2], obj1]);
  assert.ok(result);
  result = isIn([[obj1, obj2], obj3]);
  assert.ok(!result);
});
