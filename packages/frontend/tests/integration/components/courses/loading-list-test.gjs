import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import LoadingList from 'frontend/components/courses/loading-list';

module('Integration | Component | courses/loading-list', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><LoadingList /></template>);
    assert.dom('table').hasAttribute('aria-hidden', 'true');
    assert.dom('tbody').exists();
  });
});
