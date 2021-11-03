import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios/tests/pages/components/program-year/objectives';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | program-year/objectives', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders and is accessible', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('programYear', { program });
    const domains = this.server.createList('competency', 2, { school });

    const competencies = this.server.createList('competency', 2, { school, parent: domains[0] });
    this.server.createList('competency', 2, { school, parent: domains[1] });

    this.server.create('programYearObjective', { programYear, competency: competencies[0] });
    this.server.create('programYearObjective', { programYear });

    const programYearModel = await this.owner
      .lookup('service:store')
      .find('program-year', programYear.id);

    this.set('programYear', programYearModel);
    await render(hbs`<ProgramYear::Objectives
      @programYear={{this.programYear}}
      @editable={{true}}
      @collapse={{(noop)}}
      @expand={{(noop)}}
    />`);

    assert.strictEqual(component.objectiveList.objectives.length, 2);
    assert.strictEqual(
      component.objectiveList.objectives[0].description.text,
      'program-year objective 0'
    );
    assert.ok(component.objectiveList.objectives[0].competency.hasCompetency);
    assert.strictEqual(
      component.objectiveList.objectives[0].competency.competencyTitle,
      'competency 2'
    );
    assert.strictEqual(
      component.objectiveList.objectives[0].competency.domainTitle,
      '(competency 0)'
    );
    assert.ok(component.objectiveList.objectives[0].meshDescriptors.isEmpty);

    assert.strictEqual(
      component.objectiveList.objectives[1].description.text,
      'program-year objective 1'
    );
    assert.notOk(component.objectiveList.objectives[1].competency.hasCompetency);
    assert.ok(component.objectiveList.objectives[1].meshDescriptors.isEmpty);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it loads data for program year domains', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('programYear', { program });
    const domain1 = this.server.create('competency', {
      school,
      programYears: [programYear],
    });
    const domain2 = this.server.create('competency', {
      school,
      programYears: [programYear],
    });

    const competencies = this.server.createList('competency', 3, {
      school,
      parent: domain1,
      programYears: [programYear],
    });
    this.server.createList('competency', 2, {
      school,
      parent: domain2,
      programYears: [programYear],
    });

    const domain3 = this.server.create('competency', {
      school,
    });
    this.server.createList('competency', 2, {
      school,
      parent: domain3,
    });
    this.server.create('program-year-objective', { programYear, competency: competencies[0] });
    const programYearModel = await this.owner
      .lookup('service:store')
      .find('program-year', programYear.id);

    this.set('programYear', programYearModel);
    await render(hbs`<ProgramYear::Objectives
      @programYear={{this.programYear}}
      @editable={{true}}
      @collapse={{(noop)}}
      @expand={{(noop)}}
    />`);

    assert.strictEqual(component.objectiveList.objectives.length, 1);
    assert.strictEqual(
      component.objectiveList.objectives[0].description.text,
      'program-year objective 0'
    );
    assert.ok(component.objectiveList.objectives[0].competency.hasCompetency);
    await component.objectiveList.objectives[0].competency.manage();
    const m = component.objectiveList.objectives[0].competencyManager;
    assert.strictEqual(m.domains.length, 2);

    assert.strictEqual(m.domains[0].title, 'competency 0');
    assert.ok(m.domains[0].selected);
    assert.strictEqual(m.domains[0].competencies.length, 3);
    assert.strictEqual(m.domains[0].competencies[0].title, 'competency 2');
    assert.ok(m.domains[0].competencies[0].selected);
    assert.strictEqual(m.domains[0].competencies[1].title, 'competency 3');
    assert.ok(m.domains[0].competencies[1].notSelected);
    assert.strictEqual(m.domains[0].competencies[2].title, 'competency 4');
    assert.ok(m.domains[0].competencies[2].notSelected);

    assert.strictEqual(m.domains[1].title, 'competency 1');
    assert.ok(m.domains[1].notSelected);
    assert.strictEqual(m.domains[1].competencies.length, 2);
    assert.strictEqual(m.domains[1].competencies[0].title, 'competency 5');
    assert.ok(m.domains[1].competencies[0].notSelected);
    assert.strictEqual(m.domains[1].competencies[1].title, 'competency 6');
    assert.ok(m.domains[1].competencies[1].notSelected);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
