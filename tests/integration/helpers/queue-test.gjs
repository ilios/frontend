// taken from Ember Composable Helpers (https://github.com/DockYard/ember-composable-helpers), then modified.

import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { click,render } from '@ember/test-helpers';
import queue from 'frontend/helpers/queue';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { module, test } from 'qunit';
import { resolve } from 'rsvp';

module('Integration | Helper | queue', function (hooks) {
  setupRenderingTest(hooks);

  test('it queues actions', async function (assert) {
    this.set('doAThing', () => null);
    this.set('process', (x) => this.set('value', x * x));
    this.set('undoAThing', () => null);
    this.set('value', 2);
    this.set('label', 'Calculate');

    await render(
      <template>
        <p>{{this.value}}</p>
        <button
          type="button"
          {{on "click" (fn (queue this.doAThing this.process this.undoAThing) this.value)}}
        >
          {{this.label}}
        </button>
      </template>,
    );

    assert.dom('p').hasText('2', 'precond - should render 2');
    await click('button');
    assert.dom('p').hasText('4', 'should render 4');
  });

  test('it handles promises', async function (assert) {
    this.set('value', 3);
    this.set('doAThingThatTakesTime', resolve);
    this.set('process', (x) => this.set('value', x * x));
    this.set('label', 'Calculate');

    await render(
      <template>
        <p>{{this.value}}</p>
        <button
          type="button"
          {{on "click" (fn (queue this.doAThingThatTakesTime this.process) this.value)}}
        >
          {{this.label}}
        </button>
      </template>,
    );

    assert.dom('p').hasText('3', 'precond - should render 3');
    await click('button');
    assert.dom('p').hasText('9', 'should render 9');
  });
});
