import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | Program', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('program'));
    // let store = this.store();
    assert.ok(!!model);
  });

  test('hasCurriculumInventoryReports', function(assert){
    assert.expect(2);
    const model = run(() => this.owner.lookup('service:store').createRecord('program'));
    const store = this.owner.lookup('service:store');
    run(() => {
      assert.notOk(model.get('hasCurriculumInventoryReports'));
      const report = store.createRecord('curriculum-inventory-report', { id: 1 });
      model.get('curriculumInventoryReports').pushObject(report);
      assert.ok(model.get('hasCurriculumInventoryReports'));
    });
  });

  test('hasProgramYears', function(assert){
    assert.expect(2);
    const model = run(() => this.owner.lookup('service:store').createRecord('program'));
    const store = this.owner.lookup('service:store');
    run(() => {
      assert.notOk(model.get('hasProgramYears'));
      const report = store.createRecord('program-year', { id: 1 });
      model.get('programYears').pushObject(report);
      assert.ok(model.get('hasProgramYears'));
    });
  });

  test('cohorts', async function(assert){
    assert.expect(3);
    const model = run(() => this.owner.lookup('service:store').createRecord('program'));
    const store = this.owner.lookup('service:store');
    run( async () => {
      const cohort1 = store.createRecord('cohort', { id: 1 });
      const programYear1 = store.createRecord('program-year', { id: 1, cohort: cohort1 });
      const cohort2 = store.createRecord('cohort', { id: 2 });
      const programYear2 = store.createRecord('program-year', { id: 2, cohort: cohort2 });
      model.get('programYears').pushObjects([ programYear1, programYear2 ]);
      const cohorts = await model.get('cohorts');
      assert.equal(cohorts.length, 2);
      assert.ok(cohorts.includes(cohort1));
      assert.ok(cohorts.includes(cohort2));
    });
  });

  test('courses', async function(assert){
    assert.expect(4);
    const model = run(() => this.owner.lookup('service:store').createRecord('program'));
    const store = this.owner.lookup('service:store');
    run( async () => {
      const course1 = store.createRecord('course', { id: 1 });
      const course2 = store.createRecord('course', { id: 2 });
      const course3 = store.createRecord('course', { id: 3 });
      const cohort1 = store.createRecord('cohort', { id: 1, courses: [ course1, course2 ] });
      const programYear1 = store.createRecord('program-year', { id: 1, cohort: cohort1 });
      const cohort2 = store.createRecord('cohort', { id: 2, courses: [ course1, course3 ]});
      const programYear2 = store.createRecord('program-year', { id: 2, cohort: cohort2 });
      model.get('programYears').pushObjects([ programYear1, programYear2 ]);
      const courses = await model.get('courses');
      assert.equal(courses.length, 3);
      assert.ok(courses.includes(course1));
      assert.ok(courses.includes(course2));
      assert.ok(courses.includes(course3));
    });
  });

  //
  // @todo need to remove i18n from cohort model it blows up this test
  // test('check course count', function(assert) {
  //   assert.expect(2);
  //   let program = this.subject();
  //   let store = this.store();
  //
  //   Ember.run(() => {
  //     let py1 = store.createRecord('program-year');
  //     let py2 = store.createRecord('program-year');
  //     let cohort1 = store.createRecord('cohort', {programYear: py1});
  //     let cohort2 = store.createRecord('cohort', {programYear: py2});
  //     py1.set('cohort', cohort1);
  //     py2.set('cohort', cohort2);
  //     program.get('programYears').pushObjects([py1, py2]);
  //
  //     let course1 = store.createRecord('course', {cohort: cohort1});
  //     let course2 = store.createRecord('course', {cohort: cohort1});
  //     let course3 = store.createRecord('course', {cohort: cohort2});
  //     cohort1.get('courses').pushObjects([course1, course2]);
  //     cohort2.get('courses').pushObject(course3);
  //
  //
  //     assert.equal(program.get('courseCount'), 3);
  //
  //     let course4 = store.createRecord('course', {cohort: cohort2});
  //     cohort2.get('courses').pushObject(course4);
  //
  //     let py3 = store.createRecord('program-year');
  //     let cohort3 = store.createRecord('cohort', {programYear: py3});
  //     py3.set('cohort', cohort1);
  //     let course5 = store.createRecord('course', {cohort: cohort3});
  //     cohort3.get('courses').pushObject(course5);
  //     program.get('programYears').pushObject(py3);
  //
  //     assert.equal(program.get('courseCount'), 5);
  //   });
  // });
});
