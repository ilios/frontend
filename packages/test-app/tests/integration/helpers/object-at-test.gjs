// taken from Ember Composable Helpers (https://github.com/DockYard/ember-composable-helpers), then modified.

import { A as emberArray } from '@ember/array';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import objectAt from 'ilios-common/helpers/object-at';

module('Integration | Helper | object-at', function (hooks) {
  setupRenderingTest(hooks);

  test('It gets an object by index', async function (assert) {
    this.set('array', ['apples', 'oranges', 'bananas']);
    this.set('index', 1);

    await render(<template>{{objectAt this.index this.array}}</template>);

    assert.dom().hasText('oranges', 'the correct object is displayed');
  });

  test('It returns undefined with the index is outside the bounds of the array', async function (assert) {
    this.set('array', ['apples', 'oranges', 'bananas']);
    this.set('index', 5);

    await render(<template>{{if (objectAt this.index this.array) "true" "false"}}</template>);

    assert.dom().hasText('false', 'the returned value is falsey');
  });

  test('It returns an updated value when the object at the given index changes', async function (assert) {
    this.set('array', emberArray(['apples', 'oranges', 'bananas']));
    this.set('index', 1);

    await render(<template>{{objectAt this.index this.array}}</template>);

    assert.dom().hasText('oranges', 'the original object is display');

    // eslint-disable-next-line ember/no-runloop
    run(() => this.get('array').removeAt(1, 1));

    assert.dom().hasText('bananas', 'the new object is displayed');
  });

  test('It returns undefined if using an non-array-like object', async function (assert) {
    this.set('array', 'foo');
    this.set('index', 1);

    await render(<template>{{objectAt this.index this.array}}</template>);

    assert.dom().hasText('', 'nothing is displayed');
  });

  test('it allows null array', async function (assert) {
    this.set('array', null);
    this.set('text', 'this is all that will render');

    await render(
      <template>
        {{this.text}}
        {{objectAt 1 this.array}}
      </template>,
    );

    assert.dom().hasText('this is all that will render', 'no error is thrown');
  });

  test('it allows undefined array', async function (assert) {
    this.set('array', undefined);
    this.set('text', 'this is all that will render');

    await render(
      <template>
        {{this.text}}
        {{objectAt 1 this.array}}
      </template>,
    );

    assert.dom().hasText('this is all that will render', 'no error is thrown');
  });
});
