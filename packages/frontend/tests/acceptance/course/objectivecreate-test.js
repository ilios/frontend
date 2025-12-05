import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'frontend/tests/helpers';
import page from 'ilios-common/page-objects/course';

module('Acceptance | Course - Objective Create', function (hooks) {
  setupApplicationTest(hooks);
  hooks.beforeEach(async function () {
    this.school = await this.server.create('school');
    this.user = await setupAuthentication({ administeredSchools: [this.school] }, true);
    await this.server.create('academic-year', { id: 2013 });
    await this.server.createList('program', 2);
    await this.server.createList('programYear', 2);
    await this.server.createList('cohort', 2);
  });

  test('save new objective', async function (assert) {
    const course = await this.server.create('course', {
      year: 2013,
      school: this.school,
    });
    await this.server.create('course-objective', { course });
    const newObjectiveDescription = 'Test junk 123';

    await page.visit({
      courseId: course.id,
      details: true,
      courseObjectiveDetails: true,
    });
    assert.strictEqual(page.details.objectives.objectiveList.objectives.length, 1);
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].description.text,
      'course objective 0',
    );
    await page.details.objectives.createNew();
    await page.details.objectives.newObjective.description.set(newObjectiveDescription);
    await page.details.objectives.newObjective.save();

    assert.strictEqual(page.details.objectives.objectiveList.objectives.length, 2);
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].description.text,
      'course objective 0',
    );
    assert.ok(page.details.objectives.objectiveList.objectives[0].parents.empty);
    assert.ok(page.details.objectives.objectiveList.objectives[0].meshDescriptors.empty);
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[1].description.text,
      newObjectiveDescription,
    );
    assert.ok(page.details.objectives.objectiveList.objectives[1].parents.empty);
    assert.ok(page.details.objectives.objectiveList.objectives[1].meshDescriptors.empty);
  });

  test('cancel new objective', async function (assert) {
    const course = await this.server.create('course', {
      year: 2013,
      school: this.school,
    });
    await this.server.create('course-objective', { course });
    await page.visit({
      courseId: course.id,
      details: true,
      courseObjectiveDetails: true,
    });
    assert.strictEqual(page.details.objectives.objectiveList.objectives.length, 1);
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].description.text,
      'course objective 0',
    );
    await page.details.objectives.createNew();
    await page.details.objectives.newObjective.description.set('junk');
    await page.details.objectives.newObjective.cancel();

    assert.strictEqual(page.details.objectives.objectiveList.objectives.length, 1);
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].description.text,
      'course objective 0',
    );
    assert.ok(page.details.objectives.objectiveList.objectives[0].parents.empty);
    assert.ok(page.details.objectives.objectiveList.objectives[0].meshDescriptors.empty);
  });

  test('empty objective title can not be created', async function (assert) {
    const course = await this.server.create('course', {
      year: 2013,
      school: this.school,
    });
    await this.server.create('course-objective', { course });
    await page.visit({
      courseId: course.id,
      details: true,
      courseObjectiveDetails: true,
    });
    assert.strictEqual(page.details.objectives.objectiveList.objectives.length, 1);
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].description.text,
      'course objective 0',
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

  test('create objective in empty course', async function (assert) {
    const course = await this.server.create('course', {
      year: 2013,
      school: this.school,
    });

    const newObjectiveDescription = 'Test junk 123';

    await page.visit({
      courseId: course.id,
      details: true,
      courseObjectiveDetails: true,
    });
    assert.strictEqual(page.details.objectives.objectiveList.objectives.length, 0);
    await page.details.objectives.createNew();
    await page.details.objectives.newObjective.description.set(newObjectiveDescription);
    await page.details.objectives.newObjective.save();

    assert.strictEqual(page.details.objectives.objectiveList.objectives.length, 1);
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].description.text,
      newObjectiveDescription,
    );
    assert.ok(page.details.objectives.objectiveList.objectives[0].parents.empty);
    assert.ok(page.details.objectives.objectiveList.objectives[0].meshDescriptors.empty);
  });
});
