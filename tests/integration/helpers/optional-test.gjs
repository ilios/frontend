// taken from Ember Composable Helpers (https://github.com/DockYard/ember-composable-helpers), then modified.

import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render, click } from '@ember/test-helpers';
import { on } from '@ember/modifier';
import optional from 'ilios-common/helpers/optional';
import pipe from 'ilios-common/helpers/pipe';
import { fn } from '@ember/helper';

module('Integration | Helper | optional', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.set('label', 'foobar');
  });

  test('If the action does not exist, it passes a no-op function', async function (assert) {
    assert.expect(0);
    await render(
      <template>
        <button
          type="button"
          aria-label={{this.label}}
          {{on "click" (optional this.handler)}}
        ></button>
      </template>,
    );
    await click('button');
  });

  test('If the action does exist, it passes the given action', async function (assert) {
    this.set('handler', () => {
      assert.step('handler called');
    });
    await render(
      <template>
        <button
          type="button"
          aria-label={{this.label}}
          {{on "click" (optional this.handler)}}
        ></button>
      </template>,
    );
    await click('button');
    assert.verifySteps(['handler called']);
  });

  test('Works in a pipe', async function (assert) {
    this.set('check', (value) => {
      assert.step('check called');
      assert.strictEqual(value, 42);
    });
    await render(
      <template>
        <button
          type="button"
          aria-label={{this.label}}
          {{on "click" (pipe (optional this.handler) (fn this.check 42))}}
        ></button>
      </template>,
    );
    await click('button');
    assert.verifySteps(['check called']);
  });
});
