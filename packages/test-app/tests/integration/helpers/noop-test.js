// taken from Ember Composable Helpers (https://github.com/DockYard/ember-composable-helpers), then modified.
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';

module('Integration | Helper | noop', function (hooks) {
  setupRenderingTest(hooks);

  test('It successfully renders and does nothing when clicked', async function (assert) {
    assert.expect(0);
    await render(hbs`<button type="button" {{on "click" (noop)}}></button>
`);
    await click('button');
  });
});
