import {
  moduleForModel,
  test
} from 'ember-qunit';
import modelList from '../../helpers/model-list';
// import Ember from 'ember';

moduleForModel('program', 'Unit | Model | Program', {
  needs: modelList
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
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
