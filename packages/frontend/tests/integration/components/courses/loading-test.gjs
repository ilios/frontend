import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import Loading from 'frontend/components/courses/loading';

module('Integration | Component | courses/loading', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><Loading /></template>);
    assert.dom('section').hasAttribute('aria-hidden', 'true');
    assert.dom('.list').exists();
  });
});
