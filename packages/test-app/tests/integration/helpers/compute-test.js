// taken from Ember Composable Helpers (https://github.com/DockYard/ember-composable-helpers), then modified.
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';

module('Integration | Helper | compute', function (hooks) {
  setupRenderingTest(hooks);

  test("It calls an action and returns it's value", async function (assert) {
    this.set('square', (x) => x * x);
    await render(hbs`{{compute this.square 4}}
`);

    assert.dom().hasText('16', '4 squared is 16');
  });
});
