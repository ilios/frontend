// taken from Ember Composable Helpers (https://github.com/DockYard/ember-composable-helpers), then modified.

import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render, click } from '@ember/test-helpers';
import { on } from '@ember/modifier';
import noop from 'ilios-common/helpers/noop';

module('Integration | Helper | noop', function (hooks) {
  setupRenderingTest(hooks);

  test('It successfully renders and does nothing when clicked', async function (assert) {
    assert.expect(0);
    await render(
      <template>
        <button type="button" {{on "click" (noop)}}></button>
      </template>,
    );
    await click('button');
  });
});
