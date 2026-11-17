import { render } from '@ember/test-helpers';
import BackToAdminDashboard from 'frontend/components/back-to-admin-dashboard';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { component } from 'frontend/tests/pages/components/back-to-admin-dashboard';
import { module, test } from 'qunit';

module('Integration | Component | back-to-admin-dashboard', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><BackToAdminDashboard /></template>);
    assert.strictEqual(component.text, 'Back to Admin Dashboard');
    assert.ok(component.url.endsWith('/admin'));
  });
});
