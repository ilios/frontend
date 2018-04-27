import {
  module,
  test
} from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from 'ilios/tests/pages/course';

module('Acceptance: Course - Objective Parents', function(hooks) {
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
    assert.equal(page.objectives.current().count, 2);

    assert.equal(page.objectives.current(0).description.text, 'objective 3');
    assert.equal(page.objectives.current(0).parents().count, 1);
    assert.equal(page.objectives.current(0).parents(0).description, 'objective 0');


    await page.objectives.current(0).manageParents();

    assert.equal(page.objectiveParentManager.title, 'objective 3');
    assert.equal(page.objectiveParentManager.groupTitle, 'Select Parent For: program 0 cohort 0');
    assert.equal(page.objectiveParentManager.competencies().count, 2);
    assert.equal(page.objectiveParentManager.competencies(0).title, 'competency 0');
    assert.ok(page.objectiveParentManager.competencies(0).selected);
    assert.equal(page.objectiveParentManager.competencies(0).objectives().count, 1);
    assert.equal(page.objectiveParentManager.competencies(0).objectives(0).title, 'objective 0');
    assert.ok(page.objectiveParentManager.competencies(0).objectives(0).selected);

    assert.equal(page.objectiveParentManager.competencies(1).title, 'competency 1');
    assert.ok(page.objectiveParentManager.competencies(1).notSelected);
    assert.equal(page.objectiveParentManager.competencies(1).objectives().count, 2);
    assert.equal(page.objectiveParentManager.competencies(1).objectives(0).title, 'objective 1');
    assert.ok(page.objectiveParentManager.competencies(1).objectives(0).notSelected);
    assert.equal(page.objectiveParentManager.competencies(1).objectives(1).title, 'objective 2');
    assert.ok(page.objectiveParentManager.competencies(1).objectives(1).notSelected);
  });

  test('save changes', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(11);
    await page.visit({ courseId: 1, details: true, courseObjectiveDetails: true });
    assert.equal(page.objectives.current().count, 2);

    assert.equal(page.objectives.current(0).description.text, 'objective 3');
    assert.equal(page.objectives.current(0).parents().count, 1);
    assert.equal(page.objectives.current(0).parents(0).description, 'objective 0');


    await page.objectives.current(0).manageParents();

    assert.equal(page.objectiveParentManager.title, 'objective 3');
    assert.equal(page.objectiveParentManager.groupTitle, 'Select Parent For: program 0 cohort 0');
    await page.objectiveParentManager.competencies(1).objectives(0).add();
    assert.ok(page.objectiveParentManager.competencies(0).objectives(0).notSelected);
    assert.ok(page.objectiveParentManager.competencies(1).objectives(0).selected);
    await page.objectives.save();

    assert.equal(page.objectives.current(0).description.text, 'objective 3');
    assert.equal(page.objectives.current(0).parents().count, 1);
    assert.equal(page.objectives.current(0).parents(0).description, 'objective 1');

  });

  test('cancel changes', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(11);
    await page.visit({ courseId: 1, details: true, courseObjectiveDetails: true });
    assert.equal(page.objectives.current().count, 2);

    assert.equal(page.objectives.current(0).description.text, 'objective 3');
    assert.equal(page.objectives.current(0).parents().count, 1);
    assert.equal(page.objectives.current(0).parents(0).description, 'objective 0');


    await page.objectives.current(0).manageParents();

    assert.equal(page.objectiveParentManager.title, 'objective 3');
    assert.equal(page.objectiveParentManager.groupTitle, 'Select Parent For: program 0 cohort 0');
    await page.objectiveParentManager.competencies(1).objectives(0).add();
    assert.ok(page.objectiveParentManager.competencies(0).objectives(0).notSelected);
    assert.ok(page.objectiveParentManager.competencies(1).objectives(0).selected);
    await page.objectives.cancel();

    assert.equal(page.objectives.current(0).description.text, 'objective 3');
    assert.equal(page.objectives.current(0).parents().count, 1);
    assert.equal(page.objectives.current(0).parents(0).description, 'objective 0');
  });
});
