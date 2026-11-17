import { render } from '@ember/test-helpers';
// @todo figure out how to suppress the dashboard route for testing purposes [ST 2021/11/04]
import NotFound from 'frontend/components/not-found';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { component } from 'frontend/tests/pages/components/not-found';
import { module, test } from 'qunit';
module('Integration | Component | not-found', function (hooks) {
  setupRenderingTest(hooks);

  test('it displays not found message', async function (assert) {
    await render(<template><NotFound /></template>);
    assert.strictEqual(
      component.text,
      "Rats! I couldn't find that. Please check your page address, and try again. Back to Dashboard",
    );
    assert.ok(component.backToDashboardLink.isPresent);
    assert.strictEqual(component.backToDashboardLink.text, 'Back to Dashboard');
  });
});
