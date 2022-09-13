import { mapBy, sortByDate, sortByString, sortByNumber } from 'ilios-common/utils/array-helpers';
import { module, test } from 'qunit';

function getDogs() {
  return [
    { name: 'jayden', dob: new Date(2017, 11, 11), goodnessRanking: 10 },
    { name: 'jasper', dob: new Date(2005, 11, 11), goodnessRanking: 4 },
    { name: 'jackson', dob: new Date(2010, 11, 11), goodnessRanking: 15 },
  ];
}

module('Unit | Utility | array-helpers', function () {
  test('mapBy', function (assert) {
    let result = mapBy(getDogs(), 'name');
    assert.deepEqual(result, ['jayden', 'jasper', 'jackson']);
  });
  test('mapBy when key does not exist', function (assert) {
    const arr = getDogs();
    arr[1] = {};
    assert.deepEqual(mapBy(arr, 'name'), ['jayden', undefined, 'jackson']);
  });
  test('mapBy when item is undefined', function (assert) {
    const arr = getDogs();
    arr[1] = undefined;
    assert.deepEqual(mapBy(arr, 'name'), ['jayden', undefined, 'jackson']);
  });
  test('mapBy when item is null', function (assert) {
    const arr = getDogs();
    arr[1] = null;
    assert.deepEqual(mapBy(arr, 'name'), ['jayden', null, 'jackson']);
  });
  test('mapBy when array is false', function (assert) {
    assert.false(mapBy(false, 'name'));
  });
  test('mapBy when array is null', function (assert) {
    assert.deepEqual(mapBy(null, 'name'), null);
  });
  test('mapBy when array is undefined', function (assert) {
    assert.deepEqual(mapBy(undefined, 'name'), undefined);
  });

  test('sortByString', function (assert) {
    const result = sortByString(getDogs(), 'name');
    assert.strictEqual(result[0].name, 'jackson');
    assert.strictEqual(result[1].name, 'jasper');
    assert.strictEqual(result[2].name, 'jayden');
  });
  test('sortByString when key does not exist', function (assert) {
    const arr = getDogs();
    arr[1] = {};
    const result = sortByString(arr, 'name');
    assert.strictEqual(result[0].name, 'jackson');
    assert.strictEqual(result[1].name, 'jayden');
    assert.deepEqual(result[2], {});
  });
  test('sortByString when item is undefined', function (assert) {
    const arr = getDogs();
    arr[1] = undefined;
    const result = sortByString(arr, 'name');
    assert.strictEqual(result[0].name, 'jackson');
    assert.strictEqual(result[1].name, 'jayden');
    assert.strictEqual(result[2], undefined);
  });
  test('sortByString when item is null', function (assert) {
    const arr = getDogs();
    arr[1] = null;
    const result = sortByString(arr, 'name');
    assert.strictEqual(result[0].name, 'jackson');
    assert.strictEqual(result[1].name, 'jayden');
    assert.strictEqual(result[2], null);
  });
  test('sortByString when array is false', function (assert) {
    let result = sortByString(false, 'name');
    assert.false(result);
  });
  test('sortByString when array is null', function (assert) {
    let result = sortByString(null, 'name');
    assert.deepEqual(result, null);
  });
  test('sortByString when array is undefined', function (assert) {
    let result = sortByString(undefined, 'name');
    assert.deepEqual(result, undefined);
  });

  test('sortByDate', function (assert) {
    const result = sortByDate(getDogs(), 'dob');
    assert.strictEqual(result[0].name, 'jasper');
    assert.strictEqual(result[1].name, 'jackson');
    assert.strictEqual(result[2].name, 'jayden');
  });
  test('sortByDate when key does not exist', function (assert) {
    const arr = getDogs();
    arr[1] = {};
    const result = sortByDate(arr, 'dob');
    assert.strictEqual(result[0].name, 'jackson');
    assert.strictEqual(result[1].name, 'jayden');
    assert.deepEqual(result[2], {});
  });
  test('sortByDate when item is undefined', function (assert) {
    const arr = getDogs();
    arr[1] = undefined;
    const result = sortByDate(arr, 'dob');
    assert.strictEqual(result[0].name, 'jackson');
    assert.strictEqual(result[1].name, 'jayden');
    assert.strictEqual(result[2], undefined);
  });
  test('sortByDate when item is null', function (assert) {
    const arr = getDogs();
    arr[1] = null;
    const result = sortByDate(arr, 'dob');
    assert.strictEqual(result[0].name, 'jackson');
    assert.strictEqual(result[1].name, 'jayden');
    assert.strictEqual(result[2], null);
  });
  test('sortByDate when array is false', function (assert) {
    let result = sortByDate(false, 'dob');
    assert.false(result);
  });
  test('sortByDate when array is null', function (assert) {
    let result = sortByDate(null, 'dob');
    assert.deepEqual(result, null);
  });
  test('sortByDate when array is undefined', function (assert) {
    let result = sortByDate(undefined, 'dob');
    assert.deepEqual(result, undefined);
  });

  test('sortByNumber', function (assert) {
    const result = sortByNumber(getDogs(), 'goodnessRanking');
    assert.strictEqual(result[0].name, 'jasper');
    assert.strictEqual(result[1].name, 'jayden');
    assert.strictEqual(result[2].name, 'jackson');
  });
  test('sortByNumber when key does not exist', function (assert) {
    const arr = getDogs();
    arr[1] = {};
    const result = sortByNumber(arr, 'goodnessRanking');
    assert.strictEqual(result[0].name, 'jayden');
    assert.strictEqual(result[1].name, 'jackson');
    assert.deepEqual(result[2], {});
  });
  test('sortByNumber when item is undefined', function (assert) {
    const arr = getDogs();
    arr[1] = undefined;
    const result = sortByNumber(arr, 'goodnessRanking');
    assert.strictEqual(result[0].name, 'jayden');
    assert.strictEqual(result[1].name, 'jackson');
    assert.strictEqual(result[2], undefined);
  });
  test('sortByNumber when item is null', function (assert) {
    const arr = getDogs();
    arr[1] = null;
    const result = sortByNumber(arr, 'goodnessRanking');
    assert.strictEqual(result[0].name, 'jayden');
    assert.strictEqual(result[1].name, 'jackson');
    assert.strictEqual(result[2], null);
  });
  test('sortByNumber when array is false', function (assert) {
    let result = sortByNumber(false, 'goodnessRanking');
    assert.false(result);
  });
  test('sortByNumber when array is null', function (assert) {
    let result = sortByNumber(null, 'goodnessRanking');
    assert.deepEqual(result, null);
  });
  test('sortByNumber when array is undefined', function (assert) {
    let result = sortByNumber(undefined, 'goodnessRanking');
    assert.deepEqual(result, undefined);
  });
});
