import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';

import { setupApplicationTest } from 'frontend/tests/helpers';
import page from 'ilios-common/page-objects/course';

module('Acceptance | Course with no cohorts - Objective Parents', function (hooks) {
  setupApplicationTest(hooks);
  hooks.beforeEach(async function () {
    this.user = await setupAuthentication({}, true);
    this.school = this.server.create('school');
    const program = this.server.create('program', { school: this.school });

    const year = new Date().getFullYear();
    const programYear = this.server.create('program-year', {
      program,
      startYear: year,
    });
    this.server.create('cohort', { programYear });
    const competency = this.server.create('competency', {
      school: this.school,
      programYears: [programYear],
    });
    this.server.create('program-year-objective', { programYear, competency });
    this.course = this.server.create('course', {
      year: 2013,
      school: this.school,
    });
    this.server.create('course-objective', { course: this.course });
  });

  test('add and remove a new cohort', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({
      courseId: this.course.id,
      details: true,
      courseObjectiveDetails: true,
    });
    assert.strictEqual(page.details.objectives.objectiveList.objectives.length, 1);
    const firstObjective = page.details.objectives.objectiveList.objectives[0];

    assert.strictEqual(firstObjective.description.text, 'course objective 0');
    assert.ok(firstObjective.parents.empty);
    await firstObjective.parents.manage();
    const m = firstObjective.parentManager;

    assert.ok(m.hasNoCohortWarning);

    await page.details.cohorts.manage();
    await page.details.cohorts.selectable[0].add();
    await page.details.cohorts.save();
    assert.strictEqual(page.details.cohorts.current.length, 1);
    await firstObjective.parents.manage();

    assert.strictEqual(m.selectedCohortTitle, 'program 0 cohort 0');
    assert.strictEqual(m.competencies.length, 1);
    assert.strictEqual(m.competencies[0].title, 'competency 0');
    assert.ok(m.competencies[0].notSelected);
    assert.strictEqual(m.competencies[0].objectives.length, 1);
    assert.strictEqual(m.competencies[0].objectives[0].title, 'program-year objective 0');
    assert.ok(m.competencies[0].objectives[0].notSelected);

    await page.details.cohorts.manage();
    await page.details.cohorts.selected[0].remove();
    await page.details.cohorts.save();
    assert.strictEqual(page.details.cohorts.current.length, 0);
    await firstObjective.parents.manage();
    assert.ok(m.hasNoCohortWarning);
  });
});
