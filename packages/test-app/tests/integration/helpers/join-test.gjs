// taken from Ember Composable Helpers (https://github.com/DockYard/ember-composable-helpers), then modified.

import { A as emberArray } from '@ember/array';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import join from 'ilios-common/helpers/join';

module('Integration | Helper | join', function (hooks) {
  setupRenderingTest(hooks);

  test('It joins the words with given separator', async function (assert) {
    this.set('array', emberArray(['foo', 'bar', 'baz']));

    await render(<template>{{join ", " this.array}}</template>);

    assert.dom().hasText('foo, bar, baz', 'words are joined with a comma and a space');
  });

  test('It watches for changes', async function (assert) {
    let array = emberArray(['foo', 'bar', 'baz']);
    this.set('array', array);

    await render(<template>{{join ", " this.array}}</template>);

    // eslint-disable-next-line ember/no-runloop
    run(() => array.pushObject('quux'));

    assert.dom().hasText('foo, bar, baz, quux', 'quux was added');
  });

  test('it allows null array', async function (assert) {
    this.set('array', null);
    this.set('text', 'this is all that will render');

    await render(
      <template>
        {{this.text}}
        {{join ", " this.array}}
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
        {{join ", " this.array}}
      </template>,
    );

    assert.dom().hasText('this is all that will render', 'no error is thrown');
  });
});
