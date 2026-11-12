// taken from Ember Composable Helpers (https://github.com/DockYard/ember-composable-helpers), then modified.

import { render } from '@ember/test-helpers';
import compute from 'frontend/helpers/compute';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { module, test } from 'qunit';

module('Integration | Helper | compute', function (hooks) {
  setupRenderingTest(hooks);

  test("It calls an action and returns it's value", async function (assert) {
    this.set('square', (x) => x * x);
    await render(<template>{{compute this.square 4}}</template>);

    assert.dom().hasText('16', '4 squared is 16');
  });
});
