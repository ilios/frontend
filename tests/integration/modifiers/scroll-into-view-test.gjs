import { render } from '@ember/test-helpers';
import scrollIntoView from 'frontend/modifiers/scroll-into-view';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { module, test } from 'qunit';

module('Integration | Modifier | scroll-into-view', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(
      <template>
        <div {{scrollIntoView}}></div>
      </template>,
    );

    assert.ok(true);
  });
});
