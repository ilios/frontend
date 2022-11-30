import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Integration | Component | connection status', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders offline and therefor hidden', async function (assert) {
    await render(hbs`<ConnectionStatus />
`);
    assert.dom(this.element).hasNoClass('offline');

    a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
