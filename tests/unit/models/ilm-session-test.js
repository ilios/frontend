import {
  moduleForModel,
  test
} from 'ember-qunit';
import modelList from '../../helpers/model-list';

moduleForModel('ilm-session', 'Unit | Model | IlmSession', {
  needs: modelList
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});

test('check allInstructors', function(assert) {
  assert.expect(8);
  let model = this.subject();
  let store = this.store();

  return model.get('allInstructors').then(instructors => {
    assert.equal(instructors.length, 0);

    let user1 = store.createRecord('user');
    let user2 = store.createRecord('user');
    let instructorGroup = store.createRecord('instructor-group');
    instructorGroup.get('users').pushObject(user2);
    model.get('instructors').pushObject(user1);
    model.get('instructorGroups').pushObject(instructorGroup);

    return model.get('allInstructors').then(allInstructors => {
      assert.equal(allInstructors.length, 2);
      assert.ok(allInstructors.includes(user1));
      assert.ok(allInstructors.includes(user2));

      return instructorGroup.get('users').then(users =>{
        let user3 = store.createRecord('user');
        users.pushObject(user3);
        return model.get('allInstructors').then(allInstructors2 => {
          assert.equal(allInstructors2.length, 3);
          assert.ok(allInstructors2.includes(user1));
          assert.ok(allInstructors2.includes(user2));
          assert.ok(allInstructors2.includes(user3));
        });
      });

    });
  });
});
