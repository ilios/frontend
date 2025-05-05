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
    assert.expect(1);

    this.set('onFocus', function (value) {
      assert.strictEqual(value, 'pizza party', 'The action receives the correct value');
    });

    await render(
      <template>
        <input
          id="test-input"
          value="pizza party"
          {{on "focusin" (pipe (pick "target.value") this.onFocus)}}
        />
      </template>,
    );

    await click('#test-input');
  });

  test('Shorthand works when used with {{on}} modifier and optional action is provided', async function (assert) {
    assert.expect(1);

    this.set('onFocus', function (value) {
      assert.strictEqual(value, 'pizza party', 'The action receives the correct value');
    });

    await render(
      <template>
        <input
          id="test-input"
          value="pizza party"
          {{on "focusin" (pick "target.value" this.onFocus)}}
        />
      </template>,
    );

    await click('#test-input');
  });
});
