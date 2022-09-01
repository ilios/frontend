import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/not-found';

// @todo figure out how to suppress the dashboard route for testing purposes [ST 2021/11/04]
module('Integration | Component | not-found', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it displays not found message', async function (assert) {
    await render(hbs`<NotFound />`);
    assert.strictEqual(
      component.text,
      "Rats! I couldn't find that. Please check your page address, and try again. Back to Dashboard"
    );
    assert.ok(component.backToDashboardLink.isPresent);
    assert.strictEqual(component.backToDashboardLink.text, 'Back to Dashboard');
  });
});
