import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import page from 'ilios-common/page-objects/course';
module('Acceptance | Course - Objective Create', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.user = await setupAuthentication();
    this.school = this.server.create('school');
    this.server.create('academicYear', { id: 2013 });
    this.server.createList('program', 2);
    this.server.createList('programYear', 2);
    this.server.createList('cohort', 2);
  });

  test('save new objective', async function (assert) {
    const course = this.server.create('course', {
      year: 2013,
      school: this.school,
    });
    this.server.create('course-objective', { course });
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(9);
    const newObjectiveDescription = 'Test junk 123';

    await page.visit({
      courseId: 1,
      details: true,
      courseObjectiveDetails: true,
    });
    assert.strictEqual(page.objectives.objectiveList.objectives.length, 1);
    assert.strictEqual(
      page.objectives.objectiveList.objectives[0].description.text,
      'course objective 0'
    );
    await page.objectives.createNew();
    await page.objectives.newObjective.description(newObjectiveDescription);
    await page.objectives.newObjective.save();

    assert.strictEqual(page.objectives.objectiveList.objectives.length, 2);
    assert.strictEqual(
      page.objectives.objectiveList.objectives[0].description.text,
      'course objective 0'
    );
    assert.ok(page.objectives.objectiveList.objectives[0].parents.empty);
    assert.ok(page.objectives.objectiveList.objectives[0].meshDescriptors.empty);
    assert.strictEqual(
      page.objectives.objectiveList.objectives[1].description.text,
      newObjectiveDescription
    );
    assert.ok(page.objectives.objectiveList.objectives[1].parents.empty);
    assert.ok(page.objectives.objectiveList.objectives[1].meshDescriptors.empty);
  });

  test('cancel new objective', async function (assert) {
    const course = this.server.create('course', {
      year: 2013,
      school: this.school,
    });
    this.server.create('course-objective', { course });
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(6);
    await page.visit({
      courseId: 1,
      details: true,
      courseObjectiveDetails: true,
    });
    assert.strictEqual(page.objectives.objectiveList.objectives.length, 1);
    assert.strictEqual(
      page.objectives.objectiveList.objectives[0].description.text,
      'course objective 0'
    );
    await page.objectives.createNew();
    await page.objectives.newObjective.description('junk');
    await page.objectives.newObjective.cancel();

    assert.strictEqual(page.objectives.objectiveList.objectives.length, 1);
    assert.strictEqual(
      page.objectives.objectiveList.objectives[0].description.text,
      'course objective 0'
    );
    assert.ok(page.objectives.objectiveList.objectives[0].parents.empty);
    assert.ok(page.objectives.objectiveList.objectives[0].meshDescriptors.empty);
  });

  test('empty objective title can not be created', async function (assert) {
    const course = this.server.create('course', {
      year: 2013,
      school: this.school,
    });
    this.server.create('course-objective', { course });
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(5);
    await page.visit({
      courseId: 1,
      details: true,
      courseObjectiveDetails: true,
    });
    assert.strictEqual(page.objectives.objectiveList.objectives.length, 1);
    assert.strictEqual(
      page.objectives.objectiveList.objectives[0].description.text,
      'course objective 0'
    );
    await page.objectives.createNew();
    assert.notOk(page.objectives.newObjective.hasValidationError);
    await page.objectives.newObjective.description('<p>&nbsp</p><div></div><span>  </span>');
    await page.objectives.newObjective.save();
    assert.ok(page.objectives.newObjective.hasValidationError);
    assert.strictEqual(page.objectives.newObjective.validationError, 'This field can not be blank');
  });

  test('create objective in empty course', async function (assert) {
    this.server.create('course', {
      year: 2013,
      school: this.school,
    });
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(5);
    const newObjectiveDescription = 'Test junk 123';

    await page.visit({
      courseId: 1,
      details: true,
      courseObjectiveDetails: true,
    });
    assert.strictEqual(page.objectives.objectiveList.objectives.length, 0);
    await page.objectives.createNew();
    await page.objectives.newObjective.description(newObjectiveDescription);
    await page.objectives.newObjective.save();

    assert.strictEqual(page.objectives.objectiveList.objectives.length, 1);
    assert.strictEqual(
      page.objectives.objectiveList.objectives[0].description.text,
      newObjectiveDescription
    );
    assert.ok(page.objectives.objectiveList.objectives[0].parents.empty);
    assert.ok(page.objectives.objectiveList.objectives[0].meshDescriptors.empty);
  });
});
