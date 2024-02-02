import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { waitForResource } from 'ilios-common';

module('Unit | Model | Program', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');
  });

  test('hasCurriculumInventoryReports', async function (assert) {
    const model = this.store.createRecord('program', { id: 1 });
    assert.notOk(model.hasCurriculumInventoryReports);
    const report = this.store.createRecord('curriculum-inventory-report', {
      id: 1,
      program: model,
    });
    (await model.curriculumInventoryReports).push(report);
    assert.ok(model.hasCurriculumInventoryReports);
  });

  test('hasProgramYears', async function (assert) {
    const model = this.store.createRecord('program', { id: 1 });
    assert.notOk(model.hasProgramYears);
    const programYear = this.store.createRecord('program-year', { id: 1, program: model });
    (await model.programYears).push(programYear);
    assert.ok(model.hasProgramYears);
  });

  test('cohorts', async function (assert) {
    const model = this.store.createRecord('program');
    const cohort1 = this.store.createRecord('cohort');
    const programYear1 = this.store.createRecord('program-year', {
      cohort: cohort1,
    });
    const cohort2 = this.store.createRecord('cohort');
    const programYear2 = this.store.createRecord('program-year', {
      cohort: cohort2,
    });
    (await model.programYears).push(programYear1, programYear2);
    const cohorts = await waitForResource(model, 'cohorts');
    assert.strictEqual(cohorts.length, 2);
    assert.ok(cohorts.includes(cohort1));
    assert.ok(cohorts.includes(cohort2));
  });

  test('courses', async function (assert) {
    const model = this.store.createRecord('program');
    const course1 = this.store.createRecord('course');
    const course2 = this.store.createRecord('course');
    const course3 = this.store.createRecord('course');
    const cohort1 = this.store.createRecord('cohort', {
      courses: [course1, course2],
    });
    this.store.createRecord('program-year', {
      cohort: cohort1,
      program: model,
    });
    const cohort2 = this.store.createRecord('cohort', {
      courses: [course1, course3],
    });
    this.store.createRecord('program-year', {
      cohort: cohort2,
      program: model,
    });
    const courses = await waitForResource(model, 'courses');
    assert.strictEqual(courses.length, 3);
    assert.ok(courses.includes(course1));
    assert.ok(courses.includes(course2));
    assert.ok(courses.includes(course3));
  });
});
