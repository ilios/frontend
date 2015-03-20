import {
  moduleForModel,
  test
} from 'ember-qunit';
import Ember from 'ember';

moduleForModel('instructor-group', 'InstructorGroup', {
  needs: [
    'model:aamc-method',
    'model:aamc-pcrs',
    'model:alert-change-type',
    'model:alert',
    'model:cohort',
    'model:competency',
    'model:course-learning-material',
    'model:course',
    'model:course-clerkship-type',
    'model:curriculum-inventory-academic-level',
    'model:curriculum-inventory-export',
    'model:curriculum-inventory-institution',
    'model:curriculum-inventory-report',
    'model:curriculum-inventory-sequence-block',
    'model:curriculum-inventory-sequence',
    'model:department',
    'model:discipline',
    'model:educational-year',
    'model:ilm-session',
    'model:instruction-hour',
    'model:instructor-group',
    'model:learner-group',
    'model:learning-material-status',
    'model:learning-material-user-role',
    'model:learning-material',
    'model:mesh-concept',
    'model:mesh-descriptor',
    'model:mesh-qualifier',
    'model:objective',
    'model:offering',
    'model:program-year',
    'model:program',
    'model:publish-event',
    'model:recurring-event',
    'model:report',
    'model:school',
    'model:session-description',
    'model:session-learning-material',
    'model:session-type',
    'model:session',
    'model:user-role',
    'model:user',
  ]
});

test('it exists', function(assert) {
  var model = this.subject();
  // var store = this.store();
  assert.ok(!!model);
});

test('list courses', function(assert) {
  assert.expect(3);
  var model = this.subject();
  var store = model.store;
  Ember.run(function(){

    var course1 = store.createRecord('course', {title:'course1'});
    var course2 = store.createRecord('course', {title:'course2'});
    var session1 = store.createRecord('session', {course: course1});
    var session2 = store.createRecord('session', {course: course1});
    var session3 = store.createRecord('session', {course: course2});
    model.get('offerings').then(function(offerings){
      offerings.pushObject(store.createRecord('offering', {session: session1}));
      offerings.pushObject(store.createRecord('offering', {session: session1}));
      offerings.pushObject(store.createRecord('offering', {session: session1}));
      offerings.pushObject(store.createRecord('offering', {session: session2}));
      offerings.pushObject(store.createRecord('offering', {session: session2}));
      offerings.pushObject(store.createRecord('offering', {session: session3}));
    });
  });

  Ember.run(function(){
    var courses = model.get('courses');
    assert.equal(courses.length, 2);
    assert.equal(courses.objectAt(0).get('title'), 'course1');
    assert.equal(courses.objectAt(1).get('title'), 'course2');
  });

});
