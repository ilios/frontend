import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render, settled } from '@ember/test-helpers';
import { component } from 'frontend/tests/pages/components/program-year/objective-list-item';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import ObjectiveListItem from 'frontend/components/program-year/objective-list-item';
import { array } from '@ember/helper';

module('Integration | Component | program-year/objective-list-item', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('program-year', { program });
    const programYearObjective = this.server.create('program-year-objective', { programYear });
    this.model = await this.owner
      .lookup('service:store')
      .findRecord('program-year-objective', programYearObjective.id);
  });

  test('it renders and is accessible', async function (assert) {
    this.set('programYearObjective', this.model);
    await render(
      <template>
        <ObjectiveListItem
          @programYearObjective={{this.programYearObjective}}
          @editable={{true}}
          @domainTrees={{(array)}}
          @programYearCompetencies={{(array)}}
        />
      </template>,
    );
    assert.notOk(component.hasRemoveConfirmation);
    assert.strictEqual(component.description.fadeText.displayText.text, 'program-year objective 0');
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
      <template>
        <ObjectiveListItem @programYearObjective={{this.programYearObjective}} @editable={{true}} />
      </template>,
    );
    const newDescription = 'Pluto Visits Earth';
    assert.strictEqual(component.description.fadeText.displayText.text, 'program-year objective 0');
    await component.description.openEditor();
    await component.description.edit(newDescription);
    await component.description.save();
    assert.strictEqual(component.description.fadeText.displayText.text, newDescription);
  });

  test('can manage competency', async function (assert) {
    this.set('programYearObjective', this.model);
    await render(
      <template>
        <ObjectiveListItem
          @programYearObjective={{this.programYearObjective}}
          @editable={{true}}
          @domainTrees={{(array)}}
          @programYearCompetencies={{(array)}}
        />
      </template>,
    );
    await component.competency.manage();
    assert.ok(component.competencyManager.isPresent);
  });

  test('can manage descriptors', async function (assert) {
    assert.expect(1);
    this.set('programYearObjective', this.model);
    await render(
      <template>
        <ObjectiveListItem
          @programYearObjective={{this.programYearObjective}}
          @editable={{true}}
          @domainTrees={{(array)}}
          @programYearCompetencies={{(array)}}
        />
      </template>,
    );
    await component.meshDescriptors.list[0].manage();
    assert.ok(component.meshManager.isPresent);
  });

  test('can manage terms', async function (assert) {
    assert.expect(2);
    this.set('programYearObjective', this.model);
    await render(
      <template>
        <ObjectiveListItem
          @programYearObjective={{this.programYearObjective}}
          @editable={{true}}
          @domainTrees={{(array)}}
          @programYearCompetencies={{(array)}}
        />
      </template>,
    );
    assert.notOk(component.taxonomyManager.isPresent);
    await component.selectedTerms.manage();
    assert.ok(component.taxonomyManager.isPresent);
  });

  test('can trigger removal', async function (assert) {
    assert.expect(1);
    this.set('programYearObjective', this.model);
    await render(
      <template>
        <ObjectiveListItem
          @programYearObjective={{this.programYearObjective}}
          @editable={{true}}
          @domainTrees={{(array)}}
          @programYearCompetencies={{(array)}}
        />
      </template>,
    );
    await component.remove();
    assert.ok(component.hasRemoveConfirmation);
  });

  test('can de-activate', async function (assert) {
    assert.expect(2);
    this.set('programYearObjective', this.model);
    await render(
      <template>
        <ObjectiveListItem
          @programYearObjective={{this.programYearObjective}}
          @editable={{true}}
          @domainTrees={{(array)}}
          @programYearCompetencies={{(array)}}
        />
      </template>,
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
      <template>
        <ObjectiveListItem
          @programYearObjective={{this.programYearObjective}}
          @editable={{true}}
          @domainTrees={{(array)}}
          @programYearCompetencies={{(array)}}
        />
      </template>,
    );
    assert.ok(component.isInactive);
    await component.activate();
    assert.ok(component.isActive);
  });

  test('validate description', async function (assert) {
    this.set('programYearObjective', this.model);
    await render(
      <template>
        <ObjectiveListItem @programYearObjective={{this.programYearObjective}} @editable={{true}} />
      </template>,
    );
    await component.description.openEditor();
    assert.notOk(component.description.hasError);
    await component.description.edit('a');
    await settled();
    assert.strictEqual(
      component.description.error,
      'Description is too short (minimum is 3 characters)',
    );
    await component.description.edit('a'.repeat(65001));
    await settled();
    assert.strictEqual(
      component.description.error,
      'Description is too long (maximum is 65000 characters)',
    );
    await component.description.edit('lorem ipsum');
    await settled();
    assert.notOk(component.description.hasError);
  });
});
