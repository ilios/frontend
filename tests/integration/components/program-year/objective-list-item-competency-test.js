import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'ilios/tests/pages/components/program-year/objective-list-item-competency';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | program-year/objective-list-item-competency', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders and is accessible when managing', async function (assert) {
    await render(hbs`<ProgramYear::ObjectiveListItemCompetency
      @objective={{null}}
      @editable={{false}}
      @manage={{(noop)}}
      @isManaging={{true}}
      @save={{(noop)}}
      @isSaving={{false}}
      @cancel={{(noop)}}
    />
`);
    assert.ok(component.canSave);
    assert.ok(component.canCancel);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders and is accessible empty and un-editable', async function (assert) {
    const objective = this.server.create('programYearObjective');
    const objectiveModel = await this.owner
      .lookup('service:store')
      .findRecord('program-year-objective', objective.id);
    this.set('objective', objectiveModel);
    await render(hbs`<ProgramYear::ObjectiveListItemCompetency
      @objective={{this.objective}}
      @editable={{false}}
      @manage={{(noop)}}
      @isManaging={{false}}
      @save={{(noop)}}
      @isSaving={{false}}
      @cancel={{(noop)}}
    />
`);
    assert.strictEqual(component.text, 'None');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders and is accessible un-editable', async function (assert) {
    const domain = this.server.create('competency');
    const competency = this.server.create('competency', { parent: domain });
    const objective = this.server.create('programYearObjective', { competency });
    const objectiveModel = await this.owner
      .lookup('service:store')
      .findRecord('program-year-objective', objective.id);
    this.set('objective', objectiveModel);
    await render(hbs`<ProgramYear::ObjectiveListItemCompetency
      @objective={{this.objective}}
      @editable={{false}}
      @manage={{(noop)}}
      @isManaging={{false}}
      @save={{(noop)}}
      @isSaving={{false}}
      @cancel={{(noop)}}
    />
`);
    assert.strictEqual(component.text, 'competency 1 (competency 0)');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders and is accessible un-editable with no domain', async function (assert) {
    const competency = this.server.create('competency');
    const objective = this.server.create('programYearObjective', { competency });
    const objectiveModel = await this.owner
      .lookup('service:store')
      .findRecord('program-year-objective', objective.id);
    this.set('objective', objectiveModel);
    await render(hbs`<ProgramYear::ObjectiveListItemCompetency
      @objective={{this.objective}}
      @editable={{false}}
      @manage={{(noop)}}
      @isManaging={{false}}
      @save={{(noop)}}
      @isSaving={{false}}
      @cancel={{(noop)}}
    />
`);
    assert.strictEqual(component.text, 'competency 0');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders and is accessible editable', async function (assert) {
    const domain = this.server.create('competency');
    const competency = this.server.create('competency', { parent: domain });
    const objective = this.server.create('programYearObjective', {
      competency,
    });
    const objectiveModel = await this.owner
      .lookup('service:store')
      .findRecord('program-year-objective', objective.id);
    this.set('objective', objectiveModel);
    await render(hbs`<ProgramYear::ObjectiveListItemCompetency
      @objective={{this.objective}}
      @editable={{true}}
      @manage={{(noop)}}
      @isManaging={{false}}
      @save={{(noop)}}
      @isSaving={{false}}
      @cancel={{(noop)}}
    />
`);
    assert.strictEqual(component.text, 'competency 1 (competency 0)');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders and is accessible editable with no domain', async function (assert) {
    const competency = this.server.create('competency');
    const objective = this.server.create('programYearObjective', {
      competency,
    });
    const objectiveModel = await this.owner
      .lookup('service:store')
      .findRecord('program-year-objective', objective.id);
    this.set('objective', objectiveModel);
    await render(hbs`<ProgramYear::ObjectiveListItemCompetency
      @objective={{this.objective}}
      @editable={{true}}
      @manage={{(noop)}}
      @isManaging={{false}}
      @save={{(noop)}}
      @isSaving={{false}}
      @cancel={{(noop)}}
    />
`);
    assert.strictEqual(component.text, 'competency 0');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('clicking save fires save', async function (assert) {
    assert.expect(1);
    const domain = this.server.create('competency');
    const competency = this.server.create('competency', { parent: domain });
    const objective = this.server.create('programYearObjective', {
      competency,
    });
    const objectiveModel = await this.owner
      .lookup('service:store')
      .findRecord('program-year-objective', objective.id);
    this.set('objective', objectiveModel);
    this.set('save', () => {
      assert.ok(true);
    });
    await render(hbs`<ProgramYear::ObjectiveListItemCompetency
      @objective={{this.objective}}
      @editable={{true}}
      @manage={{(noop)}}
      @isManaging={{true}}
      @save={{this.save}}
      @isSaving={{false}}
      @cancel={{(noop)}}
    />
`);
    await component.save();
  });

  test('clicking cancel fires cancel', async function (assert) {
    assert.expect(1);
    const domain = this.server.create('competency');
    const competency = this.server.create('competency', { parent: domain });
    const objective = this.server.create('programYearObjective', {
      competency,
    });
    const objectiveModel = await this.owner
      .lookup('service:store')
      .findRecord('program-year-objective', objective.id);
    this.set('objective', objectiveModel);
    this.set('cancel', () => {
      assert.ok(true);
    });
    await render(hbs`<ProgramYear::ObjectiveListItemCompetency
      @objective={{this.objective}}
      @editable={{true}}
      @manage={{(noop)}}
      @isManaging={{true}}
      @save={{(noop)}}
      @isSaving={{false}}
      @cancel={{this.cancel}}
    />
`);
    await component.cancel();
  });

  test('clicking competency fires manage', async function (assert) {
    assert.expect(1);
    const domain = this.server.create('competency');
    const competency = this.server.create('competency', { parent: domain });
    const objective = this.server.create('programYearObjective', {
      competency,
    });
    const objectiveModel = await this.owner
      .lookup('service:store')
      .findRecord('program-year-objective', objective.id);
    this.set('objective', objectiveModel);
    this.set('manage', () => {
      assert.ok(true);
    });
    await render(hbs`<ProgramYear::ObjectiveListItemCompetency
      @objective={{this.objective}}
      @editable={{true}}
      @manage={{this.manage}}
      @isManaging={{false}}
      @save={{(noop)}}
      @isSaving={{false}}
      @cancel={{(noop)}}
    />
`);
    await component.manage();
  });
});
