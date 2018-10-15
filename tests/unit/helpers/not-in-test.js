import { notIn } from '../../../helpers/not-in';
import { module, test } from 'qunit';

module('Unit | Helper | not in');


test('correctly calculates if a value is not in an array', function(assert) {
  var result = notIn([[42], 42]);
  assert.ok(!result);
  result = notIn([[42], '42']);
  assert.ok(result);
  result = notIn([['42'], '42']);
  assert.ok(!result);
  let obj1 = {};
  let obj2 = {};
  let obj3 = {};
  result = notIn([[obj1, obj2], obj1]);
  assert.ok(!result);
  result = notIn([[obj1, obj2], obj3]);
  assert.ok(result);
});
