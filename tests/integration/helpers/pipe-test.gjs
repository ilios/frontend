// taken from Ember Composable Helpers (https://github.com/DockYard/ember-composable-helpers), then modified.

import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { click,render } from '@ember/test-helpers';
import pipe from 'frontend/helpers/pipe';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { module, test } from 'qunit';
import { resolve } from 'rsvp';

module('Integration | Helper | pipe', function (hooks) {
  setupRenderingTest(hooks);

  test('it pipes actions', async function (assert) {
    this.set('value', 0);
    this.set('add', (x, y) => x + y);
    this.set('square', (x) => x * x);
    this.set('squareRoot', (x) => this.set('value', Math.sqrt(x)));
    this.set('label', 'Calculate');

    await render(
      <template>
        <p>{{this.value}}</p>
        <button type="button" {{on "click" (pipe (fn this.add 2 4) this.square this.squareRoot)}}>
          {{this.label}}
        </button>
      </template>,
    );

    assert.dom('p').hasText('0', 'precond - should render 0');
    await click('button');
    assert.dom('p').hasText('6', 'should render 6');
  });

  test('it handles promises', async function (assert) {
    this.set('value', 0);
    this.set('add', (x, y) => x + y);
    this.set('square', (x) => x * x);
    this.set('squareRoot', (x) => this.set('value', Math.sqrt(x)));
    this.set('resolvify', resolve);
    this.set('label', 'Calculate');

    await render(
      <template>
        <p>{{this.value}}</p>
        <button
          type="button"
          {{on "click" (pipe (fn this.add 2 4) this.square this.resolvify this.squareRoot)}}
        >
          {{this.label}}
        </button>
      </template>,
    );

    assert.dom('p').hasText('0', 'precond - should render 0');
    await click('button');
    assert.dom('p').hasText('6', 'should render 6');
  });
});
