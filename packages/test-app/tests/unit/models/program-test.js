import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { waitForResource } from 'ilios-common';

module('Unit | Model | Program', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');
  });

  test('hasCurriculumInventoryReports', async function (assert) {
    const program = this.store.createRecord('program');
    assert.notOk(program.hasCurriculumInventoryReports);
    this.store.createRecord('curriculum-inventory-report', { program });
    assert.ok(program.hasCurriculumInventoryReports);
  });

  test('hasProgramYears', async function (assert) {
    const program = this.store.createRecord('program');
    assert.notOk(program.hasProgramYears);
    this.store.createRecord('program-year', { program });
    assert.ok(program.hasProgramYears);
  });

  test('cohorts', async function (assert) {
    const program = this.store.createRecord('program');
    const cohort1 = this.store.createRecord('cohort');
    this.store.createRecord('program-year', {
      cohort: cohort1,
      program,
    });
    const cohort2 = this.store.createRecord('cohort');
    this.store.createRecord('program-year', {
      cohort: cohort2,
      program,
    });
    const cohorts = await waitForResource(program, 'cohorts');
    assert.strictEqual(cohorts.length, 2);
    assert.ok(cohorts.includes(cohort1));
    assert.ok(cohorts.includes(cohort2));
  });

  test('courses', async function (assert) {
    const program = this.store.createRecord('program');
    const course1 = this.store.createRecord('course');
    const course2 = this.store.createRecord('course');
    const course3 = this.store.createRecord('course');
    const cohort1 = this.store.createRecord('cohort', {
      courses: [course1, course2],
    });
    this.store.createRecord('program-year', {
      cohort: cohort1,
      program,
    });
    const cohort2 = this.store.createRecord('cohort', {
      courses: [course1, course3],
    });
    this.store.createRecord('program-year', {
      cohort: cohort2,
      program,
    });
    const courses = await waitForResource(program, 'courses');
    assert.strictEqual(courses.length, 3);
    assert.ok(courses.includes(course1));
    assert.ok(courses.includes(course2));
    assert.ok(courses.includes(course3));
  });
});
