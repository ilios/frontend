import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import DashboardLoading from 'frontend/components/dashboard-loading';

module('Integration | Component | dashboard loading', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><DashboardLoading /></template>);

    assert.dom(this.element).hasText('');
  });
});
