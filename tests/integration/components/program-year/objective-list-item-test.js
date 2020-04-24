import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios/tests/pages/components/program-year/objective-list-item';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | program-year/objective-list-item', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders and is accessible', async function(assert) {
    assert.expect(7);
    const programYear = this.server.create('programYear');

    const objective = this.server.create('objective', {
      programYears: [programYear],
    });
    const objectiveModel = await this.owner.lookup('service:store').find('objective', objective.id);
    this.set('objective', objectiveModel);

    await render(
      hbs`<ProgramYear::ObjectiveListItem
        @objective={{this.objective}}
        @editable={{true}}
        @schoolCompetencies={{array}}
        @schoolDomains={{array}}
      />`
    );
    assert.notOk(component.hasRemoveConfirmation);
    assert.equal(component.description.text, 'objective 0');
    assert.equal(component.competency.text, 'Add New');
    assert.equal(component.meshDescriptors.text, 'Add New');
    assert.ok(component.isActive);
    assert.ok(component.hasTrashCan);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('can change title', async function(assert) {
    const programYear = this.server.create('programYear');

    const objective = this.server.create('objective', {
      programYears: [programYear],
    });
    const objectiveModel = await this.owner.lookup('service:store').find('objective', objective.id);
    this.set('objective', objectiveModel);

    await render(
      hbs`<ProgramYear::ObjectiveListItem
        @objective={{this.objective}}
        @editable={{true}}
        @schoolCompetencies={{array}}
        @schoolDomains={{array}}
      />`
    );
    const newDescription = 'Pluto Visits Earth';
    assert.equal(component.description.text, 'objective 0');
    await component.description.openEditor();
    await component.description.edit(newDescription);
    await component.description.save();
    assert.equal(component.description.text, newDescription);
  });

  test('can manage competency', async function (assert) {
    const programYear = this.server.create('programYear');
    const objective = this.server.create('objective', {
      programYears: [programYear],
    });
    const objectiveModel = await this.owner.lookup('service:store').find('objective', objective.id);
    this.set('objective', objectiveModel);
    this.set('manageCompetency', () => {
      assert.ok(true);
    });

    await render(
      hbs`<ProgramYear::ObjectiveListItem
        @objective={{this.objective}}
        @editable={{true}}
        @schoolCompetencies={{array}}
        @schoolDomains={{array}}
      />`
    );
    await component.competency.manage();
    assert.ok(component.competencyManager.isPresent);
  });

  test('can manage descriptors', async function (assert) {
    const programYear = this.server.create('programYear');
    const objective = this.server.create('objective', {
      programYears: [programYear],
    });
    const objectiveModel = await this.owner.lookup('service:store').find('objective', objective.id);
    this.set('objective', objectiveModel);

    await render(
      hbs`<ProgramYear::ObjectiveListItem
        @objective={{this.objective}}
        @editable={{true}}
        @schoolCompetencies={{array}}
        @schoolDomains={{array}}
      />`
    );
    await component.meshDescriptors.list[0].manage();
    assert.ok(component.meshManager.isPresent);
  });

  test('can trigger removal', async function (assert) {
    const programYear = this.server.create('programYear');
    const objective = this.server.create('objective', {
      programYears: [programYear],
    });
    const objectiveModel = await this.owner.lookup('service:store').find('objective', objective.id);
    this.set('objective', objectiveModel);

    await render(
      hbs`<ProgramYear::ObjectiveListItem
        @objective={{this.objective}}
        @editable={{true}}
        @schoolCompetencies={{array}}
        @schoolDomains={{array}}
      />`
    );
    await component.remove();
    assert.ok(component.hasRemoveConfirmation);
  });

  test('can de-activate', async function(assert) {
    const programYear = this.server.create('programYear');

    const objective = this.server.create('objective', {
      active: true,
      programYears: [programYear],
    });
    const objectiveModel = await this.owner.lookup('service:store').find('objective', objective.id);
    this.set('objective', objectiveModel);

    await render(
      hbs`<ProgramYear::ObjectiveListItem
        @objective={{this.objective}}
        @editable={{true}}
        @schoolCompetencies={{array}}
        @schoolDomains={{array}}
      />`
    );
    assert.ok(component.isActive);
    await component.deactivate();
    assert.ok(component.isInactive);
  });

  test('can activate', async function(assert) {
    const programYear = this.server.create('programYear');

    const objective = this.server.create('objective', {
      active: false,
      programYears: [programYear],
    });
    const objectiveModel = await this.owner.lookup('service:store').find('objective', objective.id);
    this.set('objective', objectiveModel);

    await render(
      hbs`<ProgramYear::ObjectiveListItem
        @objective={{this.objective}}
        @editable={{true}}
        @schoolCompetencies={{array}}
        @schoolDomains={{array}}
      />`
    );
    assert.ok(component.isInactive);
    await component.activate();
    assert.ok(component.isActive);
  });
});
