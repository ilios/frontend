// taken from Ember Composable Helpers (https://github.com/DockYard/ember-composable-helpers), then modified.
import asArray from 'ilios-common/utils/as-array';
import { module, test } from 'qunit';
import EmberObject from '@ember/object';

module('Unit | Utility | as-array', function () {
  test('it works for [undefined]', function (assert) {
    let result = asArray();
    assert.strictEqual(result.length, 0);
  });

  test('it works for [null]', function (assert) {
    let result = asArray(null);
    assert.strictEqual(result.length, 0);
  });

  test('it works for [Set]', function (assert) {
    let result = asArray(new Set([1, 2, 3]));
    assert.strictEqual(result.length, 3);
  });

  test('it works for [Map]', function (assert) {
    let map = new Map();
    map.set(1, 1);
    map.set(2, 1);
    map.set(3, 1);
    let result = asArray(map);
    assert.strictEqual(result.length, 3);
  });

  test('it works for [Object]', function (assert) {
    let result = asArray({ a: 1, b: 2, c: 3 });
    assert.strictEqual(result.length, 3);
  });

  test('it works for [Object.toArray()]', function (assert) {
    let result = asArray({
      a: 1,
      toArray() {
        return [1, 2, 3];
      },
    });
    assert.strictEqual(result.length, 3);
  });

  test('it works for [Strings]', function (assert) {
    let result = asArray('abc');
    assert.strictEqual(result.length, 3);
  });

  test('it not works for number', function (assert) {
    assert.throws(() => asArray(1), /not supported/);
  });

  test('it not works for non-iterable items', function (assert) {
    assert.throws(() => asArray(Symbol('a')), /not iterable/);
  });

  test('it not works for non-object content in array-proxy-like items', function (assert) {
    const item = new Promise((r) => r());
    item.content = null;
    assert.throws(() => asArray(item), /Unknown content type in array-like object/);
  });

  test('it works for object-like content in array-proxy-like items [arrays]', function (assert) {
    const item = new Promise((r) => r());
    item.content = [1, 2, 3];
    assert.strictEqual(asArray(item).length, 3);
  });

  test('it works for object-like content in array-proxy-like items [objects]', function (assert) {
    const item = new Promise((r) => r());
    item.content = { a: 1, b: 2, c: 3 };
    assert.strictEqual(asArray(item).length, 3);
  });

  test('it works for object-like content in array-proxy-like items [objects toArray]', function (assert) {
    const item = new Promise((r) => r());
    item.content = {
      a: 1,
      toArray() {
        return [1, 2, 3];
      },
    };
    assert.strictEqual(asArray(item).length, 3);
  });

  test('it works for object-like content in array-proxy-like items [sets]', function (assert) {
    const item = new Promise((r) => r());
    item.content = new Set([1, 2, 3]);
    assert.strictEqual(asArray(item).length, 3);
  });

  test('it works for ember object with toArray property [EmberObject]', function (assert) {
    // eslint-disable-next-line ember/no-classic-classes
    const item = EmberObject.extend({
      toArray() {
        return [1, 2, 3];
      },
    }).create();
    assert.strictEqual(asArray(item).length, 3);
  });

  test('it works for object-like content in array-proxy-like items [maps]', function (assert) {
    const item = new Promise((r) => r());
    item.content = new Map();
    item.content.set(1, 1);
    item.content.set(2, 1);
    item.content.set(3, 1);
    assert.strictEqual(asArray(item).length, 3);
  });

  test('it not works for proxy-like object as array', function (assert) {
    const item = new Promise((r) => r());
    assert.throws(() => asArray(item), /Promise-like objects is not supported as arrays/);
  });

  test('it not works for WeakMap as array', function (assert) {
    const item = new WeakMap();
    assert.ok(() => asArray(item), /WeakMaps is not supported as arrays/);
  });

  test('it not works for WeakSet as array', function (assert) {
    const item = new WeakSet();
    assert.throws(() => asArray(item), /WeakSets is not supported as arrays/);
  });

  test('it not works for EmberObject as array', function (assert) {
    // eslint-disable-next-line ember/no-classic-classes
    const item = EmberObject.extend({}).create();
    assert.throws(() => asArray(item), /EmberObjects is not supported as arrays/);
  });
});
