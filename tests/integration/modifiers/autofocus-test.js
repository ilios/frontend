import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Modifier | autofocus', function (hooks) {
  setupRenderingTest(hooks);

  test('it focuses', async function (assert) {
    await render(hbs`<input {{autofocus}} />`);

    assert.dom('input').isFocused();
  });
});
