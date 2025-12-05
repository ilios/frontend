import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';

import { setupApplicationTest, takeScreenshot } from 'frontend/tests/helpers';
import page from 'ilios-common/page-objects/course';

module('Acceptance | Course - Competencies', function (hooks) {
  setupApplicationTest(hooks);
  hooks.beforeEach(async function () {
    const school = await this.server.create('school');
    this.user = await setupAuthentication({ administeredSchools: [school] }, true);
    const program = await this.server.create('program', { school });
    const programYear = await this.server.create('program-year', {
      program,
    });
    const cohort = await this.server.create('cohort', {
      programYear,
    });
    const competency1 = await this.server.create('competency', {
      school,
      programYears: [programYear],
    });
    const competency2 = await this.server.create('competency', {
      school,
      programYears: [programYear],
    });

    const programYearObjective = await this.server.create('program-year-objective', {
      competency: competency1,
      programYear,
    });
    await this.server.create('program-year-objective', {
      competency: competency2,
      programYear,
    });

    this.course = await this.server.create('course', {
      year: 2013,
      school,
      cohorts: [cohort],
    });
    await this.server.create('course-objective', {
      programYearObjectives: [programYearObjective],
      course: this.course,
    });
    await this.server.create('course-objective', {
      programYearObjectives: [programYearObjective],
      course: this.course,
    });
  });

  test('collapsed competencies renders', async function (assert) {
    await page.visit({ courseId: this.course.id, details: true });
    await takeScreenshot(assert);
    assert.strictEqual(page.details.collapsedCompetencies.title, 'Competencies (1)');
    assert.strictEqual(page.details.collapsedCompetencies.headers[0].text, 'School');
    assert.strictEqual(page.details.collapsedCompetencies.headers[1].text, 'Competencies');
    assert.strictEqual(page.details.collapsedCompetencies.competencies[0].school, 'school 0');
    assert.strictEqual(page.details.collapsedCompetencies.competencies[0].count, '1');
  });

  test('changing objective parent changes summary', async function (assert) {
    await page.visit({
      courseId: this.course.id,
      details: true,
      courseObjectiveDetails: true,
    });
    await page.details.objectives.objectiveList.objectives[1].parents.manage();
    const m = page.details.objectives.objectiveList.objectives[1].parentManager;
    await m.competencies[1].objectives[0].add();
    assert.ok(m.competencies[0].objectives[0].notSelected);
    assert.ok(m.competencies[1].objectives[0].selected);
    await page.details.objectives.objectiveList.objectives[1].parents.save();

    assert.strictEqual(page.details.collapsedCompetencies.title, 'Competencies (2)');
    assert.strictEqual(page.details.collapsedCompetencies.headers[0].text, 'School');
    assert.strictEqual(page.details.collapsedCompetencies.headers[1].text, 'Competencies');
    assert.strictEqual(page.details.collapsedCompetencies.competencies[0].school, 'school 0');
    assert.strictEqual(page.details.collapsedCompetencies.competencies[0].count, '2');
  });
});
