// taken from Ember Composable Helpers (https://github.com/DockYard/ember-composable-helpers), then modified.

import { on } from '@ember/modifier';
import { click,render } from '@ember/test-helpers';
import noop from 'frontend/helpers/noop';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { module, test } from 'qunit';

module('Integration | Helper | noop', function (hooks) {
  setupRenderingTest(hooks);

  test('It successfully renders and does nothing when clicked', async function (assert) {
    assert.expect(0);
    this.set('label', 'foobar');
    await render(
      <template>
        <button type="button" aria-label={{this.label}} {{on "click" (noop)}}></button>
      </template>,
    );
    await click('button');
  });
});
