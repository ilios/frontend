import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';

import { setupApplicationTest } from 'frontend/tests/helpers';
import page from 'ilios-common/page-objects/course';
import percySnapshot from '@percy/ember';

module('Acceptance | Course - Competencies', function (hooks) {
  setupApplicationTest(hooks);
  hooks.beforeEach(async function () {
    this.user = await setupAuthentication({}, true);
    this.school = this.server.create('school');
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('program-year', {
      program,
    });
    const cohort = this.server.create('cohort', {
      programYear,
    });
    const competency1 = this.server.create('competency', {
      school: this.school,
      programYears: [programYear],
    });
    const competency2 = this.server.create('competency', {
      school: this.school,
      programYears: [programYear],
    });

    const programYearObjective = this.server.create('program-year-objective', {
      competency: competency1,
      programYear,
    });
    this.server.create('program-year-objective', {
      competency: competency2,
      programYear,
    });

    this.course = this.server.create('course', {
      year: 2013,
      school: this.school,
      cohorts: [cohort],
    });
    this.server.create('course-objective', {
      programYearObjectives: [programYearObjective],
      course: this.course,
    });
    this.server.create('course-objective', {
      programYearObjectives: [programYearObjective],
      course: this.course,
    });
  });

  test('collapsed competencies renders', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ courseId: this.course.id, details: true });
    await percySnapshot(assert);
    assert.strictEqual(page.details.collapsedCompetencies.title, 'Competencies (1)');
    assert.strictEqual(page.details.collapsedCompetencies.headers[0].text, 'School');
    assert.strictEqual(page.details.collapsedCompetencies.headers[1].text, 'Competencies');
    assert.strictEqual(page.details.collapsedCompetencies.competencies[0].school, 'school 0');
    assert.strictEqual(page.details.collapsedCompetencies.competencies[0].count, '1');
  });

  test('changing objective parent changes summary', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
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
