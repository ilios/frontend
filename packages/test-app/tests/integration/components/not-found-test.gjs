import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'ilios-common/page-objects/components/not-found';

// @todo figure out how to suppress the dashboard route for testing purposes [ST 2021/11/04]
import NotFound from 'ilios-common/components/not-found';
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
