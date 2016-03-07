import {
  moduleForModel,
  test
} from 'ember-qunit';
import {a as testgroup} from 'ilios/tests/helpers/test-groups';
import modelList from '../../helpers/model-list';
import Ember from 'ember';

moduleForModel('learner-group', 'Unit | Model | LearnerGroup' + testgroup, {
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

test('list available users', function(assert) {
  assert.expect(4);
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
      assert.equal(users.get('length'), 3);
      assert.ok(names.contains(2));
      assert.ok(names.contains(3));
      assert.ok(names.contains(4));
    });
  });
});

test('top level groups return false for the list of available users', function(assert) {
  assert.expect(1);
  var model = this.subject();
  var store = model.store;
  var newUsers = [];

  Ember.run(function(){
    for(var i = 0; i < 10; i++){
      newUsers[i] = store.createRecord('user', {firstName: i});
    }
  });

  Ember.run(function(){
    model.get('availableUsers').then(function(users){
      assert.ok(!users);
    });
  });
});

test('check allDescendantUsers', function(assert) {
  assert.expect(11);
  let learnerGroup = this.subject();
  let store = this.store();

  return learnerGroup.get('allDescendantUsers').then(users => {
    assert.equal(users.length, 0);

    let user1 = store.createRecord('user');
    let user2 = store.createRecord('user');
    let user3 = store.createRecord('user');
    learnerGroup.get('users').pushObject(user1);
    let subGroup1 = store.createRecord('learner-group', {users: [user2]});
    let subGroup2 = store.createRecord('learner-group', {users: [user3]});
    learnerGroup.get('children').pushObjects([subGroup1, subGroup2]);

    return learnerGroup.get('allDescendantUsers').then(users => {
      assert.equal(users.length, 3);
      assert.ok(users.contains(user1));
      assert.ok(users.contains(user2));
      assert.ok(users.contains(user3));
      let user4 = store.createRecord('user');
      let user5 = store.createRecord('user');
      learnerGroup.get('users').pushObject(user4);
      let subGroup3 = store.createRecord('learner-group', {users: [user5]});
      learnerGroup.get('children').pushObject(subGroup3);

      return learnerGroup.get('allDescendantUsers').then(users => {
        assert.equal(users.length, 5);
        assert.ok(users.contains(user1));
        assert.ok(users.contains(user2));
        assert.ok(users.contains(user3));
        assert.ok(users.contains(user4));
        assert.ok(users.contains(user5));
      });

    });
  });
});

test('check allDescendants', function(assert) {
  assert.expect(11);
  let learnerGroup = this.subject();
  let store = this.store();

  return learnerGroup.get('allDescendants').then(groups => {
    assert.equal(groups.length, 0);

    let subGroup1 = store.createRecord('learner-group', {parent: learnerGroup});
    let subGroup2 = store.createRecord('learner-group', {parent: subGroup1});
    let subGroup3 = store.createRecord('learner-group', {parent: subGroup2});

    return learnerGroup.get('allDescendants').then(groups => {
      assert.equal(groups.length, 3);
      assert.ok(groups.contains(subGroup1));
      assert.ok(groups.contains(subGroup2));
      assert.ok(groups.contains(subGroup3));

      let subGroup4 = store.createRecord('learner-group');
      learnerGroup.get('children').pushObject(subGroup4);
      let subGroup5 = store.createRecord('learner-group');
      subGroup3.get('children').pushObject(subGroup5);

      return learnerGroup.get('allDescendants').then(groups => {
        assert.equal(groups.length, 5);
        assert.ok(groups.contains(subGroup1));
        assert.ok(groups.contains(subGroup2));
        assert.ok(groups.contains(subGroup3));
        assert.ok(groups.contains(subGroup4));
        assert.ok(groups.contains(subGroup5));
      });

    });
  });
});
