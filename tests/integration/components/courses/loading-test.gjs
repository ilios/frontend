import { render } from '@ember/test-helpers';
import Loading from 'frontend/components/courses/loading';
import { setupRenderingTest, takeComponentScreenshot } from 'frontend/tests/helpers';
import { module, test } from 'qunit';

module('Integration | Component | courses/loading', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><Loading /></template>);
    assert.dom('section').hasAttribute('aria-hidden', 'true');
    assert.dom('.list').exists();
    await takeComponentScreenshot(assert);
  });
});
