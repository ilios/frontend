import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';

import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import page from 'ilios-common/page-objects/course';

module('Acceptance | Course - Multiple Objective  Parents', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.user = await setupAuthentication();
    this.school = this.server.create('school');
    this.server.create('schoolConfig', {
      school: this.school,
      name: 'allowMultipleCourseObjectiveParents',
      value: true,
    });
    this.user.update({ administeredSchools: [this.school] });

    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', { programYear });
    const competency = this.server.create('competency', {
      school: this.school,
      programYears: [programYear],
    });
    const programYearObjectives = this.server.createList('programYearObjective', 3, {
      programYear,
      competency,
    });

    this.course = this.server.create('course', {
      school: this.school,
      cohorts: [cohort],
    });

    this.server.create('courseObjective', {
      programYearObjectives: [programYearObjectives[0], programYearObjectives[1]],
      course: this.course,
    });
  });

  test('initial view', async function (assert) {
    assert.expect(16);

    await page.visit({
      courseId: this.course.id,
      details: true,
      courseObjectiveDetails: true,
    });
    assert.strictEqual(page.details.objectives.objectiveList.objectives.length, 1);

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
      'program-year objective 1'
    );

    await page.details.objectives.objectiveList.objectives[0].parents.list[0].manage();
    const m = page.details.objectives.objectiveList.objectives[0].parentManager;

    assert.strictEqual(m.selectedCohortTitle, 'program 0 cohort 0');
    assert.strictEqual(m.competencies.length, 1);
    assert.strictEqual(m.competencies[0].title, 'competency 0');
    assert.ok(m.competencies[0].selected);
    assert.strictEqual(m.competencies[0].objectives.length, 3);
    assert.strictEqual(m.competencies[0].objectives[0].title, 'program-year objective 0');
    assert.ok(m.competencies[0].objectives[0].selected);
    assert.strictEqual(m.competencies[0].objectives[1].title, 'program-year objective 1');
    assert.ok(m.competencies[0].objectives[1].selected);
    assert.strictEqual(m.competencies[0].objectives[2].title, 'program-year objective 2');
    assert.ok(m.competencies[0].objectives[2].notSelected);
  });

  test('can select multiple parents', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(8);
    await page.visit({
      courseId: this.course.id,
      details: true,
      courseObjectiveDetails: true,
    });
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].description.text,
      'course objective 0'
    );
    await page.details.objectives.objectiveList.objectives[0].parents.list[0].manage();
    const m = page.details.objectives.objectiveList.objectives[0].parentManager;

    await m.competencies[0].objectives[2].add();
    await m.competencies[0].objectives[1].add();
    assert.ok(m.competencies[0].objectives[0].selected);
    assert.ok(m.competencies[0].objectives[1].notSelected);
    assert.ok(m.competencies[0].objectives[2].selected);
    await page.details.objectives.objectiveList.objectives[0].parents.save();

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
      'program-year objective 2'
    );
  });
});
