import {
  module,
  test
} from 'qunit';
import { setupAuthentication } from 'ilios-common';

import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import page from 'ilios-common/page-objects/course';

module('Acceptance | Course - Objective Inactive Parents', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.user = await setupAuthentication();
    this.school =  this.server.create('school');
  });

  test('inactive program year objectives are hidden unless they are selected', async function (assert) {
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('programYear', { program });
    const cohort = this.server.create('cohort', {
      programYear
    });
    const competency = this.server.create('competency', {
      school: this.school,
      programYears: [programYear],
    });
    const objectiveInProgramYear1 = this.server.create('objective', {
      title: 'active',
      competency,
      active: true,
    });
    const objectiveInProgramYear2 = this.server.create('objective', {
      title: 'inactive',
      competency,
      active: false,
    });
    const parent = this.server.create('objective', {
      title: 'inactive selected',
      competency,
      active: false,
    });

    this.server.create('program-year-objective', {programYear, objective: objectiveInProgramYear1 });
    this.server.create('program-year-objective', {programYear, objective: objectiveInProgramYear2 });
    this.server.create('program-year-objective', {programYear, objective: parent });

    const objectiveInCourse = this.server.create('objective', { parents: [parent] });
    const course = this.server.create('course', {
      year: 2013,
      school: this.school,
      cohorts: [cohort]
    });
    this.server.create('course-objective', {course, objective: objectiveInCourse });

    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ courseId: 1, details: true, courseObjectiveDetails: true });
    const { objectives } = page.objectives.objectiveList;
    assert.equal(objectives.length, 1);

    assert.equal(objectives[0].description.text, 'objective 3');
    assert.equal(objectives[0].parents.list.length, 1);
    assert.equal(objectives[0].parents.list[0].text, 'inactive selected');

    await objectives[0].parents.list[0].manage();
    const m = objectives[0].parentManager;

    assert.equal(m.selectedCohortTitle, 'program 0 cohort 0');
    assert.equal(m.competencies.length, 1);
    assert.equal(m.competencies[0].title, 'competency 0');
    assert.ok(m.competencies[0].selected);
    assert.equal(m.competencies[0].objectives.length, 2);
    assert.equal(m.competencies[0].objectives[0].title, 'active');
    assert.ok(m.competencies[0].objectives[0].notSelected);
    assert.equal(m.competencies[0].objectives[1].title, 'inactive selected');
    assert.ok(m.competencies[0].objectives[1].selected);
  });
});
