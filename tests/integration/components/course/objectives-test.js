import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/course/objectives';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | course/objectives', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders and is accessible with a single cohort', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('programYear', { program });
    const cohort = this.server.create('cohort', { programYear });
    const competencies = this.server.createList('competency', 2);
    const course = this.server.create('course', { cohorts: [cohort] });
    const pyObjectives = this.server.createList('programYearObjective', 3, {
      programYear,
      competency: competencies[0],
    });
    this.server.createList('programYearObjective', 2, {
      programYear,
      competency: competencies[1],
    });
    this.server.create('courseObjective', {
      course,
      programYearObjectives: [pyObjectives[0]],
    });
    this.server.create('courseObjective', { course });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);

    this.set('course', courseModel);
    await render(hbs`<Course::Objectives
      @course={{this.course}}
      @editable={{true}}
      @collapse={{(noop)}}
      @expand={{(noop)}}
    />`);

    assert.strictEqual(component.objectiveList.objectives.length, 2);
    assert.strictEqual(
      component.objectiveList.objectives[0].description.text,
      'course objective 0'
    );
    assert.strictEqual(component.objectiveList.objectives[0].parents.list.length, 1);
    assert.strictEqual(
      component.objectiveList.objectives[0].parents.list[0].text,
      'program-year objective 0'
    );
    assert.ok(component.objectiveList.objectives[0].meshDescriptors.empty);

    assert.strictEqual(
      component.objectiveList.objectives[1].description.text,
      'course objective 1'
    );
    assert.ok(component.objectiveList.objectives[1].parents.empty);
    assert.ok(component.objectiveList.objectives[1].meshDescriptors.empty);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it loads data for a single cohort', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('programYear', { program });
    const cohort = this.server.create('cohort', { programYear });
    const competencies = this.server.createList('competency', 2);
    const course = this.server.create('course', { cohorts: [cohort] });
    const pyObjectives = this.server.createList('programYearObjective', 3, {
      programYear,
      competency: competencies[0],
    });
    this.server.createList('programYearObjective', 2, {
      programYear,
      competency: competencies[1],
    });
    this.server.create('courseObjective', {
      course,
      programYearObjectives: [pyObjectives[0]],
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);

    this.set('course', courseModel);
    await render(hbs`<Course::Objectives
      @course={{this.course}}
      @editable={{true}}
      @collapse={{(noop)}}
      @expand={{(noop)}}
    />`);

    assert.strictEqual(component.objectiveList.objectives.length, 1);
    assert.strictEqual(
      component.objectiveList.objectives[0].description.text,
      'course objective 0'
    );
    assert.strictEqual(component.objectiveList.objectives[0].parents.list.length, 1);
    await component.objectiveList.objectives[0].parents.list[0].manage();

    const m = component.objectiveList.objectives[0].parentManager;
    assert.notOk(m.hasMultipleCohorts);
    assert.strictEqual(m.selectedCohortTitle, 'program 0 cohort 0');
    assert.strictEqual(m.competencies.length, 2);
    assert.strictEqual(m.competencies[0].title, 'competency 0');
    assert.ok(m.competencies[0].selected);

    assert.strictEqual(m.competencies[0].objectives.length, 3);
    assert.strictEqual(m.competencies[0].objectives[0].title, 'program-year objective 0');
    assert.ok(m.competencies[0].objectives[0].selected);
    assert.strictEqual(m.competencies[0].objectives[1].title, 'program-year objective 1');
    assert.ok(m.competencies[0].objectives[1].notSelected);
    assert.strictEqual(m.competencies[0].objectives[2].title, 'program-year objective 2');
    assert.ok(m.competencies[0].objectives[2].notSelected);

    assert.strictEqual(m.competencies[1].title, 'competency 1');
    assert.ok(m.competencies[1].notSelected);

    assert.strictEqual(m.competencies[1].objectives.length, 2);
    assert.strictEqual(m.competencies[1].objectives[0].title, 'program-year objective 3');
    assert.ok(m.competencies[1].objectives[0].notSelected);
    assert.strictEqual(m.competencies[1].objectives[1].title, 'program-year objective 4');
    assert.ok(m.competencies[1].objectives[1].notSelected);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it loads data for multiple cohorts', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear1 = this.server.create('programYear', { program });
    const cohort1 = this.server.create('cohort', { programYear: programYear1 });
    const programYear2 = this.server.create('programYear', { program });
    const cohort2 = this.server.create('cohort', { programYear: programYear2 });
    const competencies = this.server.createList('competency', 2);
    const course = this.server.create('course', {
      cohorts: [cohort1, cohort2],
    });
    const pyObjectives1 = this.server.createList('programYearObjective', 2, {
      competency: competencies[0],
      programYear: programYear1,
    });
    this.server.createList('programYearObjective', 2, {
      competency: competencies[1],
      programYear: programYear2,
    });
    this.server.create('courseObjective', {
      course,
      programYearObjectives: [pyObjectives1[0]],
    });
    this.server.createList('programYearObjective', 2, {
      competency: competencies[0],
    });
    this.server.createList('programYearObjective', 4, {
      competency: competencies[1],
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);

    this.set('course', courseModel);
    await render(hbs`<Course::Objectives
      @course={{this.course}}
      @editable={{true}}
      @collapse={{(noop)}}
      @expand={{(noop)}}
    />`);

    assert.strictEqual(component.objectiveList.objectives.length, 1);
    assert.strictEqual(
      component.objectiveList.objectives[0].description.text,
      'course objective 0'
    );
    assert.strictEqual(component.objectiveList.objectives[0].parents.list.length, 1);
    await component.objectiveList.objectives[0].parents.list[0].manage();

    const m = component.objectiveList.objectives[0].parentManager;
    assert.ok(m.hasMultipleCohorts);
    assert.strictEqual(m.selectedCohortTitle, 'program 0 cohort 0 program 0 cohort 1');
    assert.strictEqual(m.selectedCohortId, '1');

    assert.strictEqual(m.competencies.length, 1);
    assert.strictEqual(m.competencies[0].title, 'competency 0');
    assert.ok(m.competencies[0].selected);

    assert.strictEqual(m.competencies[0].objectives.length, 2);
    assert.strictEqual(m.competencies[0].objectives[0].title, 'program-year objective 0');
    assert.ok(m.competencies[0].objectives[0].selected);
    assert.strictEqual(m.competencies[0].objectives[1].title, 'program-year objective 1');
    assert.ok(m.competencies[0].objectives[1].notSelected);

    await m.selectCohort(2);
    assert.strictEqual(m.selectedCohortId, '2');
    assert.strictEqual(m.competencies[0].title, 'competency 1');
    assert.ok(m.competencies[0].notSelected);

    assert.strictEqual(m.competencies[0].objectives.length, 2);
    assert.strictEqual(m.competencies[0].objectives[0].title, 'program-year objective 2');
    assert.ok(m.competencies[0].objectives[0].notSelected);
    assert.strictEqual(m.competencies[0].objectives[1].title, 'program-year objective 3');
    assert.ok(m.competencies[0].objectives[1].notSelected);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('deleting objective', async function (assert) {
    const course = this.server.create('course');
    this.server.create('courseObjective', { course });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);

    this.set('course', courseModel);
    await render(hbs`<Course::Objectives
      @course={{this.course}}
      @editable={{true}}
      @collapse={{(noop)}}
      @expand={{(noop)}}
    />`);

    assert.strictEqual(component.objectiveList.objectives.length, 1);
    assert.strictEqual(component.title, 'Objectives (1)');
    await component.objectiveList.objectives[0].remove();
    await component.objectiveList.objectives[0].confirmRemoval.confirm();
    assert.strictEqual(component.objectiveList.objectives.length, 0);
    assert.strictEqual(component.title, 'Objectives (0)');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
