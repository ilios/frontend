import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Modifier | focus', function (hooks) {
  setupRenderingTest(hooks);

  test('it focuses by default without condition', async function (assert) {
    this.set('label', 'foo bar');
    await render(hbs`<label><input {{focus}} />{{this.label}}</label>`);
    assert.dom('input').isFocused();
  });

  test('it focuses when condition is met', async function (assert) {
    this.set('label', 'foo bar');
    await render(hbs`<label><input {{focus true}} />{{this.label}}</label>`);
    assert.dom('input').isFocused();
  });

  test('it does not focus when condition is not met', async function (assert) {
    this.set('label', 'foo bar');
    await render(hbs`<label><input {{focus false}} />{{this.label}}</label>`);
    assert.dom('input').isNotFocused();
  });
});
