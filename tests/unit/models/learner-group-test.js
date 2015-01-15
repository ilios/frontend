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
    'model:objective',
    'model:competency',
    'model:mesh-descriptor',
    'model:cohort',
    'model:discipline',
    'model:learning-material',
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
  expect(4);
  var model = this.subject();
  var store = model.store;
  var newUsers = [];

  Ember.run(function(){
    var parent = store.createRecord('learner-group', {title:'parent'});
    model.set('parent', parent);
    for(var i = 0; i < 5; i++){
      newUsers[i] = store.createRecord('user', {firstName: i});
    }
    for(i = 10; i < 25; i++){
      store.createRecord('user', {firstName: i});
    }

    var sibling = store.createRecord('learner-group', {title:'sibling'});
    sibling.get('users').then(function(users){
      users.pushObject(newUsers[0]);
      users.pushObject(newUsers[1]);
    });
    parent.get('children').then(function(children){
      children.pushObject(sibling);
    });
    parent.get('users').then(function(users){
      for(var i = 0; i < 5; i++){
        users.pushObject(newUsers[i]);
      }
    });
  });

  Ember.run(function(){
    model.get('availableUsers').then(function(users){
      var names = users.mapBy('firstName');
      equal(users.get('length'), 3);
      ok(names.contains(2));
      ok(names.contains(3));
      ok(names.contains(4));
    });
  });
});
