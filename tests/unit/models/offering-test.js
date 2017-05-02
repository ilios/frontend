import {
  moduleForModel,
  test
} from 'ember-qunit';
import modelList from '../../helpers/model-list';

moduleForModel('offering', 'Unit | Model | Offering', {
  needs: modelList
});

test('it exists', function(assert) {
  var model = this.subject();
  // var store = this.store();
  assert.ok(!!model);
});

test('check allinstructors', function(assert) {
  assert.expect(11);
  let offering = this.subject();
  let store = this.store();

  return offering.get('allInstructors').then(users => {
    assert.equal(users.length, 0);

    let user1 = store.createRecord('user');
    let user2 = store.createRecord('user');
    let user3 = store.createRecord('user');
    offering.get('instructors').pushObject(user1);
    let instructorGroup1 = store.createRecord('instructor-group', {users: [user2]});
    let instructorGroup2 = store.createRecord('instructor-group', {users: [user3]});
    offering.get('instructorGroups').pushObjects([instructorGroup1, instructorGroup2]);

    return offering.get('allInstructors').then(allInstructors => {
      assert.equal(allInstructors.length, 3);
      assert.ok(allInstructors.includes(user1));
      assert.ok(allInstructors.includes(user2));
      assert.ok(allInstructors.includes(user3));
      let user4 = store.createRecord('user');
      let user5 = store.createRecord('user');
      offering.get('instructors').pushObject(user4);
      let instructorGroup3 = store.createRecord('instructor-group', {users: [user5]});
      offering.get('instructorGroups').pushObject(instructorGroup3);

      return offering.get('allInstructors').then(allInstructors2 => {
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
