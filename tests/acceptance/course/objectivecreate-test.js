import {
  module,
  test
} from 'qunit';
import { setupAuthentication } from 'ilios-common';

import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from 'ilios-common/page-objects/course';

module('Acceptance | Course - Objective Create', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.user = await setupAuthentication();
    this.school = this.server.create('school');
    this.server.create('academicYear', {id: 2013});
    this.server.createList('program', 2);
    this.server.createList('programYear', 2);
    this.server.createList('cohort', 2);
    this.objective = this.server.create('objective');
    this.course = this.server.create('course', {
      year: 2013,
      school: this.school,
      objectiveIds: [1]
    });
  });

  test('save new objective', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(9);
    const newObjectiveDescription = 'Test junk 123';

    await page.visit({ courseId: 1, details: true, courseObjectiveDetails: true });
    assert.equal(page.objectives.current().count, 1);
    assert.equal(page.objectives.current(0).description.text, 'objective 0');
    await page.objectives.createNew();
    await page.objectives.newObjective.description(newObjectiveDescription);
    await page.objectives.newObjective.save();

    assert.equal(page.objectives.current().count, 2);
    assert.equal(page.objectives.current(0).description.text, 'objective 0');
    assert.equal(page.objectives.current(0).parents().count, 0);
    assert.equal(page.objectives.current(0).meshTerms().count, 0);
    assert.equal(page.objectives.current(1).description.text, newObjectiveDescription);
    assert.equal(page.objectives.current(0).parents().count, 0);
    assert.equal(page.objectives.current(0).meshTerms().count, 0);
  });

  test('cancel new objective', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(6);
    await page.visit({ courseId: 1, details: true, courseObjectiveDetails: true });
    assert.equal(page.objectives.current().count, 1);
    assert.equal(page.objectives.current(0).description.text, 'objective 0');
    await page.objectives.createNew();
    await page.objectives.newObjective.description('junk');
    await page.objectives.newObjective.cancel();

    assert.equal(page.objectives.current().count, 1);
    assert.equal(page.objectives.current(0).description.text, 'objective 0');
    assert.equal(page.objectives.current(0).parents().count, 0);
    assert.equal(page.objectives.current(0).meshTerms().count, 0);
  });

  test('empty objective title can not be created', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(5);
    await page.visit({ courseId: 1, details: true, courseObjectiveDetails: true });
    assert.equal(page.objectives.current().count, 1);
    assert.equal(page.objectives.current(0).description.text, 'objective 0');
    await page.objectives.createNew();
    assert.notOk(page.objectives.newObjective.hasValidationError);
    await page.objectives.newObjective.description('<p>&nbsp</p><div></div><span>  </span>');
    await page.objectives.newObjective.save();
    assert.ok(page.objectives.newObjective.hasValidationError);
    assert.equal(page.objectives.newObjective.validationError, 'This field can not be blank');
  });
});
