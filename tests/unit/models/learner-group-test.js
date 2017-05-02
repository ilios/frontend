import {
  moduleForModel,
  test
} from 'ember-qunit';
import modelList from '../../helpers/model-list';
import Ember from 'ember';

const { run } = Ember;

moduleForModel('learner-group', 'Unit | Model | LearnerGroup', {
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
  run(function(){

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

  run(function(){
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

  run(function(){
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

  run(function(){
    model.get('availableUsers').then(function(users){
      var names = users.mapBy('firstName');
      assert.equal(users.get('length'), 3);
      assert.ok(names.includes(2));
      assert.ok(names.includes(3));
      assert.ok(names.includes(4));
    });
  });
});

test('top level groups return false for the list of available users', function(assert) {
  assert.expect(1);
  var model = this.subject();
  var store = model.store;
  var newUsers = [];

  run(function(){
    for(var i = 0; i < 10; i++){
      newUsers[i] = store.createRecord('user', {firstName: i});
    }
  });

  run(function(){
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

    return learnerGroup.get('allDescendantUsers').then(allDescendantUsers => {
      assert.equal(allDescendantUsers.length, 3);
      assert.ok(allDescendantUsers.includes(user1));
      assert.ok(allDescendantUsers.includes(user2));
      assert.ok(allDescendantUsers.includes(user3));
      let user4 = store.createRecord('user');
      let user5 = store.createRecord('user');
      learnerGroup.get('users').pushObject(user4);
      let subGroup3 = store.createRecord('learner-group', {users: [user5]});
      learnerGroup.get('children').pushObject(subGroup3);

      return learnerGroup.get('allDescendantUsers').then(allDescendantUsers2 => {
        assert.equal(allDescendantUsers2.length, 5);
        assert.ok(allDescendantUsers2.includes(user1));
        assert.ok(allDescendantUsers2.includes(user2));
        assert.ok(allDescendantUsers2.includes(user3));
        assert.ok(allDescendantUsers2.includes(user4));
        assert.ok(allDescendantUsers2.includes(user5));
      });

    });
  });
});

test('check empty allDescendants', async function(assert) {
  assert.expect(1);
  let learnerGroup = this.subject();

  const groups = await learnerGroup.get('allDescendants');
  assert.equal(groups.length, 0);
});

test('check allDescendants', async function(assert) {
  assert.expect(5);
  let learnerGroup = this.subject();
  let store = this.store();

  run( async () => {
    let subGroup1 = store.createRecord('learner-group', {parent: learnerGroup});
    let subGroup2 = store.createRecord('learner-group', {parent: subGroup1});
    let subGroup3 = store.createRecord('learner-group', {parent: subGroup2});
    let subGroup4 = store.createRecord('learner-group', {parent: learnerGroup});

    const groups = await learnerGroup.get('allDescendants');
    assert.equal(groups.length, 4);
    assert.ok(groups.includes(subGroup1));
    assert.ok(groups.includes(subGroup2));
    assert.ok(groups.includes(subGroup3));
    assert.ok(groups.includes(subGroup4));
  });
});

test('check subgroupNumberingOffset', function(assert) {
  const groupTitle = 'Lorem Ipsum';
  let store = this.store();
  let learnerGroup = this.subject();
  assert.expect(3);
  run(() => {
    learnerGroup.set('title', groupTitle);
    learnerGroup.get('subgroupNumberingOffset').then((offset) => {
      assert.equal(offset, 1); // no subgroups. offset is 1.
      store.createRecord('learner-group', {parent: learnerGroup, title: groupTitle + ' 1' });
      store.createRecord('learner-group', {parent: learnerGroup, title: groupTitle + ' 3' });
      learnerGroup.get('subgroupNumberingOffset').then(subgroupNumberingOffset => {
        assert.equal(subgroupNumberingOffset, 4); // highest number is 3. 3 + 1 = 4. offset is 4.
        store.createRecord('learner-group', {parent: learnerGroup, title: 'not the parent title 4' });
        learnerGroup.get('subgroupNumberingOffset').then(subgroupNumberingOffset2 => {
          assert.equal(subgroupNumberingOffset2, 4); // subgroup with title-mismatch is ignored, offset is still 4.
        });
      });
    });
  });
});

test('check allinstructors', function(assert) {
  assert.expect(11);
  let learnerGroup = this.subject();
  let store = this.store();

  return learnerGroup.get('allInstructors').then(users => {
    assert.equal(users.length, 0);

    let user1 = store.createRecord('user');
    let user2 = store.createRecord('user');
    let user3 = store.createRecord('user');
    learnerGroup.get('instructors').pushObject(user1);
    let instructorGroup1 = store.createRecord('instructor-group', {users: [user2]});
    let instructorGroup2 = store.createRecord('instructor-group', {users: [user3]});
    learnerGroup.get('instructorGroups').pushObjects([instructorGroup1, instructorGroup2]);

    return learnerGroup.get('allInstructors').then(allInstructors => {
      assert.equal(allInstructors.length, 3);
      assert.ok(allInstructors.includes(user1));
      assert.ok(allInstructors.includes(user2));
      assert.ok(allInstructors.includes(user3));
      let user4 = store.createRecord('user');
      let user5 = store.createRecord('user');
      learnerGroup.get('instructors').pushObject(user4);
      let instructorGroup3 = store.createRecord('instructor-group', {users: [user5]});
      learnerGroup.get('instructorGroups').pushObject(instructorGroup3);

      return learnerGroup.get('allInstructors').then(allInstructors2 => {
        assert.equal(allInstructors2.length, 5);
        assert.ok(allInstructors2.includes(user1));
        assert.ok(allInstructors2.includes(user2));
        assert.ok(allInstructors2.includes(user3));
        assert.ok(allInstructors2.includes(user4));
        assert.ok(allInstructors2.includes(user5));
      });

    });
  });
});

test('check allParents', function(assert) {
  assert.expect(5);
  let learnerGroup = this.subject();
  let store = this.store();

  return learnerGroup.get('allParents').then(groups => {
    assert.equal(groups.length, 0);

    let subGroup1 = store.createRecord('learner-group', {parent: learnerGroup});
    let subGroup2 = store.createRecord('learner-group', {parent: subGroup1});
    let subGroup3 = store.createRecord('learner-group', {parent: subGroup2});

    return subGroup3.get('allParents').then(allParents => {
      assert.equal(allParents.length, 3);
      assert.equal(allParents[0], subGroup2);
      assert.equal(allParents[1], subGroup1);
      assert.equal(allParents[2], learnerGroup);
    });
  });
});

test('check filterTitle on top group', async function(assert) {
  assert.expect(2);
  let learnerGroup = this.subject();
  let store = this.store();

  run( async () => {

    learnerGroup.set('title', 'top group');

    let subGroup1 = store.createRecord('learner-group', {parent: learnerGroup, title: 'subGroup1'});
    let subGroup2 = store.createRecord('learner-group', {parent: subGroup1, title: 'subGroup2'});
    let subGroup3 = store.createRecord('learner-group', {parent: subGroup2, title: 'subGroup3'});
    let subGroup4 = store.createRecord('learner-group', {title: 'subGroup5'});
    subGroup3.get('children').pushObject(subGroup4);

    const groups = await learnerGroup.get('allDescendants');
    assert.equal(groups.length, 4);
    const filterTitle = await learnerGroup.get('filterTitle');
    assert.equal(filterTitle, 'subGroup1subGroup2subGroup3subGroup5top group');
  });
});

test('check filterTitle on sub group', function(assert) {
  assert.expect(2);
  let learnerGroup = this.subject();
  let store = this.store();

  run(() => {
    learnerGroup.set('title', 'top group');
    return learnerGroup.get('allDescendants').then(groups => {
      assert.equal(groups.length, 0);

      let subGroup1 = store.createRecord('learner-group', {parent: learnerGroup, title: 'subGroup1'});
      let subGroup2 = store.createRecord('learner-group', {parent: subGroup1, title: 'subGroup2'});
      store.createRecord('learner-group', {parent: subGroup2, title: 'subGroup3'});

      return subGroup2.get('filterTitle').then(filterTitle => {
        assert.equal(filterTitle, 'subGroup3subGroup1top groupsubGroup2');
      });
    });
  });

});

test('check sortTitle on top group', function(assert) {
  assert.expect(2);
  let learnerGroup = this.subject();
  let store = this.store();

  run(() => {
    learnerGroup.set('title', 'top group');
    return learnerGroup.get('allDescendants').then(groups => {
      assert.equal(groups.length, 0);

      store.createRecord('learner-group', {parent: learnerGroup, title: 'subGroup1'});

      let sortTitle = learnerGroup.get('sortTitle');
      assert.equal(sortTitle, 'topgroup');
    });
  });

});

test('check sortTitle on sub group', function(assert) {
  assert.expect(2);
  let learnerGroup = this.subject();
  let store = this.store();

  run(() => {
    learnerGroup.set('title', 'top group');
    return learnerGroup.get('allDescendants').then(groups => {
      assert.equal(groups.length, 0);

      let subGroup1 = store.createRecord('learner-group', {parent: learnerGroup, title: 'subGroup1'});
      let subGroup2 = store.createRecord('learner-group', {parent: subGroup1, title: 'subGroup2'});
      let subGroup3 = store.createRecord('learner-group', {parent: subGroup2, title: 'subGroup3'});

      let sortTitle = subGroup3.get('sortTitle');
      assert.equal(sortTitle, 'topgroupsubGroup1subGroup2subGroup3');
    });
  });

});

test('check removeUserFromGroupAndAllDescendants', function(assert) {
  assert.expect(7);
  let learnerGroup = this.subject();
  let store = this.store();

  return learnerGroup.get('allParents').then(groups => {
    assert.equal(groups.length, 0);

    let user1 = store.createRecord('user');

    let subGroup1 = store.createRecord('learner-group', {parent: learnerGroup, users: [user1]});
    let subGroup2 = store.createRecord('learner-group', {parent: subGroup1, users: [user1]});
    let subGroup3 = store.createRecord('learner-group', {parent: subGroup2, users: [user1]});
    let subGroup4 = store.createRecord('learner-group', {parent: subGroup1});

    return subGroup1.removeUserFromGroupAndAllDescendants(user1).then(groupsToRemove => {
      assert.equal(groupsToRemove.length, 3);
      assert.notOk(groupsToRemove.includes(learnerGroup));
      assert.ok(groupsToRemove.includes(subGroup1));
      assert.ok(groupsToRemove.includes(subGroup2));
      assert.ok(groupsToRemove.includes(subGroup3));
      assert.notOk(groupsToRemove.includes(subGroup4));
    });
  });
});

test('check addUserToGroupAndAllParents', function(assert) {
  assert.expect(7);
  let learnerGroup = this.subject();
  let store = this.store();

  return learnerGroup.get('allParents').then(groups => {
    assert.equal(groups.length, 0);

    let user1 = store.createRecord('user', {id: 1});

    let subGroup1 = store.createRecord('learner-group', {id: 1, parent: learnerGroup, users: [user1]});
    let subGroup2 = store.createRecord('learner-group', {id: 2, parent: subGroup1});
    let subGroup3 = store.createRecord('learner-group', {id: 3, parent: subGroup2});
    let subGroup4 = store.createRecord('learner-group', {id: 4, parent: subGroup1});

    return subGroup3.addUserToGroupAndAllParents(user1).then(groupsToAdd => {
      assert.equal(groupsToAdd.length, 3);
      assert.ok(groupsToAdd.includes(learnerGroup));
      assert.notOk(groupsToAdd.includes(subGroup1));
      assert.ok(groupsToAdd.includes(subGroup2));
      assert.ok(groupsToAdd.includes(subGroup3));
      assert.notOk(groupsToAdd.includes(subGroup4));
    });
  });
});


test('has no learners in group without learners and without subgroups', function(assert) {
  assert.expect(1);
  let learnerGroup = this.subject();
  run(() => {
    learnerGroup.get('hasLearnersInGroupOrSubgroups').then(hasLearners => {
      assert.notOk(hasLearners);
    });
  });
});

test('has learners in group with learners and but without learners in subgroups', function(assert) {
  assert.expect(1);
  let learnerGroup = this.subject();
  let store = this.store();
  run(() => {
    let learner = store.createRecord('user');
    learnerGroup.get('users').then(users => {
      users.pushObject(learner);
      learnerGroup.get('hasLearnersInGroupOrSubgroups').then(hasLearners => {
        assert.ok(hasLearners);
      });
    });
  });
});


test('has no learners with no learners in group nor in subgroups', function(assert) {
  assert.expect(1);
  let learnerGroup = this.subject();
  let store = this.store();
  run(() => {
    let subgroup = store.createRecord('learner-group', { id: 2, parent: learnerGroup });
    learnerGroup.get('children').then(subgroups => {
      subgroups.pushObject(subgroup);
      learnerGroup.get('hasLearnersInGroupOrSubgroups').then(hasLearners => {
        assert.notOk(hasLearners);
      });
    });
  });
});


test('has learners with no learners in group but with learners in subgroups', function(assert) {
  assert.expect(1);
  let learnerGroup = this.subject();
  let store = this.store();
  run(() => {
    let learner = store.createRecord('user', { id: 1 });
    let subgroup = store.createRecord('learner-group', { id: 2, users: [ learner ], parent: learnerGroup });
    learnerGroup.get('children').then(subgroups => {
      subgroups.pushObject(subgroup);
      learnerGroup.get('hasLearnersInGroupOrSubgroups').then(hasLearners => {
        assert.ok(hasLearners);
      });
    });
  });
});

test('has learners with learners in group and with learners in subgroups', function(assert) {
  assert.expect(1);
  let learnerGroup = this.subject();
  let store = this.store();
  run(() => {
    let learner = store.createRecord('user', { id: 1 });
    let learner2 = store.createRecord('user', { id: 2 });
    let subgroup = store.createRecord('learner-group', { id: 2, users: [ learner ], parent: learnerGroup });
    learnerGroup.get('children').then(subgroups => {
      subgroups.pushObject(subgroup);
      learnerGroup.get('users').then(learners => {
        learners.pushObject(learner2);
        learnerGroup.get('hasLearnersInGroupOrSubgroups').then(hasLearners => {
          assert.ok(hasLearners);
        });
      });
    });
  });
});
