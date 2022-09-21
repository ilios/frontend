import {
  findBy,
  findById,
  filterBy,
  mapBy,
  sortBy,
  uniqueBy,
  uniqueById,
  uniqueValues,
} from 'ilios-common/utils/array-helpers';
import { module, test, todo } from 'qunit';

function getDogs() {
  return [
    {
      name: 'jayden',
      dob: new Date(2017, 11, 11),
      goodnessRanking: 10,
      breed: 'Chihuahua',
      barksForNoReason: false,
    },
    {
      name: 'jasper',
      dob: new Date(2005, 11, 11),
      goodnessRanking: 4,
      breed: 'Terrier',
      barksForNoReason: true,
    },
    {
      name: 'jackson',
      dob: new Date(2010, 11, 11),
      goodnessRanking: 15,
      breed: 'Chihuahua',
      barksForNoReason: false,
    },
  ];
}

module('Unit | Utility | array-helpers', function () {
  todo('when array is false', function (assert) {
    assert.strictEqual(mapBy(false, 'name'), []);
    assert.strictEqual(sortBy(false, 'dob'), []);
    assert.strictEqual(sortBy(false, ['name', 'goodnessRanking']), []);
    assert.strictEqual(uniqueBy(false, 'name'), []);
    assert.strictEqual(uniqueById(false), []);
    assert.strictEqual(uniqueValues(false), []);
    assert.strictEqual(findBy(false, 'name', 'jayden'), []);
    assert.strictEqual(findById(false, 'jayden'), []);
    assert.strictEqual(filterBy(false, 'breed', 'Chihuahua'), []);
  });
  todo('when array is null', function (assert) {
    assert.strictEqual(mapBy(null, 'name'), []);
    assert.strictEqual(sortBy(null, 'name'), []);
    assert.strictEqual(sortBy(null, ['name', 'goodnessRanking']), []);
    assert.strictEqual(uniqueBy(null, 'name'), []);
    assert.strictEqual(uniqueById(null), []);
    assert.strictEqual(uniqueValues(null), []);
    assert.strictEqual(findBy(null, 'name', 'jackson'), []);
    assert.strictEqual(findById(null, 'jackson'), []);
    assert.strictEqual(filterBy(null, 'breed', 'Chihuahua'), []);
  });
  todo('when array is undefined', function (assert) {
    assert.strictEqual(mapBy(undefined, 'name'), []);
    assert.strictEqual(sortBy(undefined, 'name'), []);
    assert.strictEqual(sortBy(undefined, ['name', 'goodnessRanking']), []);
    assert.strictEqual(uniqueBy(undefined, 'name'), []);
    assert.strictEqual(uniqueById(undefined), []);
    assert.strictEqual(uniqueValues(undefined), []);
    assert.strictEqual(findBy(undefined, 'name', 'jasper'), []);
    assert.strictEqual(findById(undefined, 'jasper'), []);
    assert.strictEqual(filterBy(undefined, 'breed', 'Chihuahua'), []);
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

  test('sortBy string', function (assert) {
    const result = sortBy(getDogs(), 'name');
    assert.strictEqual(result[0].name, 'jackson');
    assert.strictEqual(result[1].name, 'jasper');
    assert.strictEqual(result[2].name, 'jayden');
  });
  test('sortBy string when key does not exist', function (assert) {
    const arr = getDogs();
    arr[1] = {};
    const result = sortBy(arr, 'name');
    assert.deepEqual(result[0], {});
    assert.strictEqual(result[1].name, 'jackson');
    assert.strictEqual(result[2].name, 'jayden');
  });
  test('sortBy string when item is undefined', function (assert) {
    const arr = getDogs();
    arr[1] = undefined;
    const result = sortBy(arr, 'name');
    assert.strictEqual(result[0].name, 'jackson');
    assert.strictEqual(result[1].name, 'jayden');
    assert.strictEqual(result[2], undefined);
  });
  test('sortBy string when item is null', function (assert) {
    const arr = getDogs();
    arr[1] = null;
    const result = sortBy(arr, 'name');
    assert.strictEqual(result[0], null);
    assert.strictEqual(result[1].name, 'jackson');
    assert.strictEqual(result[2].name, 'jayden');
  });

  test('sortBy string multiple', function (assert) {
    const result = sortBy(getDogs(), ['breed', 'name']);
    assert.strictEqual(result[0].name, 'jackson');
    assert.strictEqual(result[1].name, 'jayden');
    assert.strictEqual(result[2].name, 'jasper');
  });
  test('sortBy string multiple when key does not exist', function (assert) {
    const arr = getDogs();
    arr[0] = {};
    const result = sortBy(arr, ['breed', 'name']);
    assert.deepEqual(result[0], {});
    assert.strictEqual(result[1].name, 'jackson');
    assert.strictEqual(result[2].name, 'jasper');
  });
  test('sortBy string multiple when item is undefined', function (assert) {
    const arr = getDogs();
    arr[0] = undefined;
    const result = sortBy(arr, ['breed', 'name']);
    assert.strictEqual(result[0].name, 'jackson');
    assert.strictEqual(result[1].name, 'jasper');
    assert.strictEqual(result[2], undefined);
  });
  test('sortBy string multiple when item is null', function (assert) {
    const arr = getDogs();
    arr[0] = null;
    const result = sortBy(arr, ['breed', 'name']);
    assert.strictEqual(result[0], null);
    assert.strictEqual(result[1].name, 'jackson');
    assert.strictEqual(result[2].name, 'jasper');
  });

  test('sortBy Date', function (assert) {
    const result = sortBy(getDogs(), 'dob');
    assert.strictEqual(result[0].name, 'jasper');
    assert.strictEqual(result[1].name, 'jackson');
    assert.strictEqual(result[2].name, 'jayden');
  });
  test('sortBy Date when key does not exist', function (assert) {
    const arr = getDogs();
    arr[1] = {};
    const result = sortBy(arr, 'dob');
    assert.deepEqual(result[0], {});
    assert.strictEqual(result[1].name, 'jackson');
    assert.strictEqual(result[2].name, 'jayden');
  });
  test('sortBy Date when item is undefined', function (assert) {
    const arr = getDogs();
    arr[1] = undefined;
    const result = sortBy(arr, 'dob');
    assert.strictEqual(result[0].name, 'jackson');
    assert.strictEqual(result[1].name, 'jayden');
    assert.strictEqual(result[2], undefined);
  });
  test('sortBy Date when item is null', function (assert) {
    const arr = getDogs();
    arr[1] = null;
    const result = sortBy(arr, 'dob');
    assert.strictEqual(result[0], null);
    assert.strictEqual(result[1].name, 'jackson');
    assert.strictEqual(result[2].name, 'jayden');
  });

  test('sortBy number', function (assert) {
    const result = sortBy(getDogs(), 'goodnessRanking');
    assert.strictEqual(result[0].name, 'jasper');
    assert.strictEqual(result[1].name, 'jayden');
    assert.strictEqual(result[2].name, 'jackson');
  });
  test('sortBy number when key does not exist', function (assert) {
    const arr = getDogs();
    arr[1] = {};
    const result = sortBy(arr, 'goodnessRanking');
    assert.deepEqual(result[0], {});
    assert.strictEqual(result[1].name, 'jayden');
    assert.strictEqual(result[2].name, 'jackson');
  });
  test('sortBy number when item is undefined', function (assert) {
    const arr = getDogs();
    arr[1] = undefined;
    const result = sortBy(arr, 'goodnessRanking');
    assert.strictEqual(result[0].name, 'jayden');
    assert.strictEqual(result[1].name, 'jackson');
    assert.strictEqual(result[2], undefined);
  });
  test('sortBy number when item is null', function (assert) {
    const arr = getDogs();
    arr[1] = null;
    const result = sortBy(arr, 'goodnessRanking');
    assert.strictEqual(result[0], null);
    assert.strictEqual(result[1].name, 'jayden');
    assert.strictEqual(result[2].name, 'jackson');
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
  test('uniqueBy with multiple null and undefined', function (assert) {
    const arr = [{ id: 1, name: 'one' }, { id: 1, name: 'one' }, null, null, undefined, undefined];
    const result = uniqueBy(arr, 'id');
    assert.strictEqual(result.length, 3);
    assert.strictEqual(result[0].name, 'one');
    assert.deepEqual(result[1], null);
    assert.deepEqual(result[2], undefined);
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

  test('filterBy', function (assert) {
    const result = filterBy(getDogs(), 'breed', 'Terrier');
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].name, 'jasper');
    const result2 = filterBy(getDogs(), 'breed', 'Chihuahua');
    assert.strictEqual(result2.length, 2);
    assert.strictEqual(result2[0].name, 'jayden');
    assert.strictEqual(result2[1].name, 'jackson');
  });
  test('filterBy when key does not exist', function (assert) {
    const arr = getDogs();
    delete arr[2].breed;
    const result = filterBy(arr, 'breed', 'Chihuahua');
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].name, 'jayden');
  });
  test('filterBy when item is null', function (assert) {
    const arr = getDogs();
    arr[2] = null;
    const result = filterBy(arr, 'breed', 'Chihuahua');
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].name, 'jayden');
  });
  test('filterBy when item is undefined', function (assert) {
    const arr = getDogs();
    arr[2] = undefined;
    const result = filterBy(arr, 'breed', 'Chihuahua');
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].name, 'jayden');
  });

  test('filterBy bool', function (assert) {
    const result = filterBy(getDogs(), 'barksForNoReason');
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].name, 'jasper');
  });
  test('filterBy bool when key does not exist', function (assert) {
    const arr = getDogs();
    delete arr[2].barksForNoReason;
    const result = filterBy(arr, 'barksForNoReason');
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].name, 'jasper');
  });
  test('filterBy bool when item is null', function (assert) {
    const arr = getDogs();
    arr[2] = null;
    const result = filterBy(arr, 'barksForNoReason');
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].name, 'jasper');
  });
  test('filterBy bool when item is undefined', function (assert) {
    const arr = getDogs();
    arr[2] = undefined;
    const result = filterBy(arr, 'barksForNoReason');
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].name, 'jasper');
  });
});
