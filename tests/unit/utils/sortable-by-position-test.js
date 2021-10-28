import sortableByPosition from 'dummy/utils/sortable-by-position';
import { module, test } from 'qunit';

module('Unit | Utility | sortable-by-position', function () {
  test('sorts by position', function (assert) {
    const arr = [
      { id: 1, position: 3, title: 'third' },
      { id: 2, position: 1, title: 'first' },
      { id: 3, position: 2, title: 'second' },
    ];

    arr.sort(sortableByPosition);

    assert.strictEqual(arr[0].title, 'first');
    assert.strictEqual(arr[1].title, 'second');
    assert.strictEqual(arr[2].title, 'third');
  });
  test('sorts by id descending when positions are equal', function (assert) {
    const arr = [
      { id: 1, position: 0, title: 'third' },
      { id: 3, position: 0, title: 'first' },
      { id: 2, position: 0, title: 'second' },
    ];

    arr.sort(sortableByPosition);

    assert.strictEqual(arr[0].title, 'first');
    assert.strictEqual(arr[1].title, 'second');
    assert.strictEqual(arr[2].title, 'third');
  });
});
