import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Modifier | autofocus', function (hooks) {
  setupRenderingTest(hooks);

  test('it focuses', async function (assert) {
    this.set('label', 'foo bar');
    await render(hbs`<label><input {{autofocus}} />{{this.label}}</label>
`);

    assert.dom('input').isFocused();
  });
});
