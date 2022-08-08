import { module, skip, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import ENV from 'ilios/config/environment';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'ilios/tests/pages/components/program-year/overview';

module('Integration | Component | program-year/overview', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const program = this.server.create('program');
    const programYear = this.server.create('programYear', { program });
    const programYearModel = await this.owner
      .lookup('service:store')
      .find('programYear', programYear.id);
    this.set('program', programYearModel);
    await render(hbs`<ProgramYear::Overview
      @programYear={{this.programYear}}
    />`);
    assert.strictEqual(component.title, 'Overview');
    assert.notOk(component.actions.visualizations.isPresent);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  // @todo figure out a way how this can be tested. [ST 2022/08/05]
  skip('visualizations button present', async function (assert) {
    ENV.IliosFeatures.programYearVisualizations = true; //this doesn't work.
    const program = this.server.create('program');
    const programYear = this.server.create('programYear', { program });
    const programYearModel = await this.owner
      .lookup('service:store')
      .find('programYear', programYear.id);
    this.set('program', programYearModel);
    await render(hbs`<ProgramYear::Overview
      @programYear={{this.programYear}}
    />`);
    assert.ok(component.actions.visualizations.isPresent);
  });
});
