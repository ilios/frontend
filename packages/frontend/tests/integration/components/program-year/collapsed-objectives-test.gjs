import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'frontend/tests/pages/components/program-year/collapsed-objectives';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import CollapsedObjectives from 'frontend/components/program-year/collapsed-objectives';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | program-year/collapsed-objectives', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const meshDescriptor = this.server.create('mesh-descriptor');
    const term = this.server.create('term');
    const competency = this.server.create('competency');
    this.objective = this.server.create('program-year-objective');
    this.objectiveWithMesh = this.server.create('program-year-objective', {
      meshDescriptors: [meshDescriptor],
    });
    this.objectiveWithTerms = this.server.create('program-year-objective', { terms: [term] });
    this.objectiveWithCompetency = this.server.create('program-year-objective', { competency });
  });

  test('displays summary data', async function (assert) {
    const programYear = this.server.create('program-year', {
      programYearObjectives: [
        this.objective,
        this.objectiveWithMesh,
        this.objectiveWithCompetency,
        this.objectiveWithTerms,
      ],
    });
    const programYearModel = await this.owner
      .lookup('service:store')
      .findRecord('program-year', programYear.id);

    this.set('programYear', programYearModel);
    await render(
      <template>
        <CollapsedObjectives @programYear={{this.programYear}} @expand={{(noop)}} />
      </template>,
    );

    assert.strictEqual(component.title, 'Objectives (4)');
    assert.ok(component.hasExpandIcon);
    assert.strictEqual(component.objectiveCount, 'There are 4 objectives');
    assert.strictEqual(component.parentCount, '1 has a linked competency');
    assert.strictEqual(component.meshCount, '1 has MeSH');
    assert.strictEqual(component.termCount, '1 has vocabulary terms');
    assert.ok(component.parentStatus.partial);
    assert.ok(component.meshStatus.partial);
    assert.ok(component.termStatus.partial);
  });

  test('clicking expand icon opens full view', async function (assert) {
    const programYear = this.server.create('program-year');
    const programYearModel = await this.owner
      .lookup('service:store')
      .findRecord('program-year', programYear.id);

    this.set('programYear', programYearModel);
    this.set('click', () => {
      assert.step('click called');
    });
    await render(
      <template>
        <CollapsedObjectives @programYear={{this.programYear}} @expand={{this.click}} />
      </template>,
    );

    assert.strictEqual(component.title, 'Objectives (0)');
    await component.expand();
    assert.verifySteps(['click called']);
  });

  test('icons all linked competencies correctly', async function (assert) {
    const programYear = this.server.create('program-year', {
      programYearObjectives: [this.objectiveWithCompetency],
    });
    const programYearModel = await this.owner
      .lookup('service:store')
      .findRecord('program-year', programYear.id);

    this.set('programYear', programYearModel);
    await render(
      <template>
        <CollapsedObjectives @programYear={{this.programYear}} @expand={{(noop)}} />
      </template>,
    );
    assert.strictEqual(component.title, 'Objectives (1)');
    assert.ok(component.parentStatus.complete);
  });

  test('icons no parents correctly', async function (assert) {
    const programYear = this.server.create('program-year', {
      programYearObjectives: [this.objective],
    });
    const programYearModel = await this.owner
      .lookup('service:store')
      .findRecord('program-year', programYear.id);

    this.set('programYear', programYearModel);
    await render(
      <template>
        <CollapsedObjectives @programYear={{this.programYear}} @expand={{(noop)}} />
      </template>,
    );
    assert.strictEqual(component.title, 'Objectives (1)');
    assert.ok(component.parentStatus.none);
  });

  test('icons all mesh correctly', async function (assert) {
    const programYear = this.server.create('program-year', {
      programYearObjectives: [this.objectiveWithMesh],
    });
    const programYearModel = await this.owner
      .lookup('service:store')
      .findRecord('program-year', programYear.id);

    this.set('programYear', programYearModel);
    await render(
      <template>
        <CollapsedObjectives @programYear={{this.programYear}} @expand={{(noop)}} />
      </template>,
    );
    assert.strictEqual(component.title, 'Objectives (1)');
    assert.ok(component.meshStatus.complete);
  });

  test('icons no mesh correctly', async function (assert) {
    const programYear = this.server.create('program-year', {
      programYearObjectives: [this.objective],
    });
    const programYearModel = await this.owner
      .lookup('service:store')
      .findRecord('program-year', programYear.id);

    this.set('programYear', programYearModel);
    await render(
      <template>
        <CollapsedObjectives @programYear={{this.programYear}} @expand={{(noop)}} />
      </template>,
    );
    assert.strictEqual(component.title, 'Objectives (1)');
    assert.ok(component.meshStatus.none);
  });

  test('icons all terms correctly', async function (assert) {
    const programYear = this.server.create('program-year', {
      programYearObjectives: [this.objectiveWithTerms],
    });
    const programYearModel = await this.owner
      .lookup('service:store')
      .findRecord('program-year', programYear.id);

    this.set('programYear', programYearModel);
    await render(
      <template>
        <CollapsedObjectives @programYear={{this.programYear}} @expand={{(noop)}} />
      </template>,
    );
    assert.strictEqual(component.title, 'Objectives (1)');
    assert.ok(component.termStatus.complete);
  });

  test('icons no terms correctly', async function (assert) {
    const programYear = this.server.create('program-year', {
      programYearObjectives: [this.objective],
    });
    const programYearModel = await this.owner
      .lookup('service:store')
      .findRecord('program-year', programYear.id);

    this.set('programYear', programYearModel);
    await render(
      <template>
        <CollapsedObjectives @programYear={{this.programYear}} @expand={{(noop)}} />
      </template>,
    );
    assert.strictEqual(component.title, 'Objectives (1)');
    assert.ok(component.termStatus.none);
  });
});
