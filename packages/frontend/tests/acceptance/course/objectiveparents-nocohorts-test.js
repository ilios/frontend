import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';

import { setupApplicationTest } from 'frontend/tests/helpers';
import page from 'ilios-common/page-objects/course';

module('Acceptance | Course with no cohorts - Objective Parents', function (hooks) {
  setupApplicationTest(hooks);
  hooks.beforeEach(async function () {
    const school = await this.server.create('school');
    this.user = await setupAuthentication({ administeredSchools: [school] }, true);
    const program = await this.server.create('program', { school });

    const year = new Date().getFullYear();
    const programYear = await this.server.create('program-year', {
      program,
      startYear: year,
    });
    await this.server.create('cohort', { programYear });
    const competency = await this.server.create('competency', {
      school,
      programYears: [programYear],
    });
    await this.server.create('program-year-objective', { programYear, competency });
    this.course = await this.server.create('course', {
      year: 2013,
      school,
    });
    await this.server.create('course-objective', { course: this.course });
  });

  test('add and remove a new cohort', async function (assert) {
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

    await page.details.detailCohorts.manage();
    await page.details.detailCohorts.manager.selectableCohorts[0].add();
    await page.details.detailCohorts.save();
    assert.strictEqual(page.details.detailCohorts.list.cohorts.length, 1);
    await firstObjective.parents.manage();

    assert.strictEqual(m.selectedCohortTitle, 'program 0 cohort 0');
    assert.strictEqual(m.competencies.length, 1);
    assert.strictEqual(m.competencies[0].title, 'competency 0');
    assert.ok(m.competencies[0].notSelected);
    assert.strictEqual(m.competencies[0].objectives.length, 1);
    assert.strictEqual(m.competencies[0].objectives[0].title, 'program-year objective 0');
    assert.ok(m.competencies[0].objectives[0].notSelected);

    await page.details.detailCohorts.manage();
    await page.details.detailCohorts.manager.selectedCohorts[0].remove();
    await page.details.detailCohorts.save();
    assert.strictEqual(page.details.detailCohorts.list.cohorts.length, 0);
    await firstObjective.parents.manage();
    assert.ok(m.hasNoCohortWarning);
  });
});
