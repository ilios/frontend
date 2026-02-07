import { module, test } from 'qunit';
import { setupApplicationTest, takeScreenshot } from 'frontend/tests/helpers';
import { setupAuthentication } from 'ilios-common';
import page from 'ilios-common/page-objects/course';
import percySnapshot from '@percy/ember';

module('Acceptance | Course - Cohorts', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    this.user = await setupAuthentication(
      {
        school,
        administeredSchools: [school],
      },
      true,
    );
    const currentYear = new Date().getFullYear();
    this.server.create('academic-year', { id: currentYear });
    const program = this.server.create('program', { school, duration: 4 });
    const cohort1 = this.server.create('cohort');
    const cohort2 = this.server.create('cohort');
    const cohort3 = this.server.create('cohort');
    const cohort4 = this.server.create('cohort');

    // first two should get through the filter
    const programYear1 = this.server.create('program-year', {
      program,
      cohort: cohort1,
      startYear: currentYear - program.duration,
    });
    const programYear2 = this.server.create('program-year', {
      program,
      cohort: cohort2,
      startYear: currentYear - program.duration - 4,
    });

    // extras should not get through the filter
    // (startYear + duration) <= (currentYear + duration)
    // &&
    // (startYear + duration) >= (currentYear + duration)
    const programYear3 = this.server.create('program-year', {
      program,
      cohort: cohort3,
      startYear: currentYear - program.duration - 5,
    });
    const programYear4 = this.server.create('program-year', {
      program,
      cohort: cohort4,
      startYear: currentYear - program.duration + 5,
    });
    const programYearObjective1 = this.server.create('program-year-objective', {
      programYear: programYear1,
    });
    const programYearObjective2 = this.server.create('program-year-objective', {
      programYear: programYear2,
    });
    const programYearObjective3 = this.server.create('program-year-objective', {
      programYear: programYear3,
    });
    const programYearObjective4 = this.server.create('program-year-objective', {
      programYear: programYear4,
    });

    this.course = this.server.create('course', {
      year: 2013,
      school,
      cohorts: [programYear1.cohort], //instead of just cohort1 otherwise the relationship gets munged
    });

    this.server.create('course-objective', {
      course: this.course,
      programYearObjectives: [
        programYearObjective1,
        programYearObjective2,
        programYearObjective3,
        programYearObjective4,
      ],
    });
  });

  test('list cohorts', async function (assert) {
    await page.visit({ courseId: this.course.id, details: true });
    assert.strictEqual(page.details.detailCohorts.list.cohorts.length, 1);
    assert.strictEqual(page.details.detailCohorts.list.cohorts[0].school, 'school 0');
    assert.strictEqual(page.details.detailCohorts.list.cohorts[0].program, 'program 0');
    assert.strictEqual(page.details.detailCohorts.list.cohorts[0].cohort, 'cohort 0');
  });

  test('manage cohorts', async function (assert) {
    await page.visit({ courseId: this.course.id, details: true });
    await page.details.detailCohorts.manage();
    await takeScreenshot(assert);
    await percySnapshot(assert);

    assert.strictEqual(page.details.detailCohorts.manager.selectedCohorts.length, 1);
    assert.strictEqual(
      page.details.detailCohorts.manager.selectedCohorts[0].text,
      'school 0 | program 0 | cohort 0',
    );
    assert.strictEqual(page.details.detailCohorts.manager.selectableCohorts.length, 2);
    assert.strictEqual(
      page.details.detailCohorts.manager.selectableCohorts[0].text,
      'school 0 | program 0 | cohort 3',
    );
    assert.strictEqual(
      page.details.detailCohorts.manager.selectableCohorts[1].text,
      'school 0 | program 0 | cohort 1',
    );
  });

  test('save cohort changes', async function (assert) {
    await page.visit({ courseId: this.course.id, details: true });
    await page.details.detailCohorts.manage();
    await page.details.detailCohorts.manager.selectedCohorts[0].remove();
    await page.details.detailCohorts.manager.selectableCohorts[0].add();
    await page.details.detailCohorts.save();

    assert.strictEqual(page.details.detailCohorts.list.cohorts.length, 1);
    assert.strictEqual(page.details.detailCohorts.list.cohorts[0].school, 'school 0');
    assert.strictEqual(page.details.detailCohorts.list.cohorts[0].program, 'program 0');
    assert.strictEqual(page.details.detailCohorts.list.cohorts[0].cohort, 'cohort 3');
  });

  test('cancel cohort changes', async function (assert) {
    await page.visit({ courseId: this.course.id, details: true });
    await page.details.detailCohorts.manage();
    await page.details.detailCohorts.manager.selectedCohorts[0].remove();
    await page.details.detailCohorts.manager.selectableCohorts[0].add();
    await page.details.detailCohorts.cancel();

    assert.strictEqual(page.details.detailCohorts.list.cohorts.length, 1);
    assert.strictEqual(page.details.detailCohorts.list.cohorts[0].school, 'school 0');
    assert.strictEqual(page.details.detailCohorts.list.cohorts[0].program, 'program 0');
    assert.strictEqual(page.details.detailCohorts.list.cohorts[0].cohort, 'cohort 0');
  });

  test('removing a cohort remove course objectives parents linked to that cohort', async function (assert) {
    await page.visit({
      courseId: this.course.id,
      details: true,
      courseObjectiveDetails: true,
    });
    assert.strictEqual(page.details.objectives.objectiveList.objectives.length, 1);
    assert.strictEqual(page.details.objectives.objectiveList.objectives[0].parents.list.length, 4);
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].parents.list[0].text,
      'program-year objective 0',
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].parents.list[1].text,
      'program-year objective 1',
    );

    await page.details.detailCohorts.manage();
    await page.details.detailCohorts.manager.selectedCohorts[0].remove();
    await page.details.detailCohorts.save();

    assert.strictEqual(page.details.objectives.objectiveList.objectives.length, 1);
    assert.strictEqual(page.details.objectives.objectiveList.objectives[0].parents.list.length, 3);
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].parents.list[0].text,
      'program-year objective 1',
    );
  });
});
