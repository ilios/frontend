import {
  module,
  test
} from 'qunit';
import { setupAuthentication } from 'ilios-common';

import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import page from 'ilios-common/page-objects/course';

module('Acceptance | Course - Objective Parents', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.user = await setupAuthentication();
    this.school =  this.server.create('school');
    this.server.create('program', { school: this.school });
    this.server.create('programYear', {
      programId: 1,
    });
    this.server.create('cohort', {
      programYearId: 1
    });
    this.server.create('competency', {
      school: this.school,
      programYearIds: [1],
    });
    this.server.create('competency', {
      school: this.school,
      programYearIds: [1],
    });
    this.server.create('objective', {
      programYearIds: [1],
      competencyId: 1
    });
    this.server.create('objective', {
      competencyId: 2,
      programYearIds: [1],
    });
    this.server.create('objective', {
      competencyId: 2,
      programYearIds: [1],
    });
    this.server.create('objective', {
      parentIds: [1]
    });
    this.server.create('objective');
    this.server.create('course', {
      year: 2013,
      school: this.school,
      objectiveIds: [4,5],
      cohortIds: [1]
    });
  });

  test('list parent objectives by competency', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(19);

    await page.visit({ courseId: 1, details: true, courseObjectiveDetails: true });
    assert.equal(page.objectives.objectiveList.objectives.length, 2);

    assert.equal(page.objectives.objectiveList.objectives[0].description.text, 'objective 3');
    assert.equal(page.objectives.objectiveList.objectives[0].parents.length, 1);
    assert.equal(page.objectives.objectiveList.objectives[0].parents[0].description, 'objective 0');


    await page.objectives.objectiveList.objectives[0].manageParents();
    const m = page.objectives.manageObjectiveParents;

    assert.equal(m.objectiveTitle, 'objective 3');
    assert.equal(m.selectedCohortTitle, 'program 0 cohort 0');
    assert.equal(m.competencies.length, 2);
    assert.equal(m.competencies[0].title, 'competency 0');
    assert.ok(m.competencies[0].selected);
    assert.equal(m.competencies[0].objectives.length, 1);
    assert.equal(m.competencies[0].objectives[0].title, 'objective 0');
    assert.ok(m.competencies[0].objectives[0].selected);

    assert.equal(m.competencies[1].title, 'competency 1');
    assert.ok(m.competencies[1].notSelected);
    assert.equal(m.competencies[1].objectives.length, 2);
    assert.equal(m.competencies[1].objectives[0].title, 'objective 1');
    assert.ok(m.competencies[1].objectives[0].notSelected);
    assert.equal(m.competencies[1].objectives[1].title, 'objective 2');
    assert.ok(m.competencies[1].objectives[1].notSelected);
  });

  test('save changes', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(11);
    await page.visit({ courseId: 1, details: true, courseObjectiveDetails: true });
    assert.equal(page.objectives.objectiveList.objectives.length, 2);

    assert.equal(page.objectives.objectiveList.objectives[0].description.text, 'objective 3');
    assert.equal(page.objectives.objectiveList.objectives[0].parents.length, 1);
    assert.equal(page.objectives.objectiveList.objectives[0].parents[0].description, 'objective 0');


    await page.objectives.objectiveList.objectives[0].manageParents();
    const m = page.objectives.manageObjectiveParents;

    assert.equal(m.objectiveTitle, 'objective 3');
    assert.equal(m.selectedCohortTitle, 'program 0 cohort 0');
    await m.competencies[1].objectives[0].add();
    assert.ok(m.competencies[0].objectives[0].notSelected);
    assert.ok(m.competencies[1].objectives[0].selected);
    await page.objectives.save();

    assert.equal(page.objectives.objectiveList.objectives[0].description.text, 'objective 3');
    assert.equal(page.objectives.objectiveList.objectives[0].parents.length, 1);
    assert.equal(page.objectives.objectiveList.objectives[0].parents[0].description, 'objective 1');

  });

  test('cancel changes', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(11);
    await page.visit({ courseId: 1, details: true, courseObjectiveDetails: true });
    assert.equal(page.objectives.objectiveList.objectives.length, 2);

    assert.equal(page.objectives.objectiveList.objectives[0].description.text, 'objective 3');
    assert.equal(page.objectives.objectiveList.objectives[0].parents.length, 1);
    assert.equal(page.objectives.objectiveList.objectives[0].parents[0].description, 'objective 0');


    await page.objectives.objectiveList.objectives[0].manageParents();
    const m = page.objectives.manageObjectiveParents;

    assert.equal(m.objectiveTitle, 'objective 3');
    assert.equal(m.selectedCohortTitle, 'program 0 cohort 0');
    await m.competencies[1].objectives[0].add();
    assert.ok(m.competencies[0].objectives[0].notSelected);
    assert.ok(m.competencies[1].objectives[0].selected);
    await page.objectives.cancel();

    assert.equal(page.objectives.objectiveList.objectives[0].description.text, 'objective 3');
    assert.equal(page.objectives.objectiveList.objectives[0].parents.length, 1);
    assert.equal(page.objectives.objectiveList.objectives[0].parents[0].description, 'objective 0');
  });
});
