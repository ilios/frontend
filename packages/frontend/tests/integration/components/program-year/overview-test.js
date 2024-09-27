import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'frontend/tests/pages/components/program-year/overview';
import { enableFeature } from 'ember-feature-flags/test-support';

module('Integration | Component | program-year/overview', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const program = this.server.create('program');
    const programYear = this.server.create('program-year', { program });
    const programYearModel = await this.owner
      .lookup('service:store')
      .findRecord('program-year', programYear.id);
    this.set('program', programYearModel);
    await render(hbs`<ProgramYear::Overview @programYear={{this.programYear}} />`);
    assert.strictEqual(component.title, 'Overview');
    assert.notOk(component.actions.visualizations.isPresent);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('visualizations button present', async function (assert) {
    const program = this.server.create('program');
    const programYear = this.server.create('program-year', { program });
    const programYearModel = await this.owner
      .lookup('service:store')
      .findRecord('program-year', programYear.id);
    this.set('program', programYearModel);
    enableFeature('programYearVisualizations');
    await render(hbs`<ProgramYear::Overview @programYear={{this.programYear}} />`);
    assert.ok(component.actions.visualizations.isPresent);
  });
});
