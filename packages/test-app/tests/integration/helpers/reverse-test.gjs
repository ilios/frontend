// taken from Ember Composable Helpers (https://github.com/DockYard/ember-composable-helpers), then modified.

import { A as emberArray } from '@ember/array';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import reverse from 'ilios-common/helpers/reverse';

module('Integration | Helper | reverse', function (hooks) {
  setupRenderingTest(hooks);

  test('it reverses an array', async function (assert) {
    this.set('array', emberArray(['foo', 'bar', 'baz']));
    await render(
      <template>
        {{~#each (reverse this.array) as |item|~}}
          {{~item~}}
        {{~/each~}}
      </template>,
    );

    assert.dom().hasText('bazbarfoo', 'array is reversed');
  });

  test('It handles a non-ember array', async function (assert) {
    this.set('array', ['foo', 'bar', 'baz']);
    await render(
      <template>
        {{~#each (reverse this.array) as |item|~}}
          {{~item~}}
        {{~/each~}}
      </template>,
    );

    assert.dom().hasText('bazbarfoo', 'array is reversed');
  });

  test('It does not mutate the original array', async function (assert) {
    let array = ['foo', 'bar', 'baz'];
    this.set('array', array);
    await render(
      <template>
        {{~#each (reverse this.array) as |item|~}}
          {{~item~}}
        {{~/each~}}
      </template>,
    );

    assert.dom().hasText('bazbarfoo', 'array is reversed');
    assert.deepEqual(
      this.get('array'),
      ['foo', 'bar', 'baz'],
      'the original array is not reversed',
    );
  });

  test('It safely handles non-array values', async function (assert) {
    this.set('array', 'foo');
    await render(
      <template>
        {{~#each (reverse this.array) as |item|~}}
          {{~item~}}
        {{~/each~}}
      </template>,
    );

    assert.dom().hasText('foo', 'foo is rendered');
  });

  test('It recomputes when an item in the array changes', async function (assert) {
    let array = emberArray(['foo', 'bar', 'baz']);
    this.set('array', array);
    await render(
      <template>
        {{~#each (reverse this.array) as |item|~}}
          {{~item~}}
        {{~/each~}}
      </template>,
    );

    assert.dom().hasText('bazbarfoo', 'array is reversed');

    // eslint-disable-next-line ember/no-runloop
    run(() => array.removeAt(1));

    assert.dom().hasText('bazfoo', 'array is reversed');
  });

  test('it allows null array', async function (assert) {
    this.set('array', null);
    this.set('text', 'this is all that will render');

    await render(
      <template>
        {{this.text}}
        {{#each (reverse this.array) as |value|}}
          {{value}}
        {{/each}}
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
        {{#each (reverse this.array) as |value|}}
          {{value}}
        {{/each}}
      </template>,
    );

    assert.dom().hasText('this is all that will render', 'no error is thrown');
  });
});
