// taken from Ember Composable Helpers (https://github.com/DockYard/ember-composable-helpers), then modified.

import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import compute from 'ilios-common/helpers/compute';

module('Integration | Helper | compute', function (hooks) {
  setupRenderingTest(hooks);

  test("It calls an action and returns it's value", async function (assert) {
    this.set('square', (x) => x * x);
    await render(<template>{{compute this.square 4}}</template>);

    assert.dom().hasText('16', '4 squared is 16');
  });
});
