// taken from Ember Composable Helpers (https://github.com/DockYard/ember-composable-helpers), then modified.

import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { click, render } from '@ember/test-helpers';
import { on } from '@ember/modifier';
import pipe from 'ilios-common/helpers/pipe';
import pick from 'ilios-common/helpers/pick';

module('Integration | Helper | pick', function (hooks) {
  setupRenderingTest(hooks);

  test('Works when used with {{on}} modifier and pipe', async function (assert) {
    this.set('label', 'foo bar');
    this.set('onFocus', function (value) {
      assert.step('onFocus called');
      assert.strictEqual(value, 'pizza party', 'The action receives the correct value');
    });

    await render(
      <template>
        <label>
          <input
            id="test-input"
            value="pizza party"
            {{on "focusin" (pipe (pick "target.value") this.onFocus)}}
          />
          {{this.label}}
        </label>
      </template>,
    );

    await click('#test-input');
    assert.verifySteps(['onFocus called']);
  });

  test('Shorthand works when used with {{on}} modifier and optional action is provided', async function (assert) {
    this.set('label', 'foo bar');
    this.set('onFocus', function (value) {
      assert.step('onFocus called');
      assert.strictEqual(value, 'pizza party', 'The action receives the correct value');
    });

    await render(
      <template>
        <label>
          <input
            id="test-input"
            value="pizza party"
            {{on "focusin" (pick "target.value" this.onFocus)}}
          />
          {{this.label}}
        </label>
      </template>,
    );

    await click('#test-input');
    assert.verifySteps(['onFocus called']);
  });
});
