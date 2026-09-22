import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'frontend/tests/pages/components/event-not-found';
import EventNotFound from 'frontend/components/event-not-found';

module('Integration | Component | event-not-found', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><EventNotFound /></template>);
    assert.strictEqual(component.title, 'Event Not Found');
    assert.strictEqual(
      component.explanation,
      'The event you have tried to reach is either no longer available, or you have followed a personalized user link which is not shareable. If you continue to encounter issues, please contact your Ilios help desk.',
    );
    assert.ok(component.backToDashboardLink.isPresent);
    assert.strictEqual(component.backToDashboardLink.text, 'Back to Dashboard');
  });
});
