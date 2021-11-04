import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';

import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import page from 'ilios-common/page-objects/course';

module('Acceptance | Course - Objective Parents', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.user = await setupAuthentication();
    this.school = this.server.create('school');
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('programYear', { program });
    const cohort = this.server.create('cohort', { programYear });
    const competency1 = this.server.create('competency', {
      school: this.school,
      programYears: [programYear],
    });
    const competency2 = this.server.create('competency', {
      school: this.school,
      programYears: [programYear],
    });
    const parent = this.server.create('programYearObjective', {
      programYear,
      competency: competency1,
    });
    this.server.create('programYearObjective', {
      programYear,
      competency: competency2,
    });
    this.server.create('programYearObjective', {
      programYear,
      competency: competency2,
    });
    const course = this.server.create('course', {
      year: 2013,
      school: this.school,
      cohorts: [cohort],
    });
    this.server.create('courseObjective', {
      course,
      programYearObjectives: [parent],
    });
    this.server.create('courseObjective', { course });
  });

  test('list parent objectives by competency', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(18);

    await page.details.visit({
      courseId: 1,
      details: true,
      courseObjectiveDetails: true,
    });
    assert.strictEqual(page.details.objectives.objectiveList.objectives.length, 2);

    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].description.text,
      'course objective 0'
    );
    assert.strictEqual(page.details.objectives.objectiveList.objectives[0].parents.list.length, 1);
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].parents.list[0].text,
      'program-year objective 0'
    );

    await page.details.objectives.objectiveList.objectives[0].parents.list[0].manage();
    const m = page.details.objectives.objectiveList.objectives[0].parentManager;

    assert.strictEqual(m.selectedCohortTitle, 'program 0 cohort 0');
    assert.strictEqual(m.competencies.length, 2);
    assert.strictEqual(m.competencies[0].title, 'competency 0');
    assert.ok(m.competencies[0].selected);
    assert.strictEqual(m.competencies[0].objectives.length, 1);
    assert.strictEqual(m.competencies[0].objectives[0].title, 'program-year objective 0');
    assert.ok(m.competencies[0].objectives[0].selected);

    assert.strictEqual(m.competencies[1].title, 'competency 1');
    assert.ok(m.competencies[1].notSelected);
    assert.strictEqual(m.competencies[1].objectives.length, 2);
    assert.strictEqual(m.competencies[1].objectives[0].title, 'program-year objective 1');
    assert.ok(m.competencies[1].objectives[0].notSelected);
    assert.strictEqual(m.competencies[1].objectives[1].title, 'program-year objective 2');
    assert.ok(m.competencies[1].objectives[1].notSelected);
  });

  test('save changes', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(10);
    await page.details.visit({
      courseId: 1,
      details: true,
      courseObjectiveDetails: true,
    });
    assert.strictEqual(page.details.objectives.objectiveList.objectives.length, 2);

    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].description.text,
      'course objective 0'
    );
    assert.strictEqual(page.details.objectives.objectiveList.objectives[0].parents.list.length, 1);
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].parents.list[0].text,
      'program-year objective 0'
    );

    await page.details.objectives.objectiveList.objectives[0].parents.list[0].manage();
    const m = page.details.objectives.objectiveList.objectives[0].parentManager;

    assert.strictEqual(m.selectedCohortTitle, 'program 0 cohort 0');
    await m.competencies[1].objectives[0].add();
    assert.ok(m.competencies[0].objectives[0].notSelected);
    assert.ok(m.competencies[1].objectives[0].selected);
    await page.details.objectives.objectiveList.objectives[0].parents.save();

    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].description.text,
      'course objective 0'
    );
    assert.strictEqual(page.details.objectives.objectiveList.objectives[0].parents.list.length, 1);
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].parents.list[0].text,
      'program-year objective 1'
    );
  });

  test('cancel changes', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(10);
    await page.details.visit({
      courseId: 1,
      details: true,
      courseObjectiveDetails: true,
    });
    assert.strictEqual(page.details.objectives.objectiveList.objectives.length, 2);

    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].description.text,
      'course objective 0'
    );
    assert.strictEqual(page.details.objectives.objectiveList.objectives[0].parents.list.length, 1);
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].parents.list[0].text,
      'program-year objective 0'
    );

    await page.details.objectives.objectiveList.objectives[0].parents.list[0].manage();
    const m = page.details.objectives.objectiveList.objectives[0].parentManager;

    assert.strictEqual(m.selectedCohortTitle, 'program 0 cohort 0');
    await m.competencies[1].objectives[0].add();
    assert.ok(m.competencies[0].objectives[0].notSelected);
    assert.ok(m.competencies[1].objectives[0].selected);
    await page.details.objectives.objectiveList.objectives[0].parents.cancel();

    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].description.text,
      'course objective 0'
    );
    assert.strictEqual(page.details.objectives.objectiveList.objectives[0].parents.list.length, 1);
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].parents.list[0].text,
      'program-year objective 0'
    );
  });
});
