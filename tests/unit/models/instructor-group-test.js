import {
  moduleForModel,
  test
} from 'ember-qunit';
import Ember from 'ember';

moduleForModel('instructor-group', 'InstructorGroup', {
  // Specify the other units that are required for this test.
  needs: [
    'model:school',
    'model:user',
    'model:program',
    'model:program-year',
    'model:offering',
    'model:session',
    'model:course',
    'model:cohort',
    'model:objective',
    'model:learner-group',
    'model:competency',
    'model:mesh-descriptor',
  ]
});

test('it exists', function() {
  var model = this.subject();
  // var store = this.store();
  ok(!!model);
});

test('list courses', function() {
  expect(3);
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
    equal(courses.length, 2);
    equal(courses.objectAt(0).get('title'), 'course1');
    equal(courses.objectAt(1).get('title'), 'course2');
  });

});
