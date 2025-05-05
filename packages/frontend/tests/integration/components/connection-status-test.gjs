import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import ConnectionStatus from 'frontend/components/connection-status';

module('Integration | Component | connection status', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders offline and therefor hidden', async function (assert) {
    await render(<template><ConnectionStatus /></template>);
    assert.dom(this.element).hasNoClass('offline');

    a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
