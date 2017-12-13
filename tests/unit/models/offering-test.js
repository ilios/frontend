import { run } from '@ember/runloop';
import { moduleForModel, test } from 'ember-qunit';
import modelList from '../../helpers/model-list';
import { initialize } from '../../../initializers/replace-promise';

initialize();

moduleForModel('offering', 'Unit | Model | Offering', {
  needs: modelList
});

test('check allInstructors', async function(assert) {
  assert.expect(8);
  let offering = this.subject();
  let store = this.store();

  await run( async () => {
    const allInstructors = await offering.get('allInstructors');
    assert.equal(allInstructors.length, 0);
  });

  await run( async () => {
    const user1 = store.createRecord('user');
    const user2 = store.createRecord('user');
    const user3 = store.createRecord('user');
    offering.get('instructors').pushObject(user1);
    const instructorGroup1 = store.createRecord('instructor-group', {users: [user2]});
    const instructorGroup2 = store.createRecord('instructor-group', {users: [user3]});
    offering.get('instructorGroups').pushObjects([instructorGroup1, instructorGroup2]);

    const allInstructors = await offering.get('allInstructors');

    assert.equal(allInstructors.length, 3);
    assert.ok(allInstructors.includes(user1));
    assert.ok(allInstructors.includes(user2));
    assert.ok(allInstructors.includes(user3));
  });

  await run( async () => {
    const user4 = store.createRecord('user');
    const user5 = store.createRecord('user');
    offering.get('instructors').pushObject(user4);
    const instructorGroup3 = store.createRecord('instructor-group', {users: [user5]});
    offering.get('instructorGroups').pushObject(instructorGroup3);

    const allInstructors = await offering.get('allInstructors');

    assert.equal(allInstructors.length, 5);
    assert.ok(allInstructors.includes(user4));
    assert.ok(allInstructors.includes(user5));
  });
});
