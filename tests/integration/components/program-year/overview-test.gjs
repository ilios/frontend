import { render } from '@ember/test-helpers';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import Overview from 'frontend/components/program-year/overview';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { setupMSW } from 'frontend/tests/msw';
import { component } from 'frontend/tests/pages/components/program-year/overview';
import { module, test } from 'qunit';

module('Integration | Component | program-year/overview', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  test('it renders', async function (assert) {
    const program = await this.server.create('program');
    const programYear = await this.server.create('program-year', { program });
    const programYearModel = await this.owner
      .lookup('service:store')
      .findRecord('program-year', programYear.id);
    this.set('program', programYearModel);
    await render(<template><Overview @programYear={{this.programYear}} /></template>);
    assert.ok(component.actions.visualizations.isPresent);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
