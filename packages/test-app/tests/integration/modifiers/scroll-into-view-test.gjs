import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import scrollIntoView from 'ilios-common/modifiers/scroll-into-view';

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
