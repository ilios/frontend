import {
  findBy,
  findById,
  mapBy,
  sortByDate,
  sortByString,
  sortByNumber,
  uniqueBy,
  uniqueById,
  uniqueValues,
} from 'ilios-common/utils/array-helpers';
import { module, test } from 'qunit';

function getDogs() {
  return [
    { name: 'jayden', dob: new Date(2017, 11, 11), goodnessRanking: 10 },
    { name: 'jasper', dob: new Date(2005, 11, 11), goodnessRanking: 4 },
    { name: 'jackson', dob: new Date(2010, 11, 11), goodnessRanking: 15 },
  ];
}

module('Unit | Utility | array-helpers', function () {
  test('when array is false', function (assert) {
    assert.false(mapBy(false, 'name'));
    assert.false(sortByDate(false, 'dob'));
    assert.false(sortByString(false, 'name'));
    assert.false(sortByNumber(false, 'goodnessRanking'));
    assert.false(uniqueBy(false, 'name'));
    assert.false(uniqueById(false));
    assert.false(uniqueValues(false));
    assert.false(findBy(false, 'name', 'jayden'));
    assert.false(findById(false, 'jayden'));
  });
  test('when array is null', function (assert) {
    assert.strictEqual(mapBy(null, 'name'), null);
    assert.strictEqual(sortByDate(null, 'dob'), null);
    assert.strictEqual(sortByString(null, 'name'), null);
    assert.strictEqual(sortByNumber(null, 'goodnessRanking'), null);
    assert.strictEqual(uniqueBy(null, 'name'), null);
    assert.strictEqual(uniqueById(null), null);
    assert.strictEqual(uniqueValues(null), null);
    assert.strictEqual(findBy(null, 'name', 'jackson'), null);
    assert.strictEqual(findById(null, 'jackson'), null);
  });
  test('when array is undefined', function (assert) {
    assert.strictEqual(mapBy(undefined, 'name'), undefined);
    assert.strictEqual(sortByDate(undefined, 'dob'), undefined);
    assert.strictEqual(sortByString(undefined, 'name'), undefined);
    assert.strictEqual(sortByNumber(undefined, 'goodnessRanking'), undefined);
    assert.strictEqual(uniqueBy(undefined, 'name'), undefined);
    assert.strictEqual(uniqueById(undefined), undefined);
    assert.strictEqual(uniqueValues(undefined), undefined);
    assert.strictEqual(findBy(undefined, 'name', 'jasper'), undefined);
    assert.strictEqual(findById(undefined, 'jasper'), undefined);
  });

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

  test('uniqueBy', function (assert) {
    const arr = [...getDogs(), ...getDogs(), ...getDogs()];
    assert.strictEqual(arr.length, 9);
    const result = uniqueBy(arr, 'name');
    assert.strictEqual(result.length, 3);
    assert.strictEqual(result[0].name, 'jayden');
    assert.strictEqual(result[1].name, 'jasper');
    assert.strictEqual(result[2].name, 'jackson');
  });
  test('uniqueBy when key does not exist', function (assert) {
    const arr = [{ id: 1, name: 'one' }, {}, { id: 1, name: 'one' }];
    const result = uniqueBy(arr, 'id');
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0].name, 'one');
    assert.deepEqual(result[1], {});
  });
  test('uniqueBy when item is undefined', function (assert) {
    const arr = [{ id: 1, name: 'one' }, undefined, { id: 1, name: 'one' }];
    const result = uniqueBy(arr, 'id');
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0].name, 'one');
    assert.deepEqual(result[1], undefined);
  });
  test('uniqueBy when item is null', function (assert) {
    const arr = [{ id: 1, name: 'one' }, null, { id: 1, name: 'one' }];
    const result = uniqueBy(arr, 'id');
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0].name, 'one');
    assert.deepEqual(result[1], null);
  });

  test('uniqueById', function (assert) {
    const arr = [
      { id: 1, name: 'one' },
      { id: 2, name: 'two' },
      { id: 1, name: 'one' },
    ];
    const result = uniqueById(arr);
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0].name, 'one');
    assert.strictEqual(result[1].name, 'two');
  });
  test('uniqueById when key does not exist', function (assert) {
    const arr = [{ id: 1, name: 'one' }, {}, { id: 1, name: 'one' }];
    const result = uniqueById(arr);
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0].name, 'one');
    assert.deepEqual(result[1], {});
  });
  test('uniqueById when item is undefined', function (assert) {
    const arr = [{ id: 1, name: 'one' }, undefined, { id: 1, name: 'one' }];
    const result = uniqueById(arr);
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0].name, 'one');
    assert.deepEqual(result[1], undefined);
  });
  test('uniqueById when item is null', function (assert) {
    const arr = [{ id: 1, name: 'one' }, null, { id: 1, name: 'one' }];
    const result = uniqueById(arr);
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0].name, 'one');
    assert.deepEqual(result[1], null);
  });

  test('uniqueValues', function (assert) {
    const arr = ['one', 'two', 'one'];
    const result = uniqueValues(arr);
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0], 'one');
    assert.strictEqual(result[1], 'two');
  });
  test('uniqueValues when item is undefined', function (assert) {
    const arr = ['one', undefined, null, undefined, null, 'two', 'one'];
    const result = uniqueValues(arr);
    assert.strictEqual(result.length, 4);
    assert.strictEqual(result[0], 'one');
    assert.deepEqual(result[1], undefined);
    assert.deepEqual(result[2], null);
    assert.deepEqual(result[3], 'two');
  });

  test('findBy', function (assert) {
    const result = findBy(getDogs(), 'goodnessRanking', 10);
    assert.ok(result);
    assert.strictEqual(result.name, 'jayden');
  });
  test('findBy when key does not exist', function (assert) {
    const arr = [{ id: 1, name: 'one' }, {}, { id: 3, name: 'three' }];
    const result = findBy(arr, 'id', 3);
    assert.ok(result);
    assert.strictEqual(result.name, 'three');
  });
  test('findBy when item is null', function (assert) {
    const arr = [{ id: 1, name: 'one' }, null, { id: 3, name: 'three' }];
    const result = findBy(arr, 'id', 3);
    assert.ok(result);
    assert.strictEqual(result.name, 'three');
  });
  test('findBy when item is undefined', function (assert) {
    const arr = [{ id: 1, name: 'one' }, undefined, { id: 3, name: 'three' }];
    const result = findBy(arr, 'id', 3);
    assert.ok(result);
    assert.strictEqual(result.name, 'three');
  });

  test('findById', function (assert) {
    const arr = [
      { id: 1, name: 'one' },
      { id: 2, name: 'two' },
      { id: 3, name: 'three' },
    ];
    const result = findById(arr, 2);
    assert.ok(result);
    assert.strictEqual(result.name, 'two');
  });
  test('findById when key does not exist', function (assert) {
    const arr = [{ id: 1, name: 'one' }, {}, { id: 3, name: 'three' }];
    const result = findById(arr, 3);
    assert.ok(result);
    assert.strictEqual(result.name, 'three');
  });
  test('findById when item is null', function (assert) {
    const arr = [{ id: 1, name: 'one' }, null, { id: 3, name: 'three' }];
    const result = findById(arr, 3);
    assert.ok(result);
    assert.strictEqual(result.name, 'three');
  });
  test('findById when item is undefined', function (assert) {
    const arr = [{ id: 1, name: 'one' }, undefined, { id: 3, name: 'three' }];
    const result = findById(arr, 3);
    assert.ok(result);
    assert.strictEqual(result.name, 'three');
  });
});
