// taken from Ember Composable Helpers (https://github.com/DockYard/ember-composable-helpers), then modified.
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';

module('Integration | Helper | slice', function (hooks) {
  setupRenderingTest(hooks);

  test('It slices an array with positional params', async function (assert) {
    this.set('array', [2, 4, 6]);
    await render(hbs`
      {{slice 1 3 this.array}}

`);
    assert.dom().hasText('4,6', 'sliced values');
  });

  test('It slices when only 2 params are passed', async function (assert) {
    this.set('array', [2, 4, 6]);
    await render(hbs`
      {{slice 1 this.array}}

`);
    assert.dom().hasText('4,6', 'sliced values');
  });

  test('It recomputes the slice if an item in the array changes', async function (assert) {
    let array = [2, 4, 6];
    this.set('array', array);
    await render(hbs`
      {{slice 1 3 this.array}}

`);
    assert.dom().hasText('4,6', 'sliced values');
    this.set('array', [2, 4, 5]);
    assert.dom().hasText('4,5', 'sliced values');
  });

  test('it allows null array', async function (assert) {
    this.set('array', null);
    this.set('text', 'this is all that will render');

    await render(hbs`
      {{this.text}}
      {{#each (slice 1 2 this.array) as |value|}}
        {{value}}
      {{/each}}

`);

    assert.dom().hasText('this is all that will render', 'no error is thrown');
  });

  test('it allows undefined array', async function (assert) {
    this.set('array', undefined);
    this.set('text', 'this is all that will render');

    await render(hbs`
      {{this.text}}
      {{#each (slice 1 2 this.array) as |value|}}
        {{value}}
      {{/each}}

`);

    assert.dom().hasText('this is all that will render', 'no error is thrown');
  });
});
