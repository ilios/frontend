import { intersectionCount } from '../../../helpers/intersection-count';
import { module, test } from 'qunit';

module('Unit | Helper | intersection count ', function() {
  test('correctly calculates intersection count between two arrays', function(assert) {
    let result = intersectionCount([[42], [42]]);
    assert.equal(result, 1);
    result = intersectionCount([[3, 2, 1], [2, 3]]);
    assert.equal(result, 2);
    result = intersectionCount([[2, 3], [3, 2, 1]]);
    assert.equal(result, 2);
    result = intersectionCount([[], [1, 2, 3]]);
    assert.equal(result, 0);
    result = intersectionCount(['not an array', [1, 2]]);
    assert.equal(result, 0);

    let objA = {}, objB = {}, objC = 'a', objD = [];
    result = intersectionCount([[objA], [objA]]);
    assert.equal(result, 1);
    result = intersectionCount([[objA], [objB]]);
    assert.equal(result, 0);
    result = intersectionCount([[objA, objD], [objA, objB, objC, objD]]);
    assert.equal(result, 2);
  });
});