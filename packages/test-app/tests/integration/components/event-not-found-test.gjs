import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'ilios-common/page-objects/components/event-not-found';
import EventNotFound from 'ilios-common/components/event-not-found';

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
