import {
  moduleForModel,
  test
} from 'ember-qunit';
import Ember from 'ember';

moduleForModel('learner-group', 'LearnerGroup', {
  // Specify the other units that are required for this test.
  needs: [
    'model:cohort',
    'model:user',
    'model:instructor-group',
    'model:offering',
    'model:program-year',
    'model:course',
    'model:school',
    'model:session',
    'model:program',
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
    model.get('courses').then(function(courses){
      equal(courses.length, 2);
      equal(courses.objectAt(0).get('title'), 'course1');
      equal(courses.objectAt(1).get('title'), 'course2');
    });
  });
});

test('list available users', function() {
  expect(6);
  var model = this.subject();
  var store = model.store;
  Ember.run(function(){
    var parent = store.createRecord('learner-group', {title:'parent'});
    model.set('parent', parent);
    parent.get('users').then(function(users){
      for(var i = 0; i < 5; i++){
        users.pushObject(store.createRecord('user', {firstName: i}));
      }
    });
    for(var i = 10; i < 25; i++){
      store.createRecord('user', {firstName: i});
    }
  });

  Ember.run(function(){
    model.get('availableUsers').then(function(users){
      equal(users.get('length'), 5);
      for(var i = 0; i < 5; i++){
        equal(users.objectAt(i).get('firstName'), i);
      }
    });
  });
});
