import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';

import { setupApplicationTest } from 'frontend/tests/helpers';
import page from 'ilios-common/page-objects/session';

module('Acceptance | Session - Objective Create', function (hooks) {
  setupApplicationTest(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school }, true);
    this.server.create('academic-year', { id: 2013 });
    this.server.createList('program', 2);
    this.server.createList('programYear', 2);
    this.server.createList('cohort', 2);
    this.course = this.server.create('course', {
      year: 2013,
      school: this.school,
    });
    const session = this.server.create('session', {
      course: this.course,
    });
    this.server.create('session-objective', { session });
  });

  test('save new objective', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const newObjectiveDescription = 'Test junk 123';

    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionObjectiveDetails: true,
    });
    assert.strictEqual(page.details.objectives.objectiveList.objectives.length, 1);
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].description.text,
      'session objective 0',
    );
    await page.details.objectives.createNew();
    await page.details.objectives.newObjective.description.set(newObjectiveDescription);
    await page.details.objectives.newObjective.save();

    assert.strictEqual(page.details.objectives.objectiveList.objectives.length, 2);
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].description.text,
      'session objective 0',
    );
    assert.ok(page.details.objectives.objectiveList.objectives[0].parents.empty);
    assert.ok(page.details.objectives.objectiveList.objectives[0].meshDescriptors.empty);
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[1].description.text,
      newObjectiveDescription,
    );
    assert.ok(page.details.objectives.objectiveList.objectives[0].parents.empty);
    assert.ok(page.details.objectives.objectiveList.objectives[0].meshDescriptors.empty);
  });

  test('cancel new objective', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionObjectiveDetails: true,
    });
    assert.strictEqual(page.details.objectives.objectiveList.objectives.length, 1);
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].description.text,
      'session objective 0',
    );
    await page.details.objectives.createNew();
    await page.details.objectives.newObjective.description.set('junk');
    await page.details.objectives.newObjective.cancel();

    assert.strictEqual(page.details.objectives.objectiveList.objectives.length, 1);
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].description.text,
      'session objective 0',
    );
    assert.ok(page.details.objectives.objectiveList.objectives[0].parents.empty);
    assert.ok(page.details.objectives.objectiveList.objectives[0].meshDescriptors.empty);
  });

  test('empty objective title can not be created', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionObjectiveDetails: true,
    });
    assert.strictEqual(page.details.objectives.objectiveList.objectives.length, 1);
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].description.text,
      'session objective 0',
    );
    await page.details.objectives.createNew();
    assert.notOk(page.details.objectives.newObjective.description.hasError);
    await page.details.objectives.newObjective.description.set(
      '<p>&nbsp;</p><div></div><span>  </span>',
    );
    await page.details.objectives.newObjective.save();
    assert.ok(page.details.objectives.newObjective.description.hasError);
    assert.strictEqual(
      page.details.objectives.newObjective.description.error,
      'Description is too short (minimum is 3 characters)',
    );
  });
});
