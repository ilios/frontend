import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios/tests/pages/components/program-year/objective-list-item';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | program-year/objective-list-item', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('programYear', { program });
    const programYearObjective = this.server.create('programYearObjective', { programYear });
    this.model = await this.owner
      .lookup('service:store')
      .findRecord('program-year-objective', programYearObjective.id);
  });

  test('it renders and is accessible', async function (assert) {
    this.set('programYearObjective', this.model);
    await render(
      hbs`<ProgramYear::ObjectiveListItem
        @programYearObjective={{this.programYearObjective}}
        @editable={{true}}
        @domainTrees={{(array)}}
        @programYearCompetencies={{(array)}}
      />`
    );
    assert.notOk(component.hasRemoveConfirmation);
    assert.strictEqual(component.description.text, 'program-year objective 0');
    assert.strictEqual(component.competency.text, 'Add New');
    assert.strictEqual(component.meshDescriptors.text, 'Add New');
    assert.ok(component.isActive);
    assert.ok(component.canBeRemoved);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('can change title', async function (assert) {
    this.set('programYearObjective', this.model);
    await render(
      hbs`<ProgramYear::ObjectiveListItem
        @programYearObjective={{this.programYearObjective}}
        @editable={{true}}
      />`
    );
    const newDescription = 'Pluto Visits Earth';
    assert.strictEqual(component.description.text, 'program-year objective 0');
    await component.description.openEditor();
    await component.description.edit(newDescription);
    await component.description.save();
    assert.strictEqual(component.description.text, newDescription);
  });

  test('can manage competency', async function (assert) {
    this.set('programYearObjective', this.model);
    await render(
      hbs`<ProgramYear::ObjectiveListItem
        @programYearObjective={{this.programYearObjective}}
        @editable={{true}}
        @domainTrees={{(array)}}
        @programYearCompetencies={{(array)}}
      />`
    );
    await component.competency.manage();
    assert.ok(component.competencyManager.isPresent);
  });

  test('can manage descriptors', async function (assert) {
    assert.expect(1);
    this.set('programYearObjective', this.model);
    await render(
      hbs`<ProgramYear::ObjectiveListItem
        @programYearObjective={{this.programYearObjective}}
        @editable={{true}}
        @domainTrees={{(array)}}
        @programYearCompetencies={{(array)}}
      />`
    );
    await component.meshDescriptors.list[0].manage();
    assert.ok(component.meshManager.isPresent);
  });

  test('can manage terms', async function (assert) {
    assert.expect(2);
    this.set('programYearObjective', this.model);
    await render(
      hbs`<ProgramYear::ObjectiveListItem
        @programYearObjective={{this.programYearObjective}}
        @editable={{true}}
        @domainTrees={{(array)}}
        @programYearCompetencies={{(array)}}
      />`
    );
    assert.notOk(component.taxonomyManager.isPresent);
    await component.selectedTerms.manage();
    assert.ok(component.taxonomyManager.isPresent);
  });

  test('can trigger removal', async function (assert) {
    assert.expect(1);
    this.set('programYearObjective', this.model);
    await render(
      hbs`<ProgramYear::ObjectiveListItem
        @programYearObjective={{this.programYearObjective}}
        @editable={{true}}
        @domainTrees={{(array)}}
        @programYearCompetencies={{(array)}}
      />`
    );
    await component.remove();
    assert.ok(component.hasRemoveConfirmation);
  });

  test('can de-activate', async function (assert) {
    assert.expect(2);
    this.set('programYearObjective', this.model);
    await render(
      hbs`<ProgramYear::ObjectiveListItem
        @programYearObjective={{this.programYearObjective}}
        @editable={{true}}
        @domainTrees={{(array)}}
        @programYearCompetencies={{(array)}}
      />`
    );
    assert.ok(component.isActive);
    await component.deactivate();
    assert.ok(component.isInactive);
  });

  test('can activate', async function (assert) {
    assert.expect(2);
    this.model.set('active', false);
    this.set('programYearObjective', this.model);
    await render(
      hbs`<ProgramYear::ObjectiveListItem
        @programYearObjective={{this.programYearObjective}}
        @editable={{true}}
        @domainTrees={{(array)}}
        @programYearCompetencies={{(array)}}
      />`
    );
    assert.ok(component.isInactive);
    await component.activate();
    assert.ok(component.isActive);
  });
});
