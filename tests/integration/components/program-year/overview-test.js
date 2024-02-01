import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'frontend/tests/pages/components/program-year/overview';
import { enableFeature } from 'ember-feature-flags/test-support';

module('Integration | Component | program-year/overview', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const program = this.server.create('program');
    const programYear = this.server.create('programYear', { program });
    const programYearModel = await this.owner
      .lookup('service:store')
      .findRecord('programYear', programYear.id);
    this.set('program', programYearModel);
    await render(hbs`<ProgramYear::Overview
      @programYear={{this.programYear}}
    />`);
    assert.strictEqual(component.title, 'Overview');
    assert.notOk(component.actions.visualizations.isPresent);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('visualizations button present', async function (assert) {
    const program = this.server.create('program');
    const programYear = this.server.create('programYear', { program });
    const programYearModel = await this.owner
      .lookup('service:store')
      .findRecord('programYear', programYear.id);
    this.set('program', programYearModel);
    enableFeature('programYearVisualizations');
    await render(hbs`<ProgramYear::Overview
      @programYear={{this.programYear}}
    />`);
    assert.ok(component.actions.visualizations.isPresent);
  });
});
