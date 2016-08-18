import {
  moduleForModel,
  test
} from 'ember-qunit';
import Ember from 'ember';
import modelList from '../../helpers/model-list';

moduleForModel('instructor-group', 'Unit | Model | InstructorGroup', {
  needs: modelList
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
    model.get('courses').then(function(courses){
      assert.equal(courses.length, 2);
      assert.equal(courses.objectAt(0).get('title'), 'course1');
      assert.equal(courses.objectAt(1).get('title'), 'course2');
    });
  });

});
