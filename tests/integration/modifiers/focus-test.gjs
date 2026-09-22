import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import focus from 'ilios-common/modifiers/focus';

module('Integration | Modifier | focus', function (hooks) {
  setupRenderingTest(hooks);

  test('it focuses by default without condition', async function (assert) {
    this.set('label', 'foo bar');
    await render(
      <template>
        <label><input {{focus}} />{{this.label}}</label>
      </template>,
    );
    assert.dom('input').isFocused();
  });

  test('it focuses when condition is met', async function (assert) {
    this.set('label', 'foo bar');
    await render(
      <template>
        <label><input {{focus true}} />{{this.label}}</label>
      </template>,
    );
    assert.dom('input').isFocused();
  });

  test('it does not focus when condition is not met', async function (assert) {
    this.set('label', 'foo bar');
    await render(
      <template>
        <label><input {{focus false}} />{{this.label}}</label>
      </template>,
    );
    assert.dom('input').isNotFocused();
  });
});
