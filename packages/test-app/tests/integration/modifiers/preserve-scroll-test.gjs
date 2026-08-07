import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import preserveScroll from 'ilios-common/modifiers/preserve-scroll';

module('Integration | Modifier | preserve-scroll', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(
      <template>
        <div {{preserveScroll}}></div>
      </template>,
    );

    assert.ok(true);
  });
});
