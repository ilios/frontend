import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios/tests/pages/components/program-year/collapsed-objectives';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | program-year/collapsed-objectives', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const meshDescriptor = this.server.create('meshDescriptor');
    const term = this.server.create('term');
    const competency = this.server.create('competency');
    this.objective = this.server.create('programYearObjective');
    this.objectiveWithMesh = this.server.create('programYearObjective', {
      meshDescriptors: [meshDescriptor],
    });
    this.objectiveWithTerms = this.server.create('programYearObjective', { terms: [term] });
    this.objectiveWithCompetency = this.server.create('programYearObjective', { competency });
  });

  test('displays summary data', async function (assert) {
    const programYear = this.server.create('programYear', {
      programYearObjectives: [
        this.objective,
        this.objectiveWithMesh,
        this.objectiveWithCompetency,
        this.objectiveWithTerms,
      ],
    });
    const programYearModel = await this.owner
      .lookup('service:store')
      .find('program-year', programYear.id);

    this.set('programYear', programYearModel);
    await render(
      hbs`<ProgramYear::CollapsedObjectives @programYear={{this.programYear}} @expand={{(noop)}} />`
    );

    assert.strictEqual(component.title, 'Objectives (4)');
    assert.strictEqual(component.objectiveCount, 'There are 4 objectives');
    assert.strictEqual(component.parentCount, '1 has a linked competency');
    assert.strictEqual(component.meshCount, '1 has MeSH');
    assert.strictEqual(component.termCount, '1 has vocabulary terms');
    assert.ok(component.parentStatus.partial);
    assert.ok(component.meshStatus.partial);
    assert.ok(component.termStatus.partial);
  });

  test('clicking expand icon opens full view', async function (assert) {
    assert.expect(2);

    const programYear = this.server.create('programYear');
    const programYearModel = await this.owner
      .lookup('service:store')
      .find('program-year', programYear.id);

    this.set('programYear', programYearModel);
    this.set('click', () => {
      assert.ok(true);
    });
    await render(
      hbs`<ProgramYear::CollapsedObjectives @programYear={{this.programYear}} @expand={{this.click}} />`
    );

    assert.strictEqual(component.title, 'Objectives (0)');
    await component.expand();
  });

  test('icons all linked competencies correctly', async function (assert) {
    const programYear = this.server.create('programYear', {
      programYearObjectives: [this.objectiveWithCompetency],
    });
    const programYearModel = await this.owner
      .lookup('service:store')
      .find('program-year', programYear.id);

    this.set('programYear', programYearModel);
    await render(
      hbs`<ProgramYear::CollapsedObjectives @programYear={{this.programYear}} @expand={{(noop)}} />`
    );
    assert.strictEqual(component.title, 'Objectives (1)');
    assert.ok(component.parentStatus.complete);
  });

  test('icons no parents correctly', async function (assert) {
    const programYear = this.server.create('programYear', {
      programYearObjectives: [this.objective],
    });
    const programYearModel = await this.owner
      .lookup('service:store')
      .find('program-year', programYear.id);

    this.set('programYear', programYearModel);
    await render(
      hbs`<ProgramYear::CollapsedObjectives @programYear={{this.programYear}} @expand={{(noop)}} />`
    );
    assert.strictEqual(component.title, 'Objectives (1)');
    assert.ok(component.parentStatus.none);
  });

  test('icons all mesh correctly', async function (assert) {
    const programYear = this.server.create('programYear', {
      programYearObjectives: [this.objectiveWithMesh],
    });
    const programYearModel = await this.owner
      .lookup('service:store')
      .find('program-year', programYear.id);

    this.set('programYear', programYearModel);
    await render(
      hbs`<ProgramYear::CollapsedObjectives @programYear={{this.programYear}} @expand={{(noop)}} />`
    );
    assert.strictEqual(component.title, 'Objectives (1)');
    assert.ok(component.meshStatus.complete);
  });

  test('icons no mesh correctly', async function (assert) {
    const programYear = this.server.create('programYear', {
      programYearObjectives: [this.objective],
    });
    const programYearModel = await this.owner
      .lookup('service:store')
      .find('program-year', programYear.id);

    this.set('programYear', programYearModel);
    await render(
      hbs`<ProgramYear::CollapsedObjectives @programYear={{this.programYear}} @expand={{(noop)}} />`
    );
    assert.strictEqual(component.title, 'Objectives (1)');
    assert.ok(component.meshStatus.none);
  });

  test('icons all terms correctly', async function (assert) {
    const programYear = this.server.create('programYear', {
      programYearObjectives: [this.objectiveWithTerms],
    });
    const programYearModel = await this.owner
      .lookup('service:store')
      .find('program-year', programYear.id);

    this.set('programYear', programYearModel);
    await render(
      hbs`<ProgramYear::CollapsedObjectives @programYear={{this.programYear}} @expand={{(noop)}} />`
    );
    assert.strictEqual(component.title, 'Objectives (1)');
    assert.ok(component.termStatus.complete);
  });

  test('icons no terms correctly', async function (assert) {
    const programYear = this.server.create('programYear', {
      programYearObjectives: [this.objective],
    });
    const programYearModel = await this.owner
      .lookup('service:store')
      .find('program-year', programYear.id);

    this.set('programYear', programYearModel);
    await render(
      hbs`<ProgramYear::CollapsedObjectives @programYear={{this.programYear}} @expand={{(noop)}} />`
    );
    assert.strictEqual(component.title, 'Objectives (1)');
    assert.ok(component.termStatus.none);
  });
});
