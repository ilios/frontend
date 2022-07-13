import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios/tests/pages/components/back-to-admin-dashboard';

module('Integration | Component | back-to-admin-dashboard', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders', async function (assert) {
    await render(hbs`<BackToAdminDashboard />`);
    assert.strictEqual(component.text, 'Back to Admin Dashboard');
    assert.ok(component.url.endsWith('/admin'));
  });
});
