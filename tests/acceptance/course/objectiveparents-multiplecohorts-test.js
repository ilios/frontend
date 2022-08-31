import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'dummy/tests/helpers';
import page from 'ilios-common/page-objects/course';

module('Acceptance | Course with multiple Cohorts - Objective Parents', function (hooks) {
  setupApplicationTest(hooks);
  hooks.beforeEach(async function () {
    this.user = await setupAuthentication();
    this.school = this.server.create('school');
    const program = this.server.create('program', { school: this.school });

    const programYears = this.server.createList('programYear', 2, {
      program,
    });
    const cohort1 = this.server.create('cohort', {
      programYear: programYears[0],
    });
    const cohort2 = this.server.create('cohort', {
      programYear: programYears[1],
    });
    const competencies = this.server.createList('competency', 2, {
      school: this.school,
      programYears,
    });

    const programYearObjective1 = this.server.create('programYearObjective', {
      programYear: programYears[0],
      competency: competencies[0],
    });
    this.server.create('programYearObjective', {
      programYear: programYears[0],
      competency: competencies[1],
    });
    this.server.create('programYearObjective', {
      programYear: programYears[1],
      competency: competencies[0],
    });
    const programYearObjective4 = this.server.create('programYearObjective', {
      programYear: programYears[1],
      competency: competencies[1],
    });

    this.course = this.server.create('course', {
      year: 2013,
      school: this.school,
      cohorts: [cohort1, cohort2],
    });
    this.server.create('courseObjective', {
      course: this.course,
      programYearObjectives: [programYearObjective1, programYearObjective4],
    });
    this.server.create('courseObjective', { course: this.course });
  });

  test('list parent objectives by competency', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(32);

    await page.visit({
      courseId: this.course.id,
      details: true,
      courseObjectiveDetails: true,
    });
    assert.strictEqual(page.details.objectives.objectiveList.objectives.length, 2);

    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].description.text,
      'course objective 0'
    );
    assert.strictEqual(page.details.objectives.objectiveList.objectives[0].parents.list.length, 2);
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].parents.list[0].text,
      'program-year objective 0'
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].parents.list[1].text,
      'program-year objective 3'
    );
    await page.details.objectives.objectiveList.objectives[0].parents.list[0].manage();
    const m = page.details.objectives.objectiveList.objectives[0].parentManager;

    await m.selectCohort(1);

    assert.strictEqual(m.cohorts.length, 2);
    assert.strictEqual(m.cohorts[0].title, 'program 0 cohort 0');
    assert.strictEqual(m.cohorts[0].value, '1');
    assert.strictEqual(m.cohorts[1].title, 'program 0 cohort 1');
    assert.strictEqual(m.cohorts[1].value, '2');

    assert.strictEqual(m.competencies.length, 2);
    assert.strictEqual(m.competencies[0].title, 'competency 0');
    assert.ok(m.competencies[0].selected);
    assert.strictEqual(m.competencies[0].objectives.length, 1);
    assert.strictEqual(m.competencies[0].objectives[0].title, 'program-year objective 0');
    assert.ok(m.competencies[0].objectives[0].selected);

    assert.strictEqual(m.competencies[1].title, 'competency 1');
    assert.ok(m.competencies[1].notSelected);
    assert.strictEqual(m.competencies[1].objectives.length, 1);
    assert.strictEqual(m.competencies[1].objectives[0].title, 'program-year objective 1');
    assert.ok(m.competencies[1].objectives[0].notSelected);

    await m.selectCohort(2);

    assert.strictEqual(m.competencies.length, 2);
    assert.strictEqual(m.competencies[0].title, 'competency 0');
    assert.ok(m.competencies[0].notSelected);
    assert.strictEqual(m.competencies[0].objectives.length, 1);
    assert.strictEqual(m.competencies[0].objectives[0].title, 'program-year objective 2');
    assert.ok(m.competencies[0].objectives[0].notSelected);

    assert.strictEqual(m.competencies[1].title, 'competency 1');
    assert.ok(m.competencies[1].selected);
    assert.strictEqual(m.competencies[1].objectives.length, 1);
    assert.strictEqual(m.competencies[1].objectives[0].title, 'program-year objective 3');
    assert.ok(m.competencies[1].objectives[0].selected);
  });

  test('save changes', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(12);
    await page.visit({
      courseId: this.course.id,
      details: true,
      courseObjectiveDetails: true,
    });
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].description.text,
      'course objective 0'
    );
    assert.strictEqual(page.details.objectives.objectiveList.objectives[0].parents.list.length, 2);
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].parents.list[0].text,
      'program-year objective 0'
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].parents.list[1].text,
      'program-year objective 3'
    );
    await page.details.objectives.objectiveList.objectives[0].parents.list[0].manage();
    const m = page.details.objectives.objectiveList.objectives[0].parentManager;

    await m.selectCohort(1);

    await m.competencies[1].objectives[0].add();
    assert.ok(m.competencies[0].objectives[0].notSelected);
    assert.ok(m.competencies[1].objectives[0].selected);
    await m.selectCohort(2);
    await m.competencies[0].objectives[0].add();
    assert.ok(m.competencies[0].objectives[0].selected);
    assert.ok(m.competencies[1].objectives[0].notSelected);

    await page.details.objectives.objectiveList.objectives[0].parents.save();

    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].description.text,
      'course objective 0'
    );
    assert.strictEqual(page.details.objectives.objectiveList.objectives[0].parents.list.length, 2);
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].parents.list[0].text,
      'program-year objective 1'
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].parents.list[1].text,
      'program-year objective 2'
    );
  });

  test('cancel changes', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(12);
    await page.visit({
      courseId: this.course.id,
      details: true,
      courseObjectiveDetails: true,
    });
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].description.text,
      'course objective 0'
    );
    assert.strictEqual(page.details.objectives.objectiveList.objectives[0].parents.list.length, 2);
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].parents.list[0].text,
      'program-year objective 0'
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].parents.list[1].text,
      'program-year objective 3'
    );
    await page.details.objectives.objectiveList.objectives[0].parents.list[0].manage();
    const m = page.details.objectives.objectiveList.objectives[0].parentManager;

    await m.selectCohort(1);

    await m.competencies[1].objectives[0].add();
    assert.ok(m.competencies[0].objectives[0].notSelected);
    assert.ok(m.competencies[1].objectives[0].selected);
    await m.selectCohort(2);
    await m.competencies[0].objectives[0].add();
    assert.ok(m.competencies[0].objectives[0].selected);
    assert.ok(m.competencies[1].objectives[0].notSelected);

    await page.details.objectives.objectiveList.objectives[0].parents.cancel();

    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].description.text,
      'course objective 0'
    );
    assert.strictEqual(page.details.objectives.objectiveList.objectives[0].parents.list.length, 2);
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].parents.list[0].text,
      'program-year objective 0'
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].parents.list[1].text,
      'program-year objective 3'
    );
  });
});
