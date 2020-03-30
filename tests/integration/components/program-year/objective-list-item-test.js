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
    assert.expect(6);
    const programYear = this.server.create('programYear');

    const objective = this.server.create('objective', {
      programYears: [programYear],
    });
    const objectiveModel = await this.owner.lookup('service:store').find('objective', objective.id);
    const programYearModel = await this.owner.lookup('service:store').find('programYear', objective.id);
    this.set('objective', objectiveModel);
    this.set('programYear', programYearModel);

    await render(
      hbs`<ProgramYear::ObjectiveListItem
        @objective={{this.objective}}
        @editable={{true}}
        @showRemoveConfirmation={{false}}
        @remove={{noop}}
        @manageCompetency={{noop}}
        @manageDescriptors={{noop}}
        @toggleExpand={{noop}}
      />`
    );
    assert.notOk(component.hasRemoveConfirmation);
    assert.equal(component.description.text, 'objective 0');
    assert.notOk(component.hasCompetency);
    assert.equal(component.meshText, 'Add New');
    assert.ok(component.hasTrashCan);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('renders removable', async function (assert) {
    assert.expect(2);
    const programYear = this.server.create('programYear');

    const objective = this.server.create('objective', {
      programYears: [programYear],
    });
    const objectiveModel = await this.owner.lookup('service:store').find('objective', objective.id);
    const programYearModel = await this.owner.lookup('service:store').find('programYear', objective.id);
    this.set('objective', objectiveModel);
    this.set('programYear', programYearModel);

    await render(
      hbs`<ProgramYear::ObjectiveListItem
        @objective={{this.objective}}
        @editable={{true}}
        @showRemoveConfirmation={{true}}
        @remove={{noop}}
        @manageCompetency={{noop}}
        @manageDescriptors={{noop}}
        @toggleExpand={{noop}}
      />`
    );
    assert.ok(component.hasRemoveConfirmation);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('can change title', async function(assert) {
    const programYear = this.server.create('programYear');

    const objective = this.server.create('objective', {
      programYears: [programYear],
    });
    const objectiveModel = await this.owner.lookup('service:store').find('objective', objective.id);
    const programYearModel = await this.owner.lookup('service:store').find('programYear', objective.id);
    this.set('objective', objectiveModel);
    this.set('programYear', programYearModel);

    await render(
      hbs`<ProgramYear::ObjectiveListItem
        @objective={{this.objective}}
        @editable={{true}}
        @showRemoveConfirmation={{false}}
        @remove={{noop}}
        @manageCompetency={{noop}}
        @manageDescriptors={{noop}}
        @toggleExpand={{noop}}
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
    const programYearModel = await this.owner.lookup('service:store').find('programYear', objective.id);
    this.set('objective', objectiveModel);
    this.set('programYear', programYearModel);
    this.set('manageCompetency', () => {
      assert.ok(true);
    });

    await render(
      hbs`<ProgramYear::ObjectiveListItem
        @objective={{this.objective}}
        @editable={{true}}
        @showRemoveConfirmation={{false}}
        @remove={{noop}}
        @manageCompetency={{this.manageCompetency}}
        @manageDescriptors={{noop}}
        @toggleExpand={{noop}}
      />`
    );
    await component.manageCompetency();
  });

  test('can manage descriptors', async function (assert) {
    const programYear = this.server.create('programYear');
    const objective = this.server.create('objective', {
      programYears: [programYear],
    });
    const objectiveModel = await this.owner.lookup('service:store').find('objective', objective.id);
    const programYearModel = await this.owner.lookup('service:store').find('programYear', objective.id);
    this.set('objective', objectiveModel);
    this.set('programYear', programYearModel);
    this.set('manageDescriptors', () => {
      assert.ok(true);
    });

    await render(
      hbs`<ProgramYear::ObjectiveListItem
        @objective={{this.objective}}
        @editable={{true}}
        @showRemoveConfirmation={{false}}
        @remove={{noop}}
        @manageCompetency={{noop}}
        @manageDescriptors={{this.manageDescriptors}}
        @toggleExpand={{noop}}
      />`
    );
    await component.manageMesh();
  });

  test('can trigger removal', async function (assert) {
    const programYear = this.server.create('programYear');
    const objective = this.server.create('objective', {
      programYears: [programYear],
    });
    const objectiveModel = await this.owner.lookup('service:store').find('objective', objective.id);
    const programYearModel = await this.owner.lookup('service:store').find('programYear', objective.id);
    this.set('objective', objectiveModel);
    this.set('programYear', programYearModel);
    this.set('remove', () => {
      assert.ok(true);
    });

    await render(
      hbs`<ProgramYear::ObjectiveListItem
        @objective={{this.objective}}
        @editable={{true}}
        @showRemoveConfirmation={{false}}
        @remove={{this.remove}}
        @manageCompetency={{noop}}
        @manageDescriptors={{noop}}
        @toggleExpand={{noop}}
      />`
    );
    await component.remove();
  });
});
