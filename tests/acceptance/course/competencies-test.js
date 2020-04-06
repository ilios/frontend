import {
  module,
  test
} from 'qunit';
import { setupAuthentication } from 'ilios-common';

import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import page from 'ilios-common/page-objects/course';

module('Acceptance | Course - Competencies', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.user = await setupAuthentication();
    this.school =  this.server.create('school');
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('programYear', {
      program,
    });
    const cohort = this.server.create('cohort', {
      programYear
    });
    const competency1 = this.server.create('competency', {
      school: this.school,
      programYears: [programYear],
    });
    const competency2 = this.server.create('competency', {
      school: this.school,
      programYears: [programYear],
    });
    const programYearObjective1 = this.server.create('objective', {
      programYears: [programYear],
      competency: competency1,
    });
    this.server.create('objective', {
      programYears: [programYear],
      competency: competency2,
    });
    const objective1 = this.server.create('objective', {
      parents: [programYearObjective1],
    });
    const objective2 = this.server.create('objective', {
      parents: [programYearObjective1],
    });
    this.server.create('course', {
      year: 2013,
      school: this.school,
      objectives: [objective1, objective2],
      cohorts: [cohort]
    });
  });

  test('collapsed competencies renders', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ courseId: 1, details: true });
    assert.equal(page.collapsedCompetencies.title, 'Competencies (1)');
    assert.equal(page.collapsedCompetencies.headers[0].text, 'School');
    assert.equal(page.collapsedCompetencies.headers[1].text, 'Competencies');
    assert.equal(page.collapsedCompetencies.competencies[0].school, 'school 0');
    assert.equal(page.collapsedCompetencies.competencies[0].count, '1');
  });

  test('changing objective parent changes summary', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ courseId: 1, details: true, courseObjectiveDetails: true });
    await page.objectives.objectiveList.objectives[1].parents.list[0].manage();
    const m = page.objectives.objectiveList.objectives[1].parentManager;
    await m.competencies[1].objectives[0].add();
    assert.ok(m.competencies[0].objectives[0].notSelected);
    assert.ok(m.competencies[1].objectives[0].selected);
    await page.objectives.objectiveList.objectives[1].parents.save();

    assert.equal(page.collapsedCompetencies.title, 'Competencies (2)');
    assert.equal(page.collapsedCompetencies.headers[0].text, 'School');
    assert.equal(page.collapsedCompetencies.headers[1].text, 'Competencies');
    assert.equal(page.collapsedCompetencies.competencies[0].school, 'school 0');
    assert.equal(page.collapsedCompetencies.competencies[0].count, '2');
  });
});
