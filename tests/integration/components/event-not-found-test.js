import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/event-not-found';

module('Integration | Component | event-not-found', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders', async function (assert) {
    await render(hbs`<EventNotFound />`);
    assert.strictEqual(component.title, 'Event Not Found');
    assert.strictEqual(
      component.explanation,
      'The event you have tried to reach is either no longer available, or you have followed a personalized user link which is not shareable. If you continue to encounter issues, please contact your Ilios help desk.',
    );
    assert.ok(component.backToDashboardLink.isPresent);
    assert.strictEqual(component.backToDashboardLink.text, 'Back to Dashboard');
  });
});
