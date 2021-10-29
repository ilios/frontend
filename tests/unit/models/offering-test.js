import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import moment from 'moment';

module('Unit | Model | Offering', function (hooks) {
  setupTest(hooks);

  test('check allInstructors', async function (assert) {
    assert.expect(11);
    const offering = this.owner.lookup('service:store').createRecord('offering');
    const store = this.owner.lookup('service:store');

    let allInstructors = await offering.get('allInstructors');
    assert.strictEqual(allInstructors.length, 0);

    const user1 = store.createRecord('user', { displayName: 'Beta' });
    const user2 = store.createRecord('user', { displayName: 'Alpha' });
    const user3 = store.createRecord('user', { displayName: 'Omega' });
    offering.get('instructors').pushObject(user1);
    const instructorGroup1 = store.createRecord('instructor-group', {
      users: [user2],
    });
    const instructorGroup2 = store.createRecord('instructor-group', {
      users: [user3],
    });
    offering.get('instructorGroups').pushObjects([instructorGroup1, instructorGroup2]);

    allInstructors = await offering.get('allInstructors');

    assert.strictEqual(allInstructors.length, 3);
    assert.ok(allInstructors.includes(user1));
    assert.ok(allInstructors.includes(user2));
    assert.ok(allInstructors.includes(user3));

    const user4 = store.createRecord('user', {
      firstName: 'Larry',
      lastName: 'Lazy',
    });
    const user5 = store.createRecord('user', { displayName: 'Gamma' });
    offering.get('instructors').pushObject(user4);
    const instructorGroup3 = store.createRecord('instructor-group', {
      users: [user5],
    });
    offering.get('instructorGroups').pushObject(instructorGroup3);

    allInstructors = await offering.get('allInstructors');

    assert.strictEqual(allInstructors.length, 5);
    assert.strictEqual(allInstructors[0].fullName, 'Alpha');
    assert.strictEqual(allInstructors[1].fullName, 'Beta');
    assert.strictEqual(allInstructors[2].fullName, 'Gamma');
    assert.strictEqual(allInstructors[3].fullName, 'Larry Lazy');
    assert.strictEqual(allInstructors[4].fullName, 'Omega');
  });

  test('duration', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('offering', {});
    assert.strictEqual(model.get('durationHours'), 0);
    assert.strictEqual(model.get('durationMinutes'), 0);
    model.set('startDate', moment().toDate());
    model.set('endDate', moment().add(90, 'minutes').toDate());

    assert.strictEqual(model.get('durationHours'), 1);
    assert.strictEqual(model.get('durationMinutes'), 30);

    model.set('startDate', moment().toDate());
    model.set('endDate', moment().add(30, 'minutes').toDate());

    assert.strictEqual(model.get('durationHours'), 0);
    assert.strictEqual(model.get('durationMinutes'), 30);

    model.set('startDate', moment().toDate());
    model.set('endDate', moment().add(60, 'minutes').toDate());

    assert.strictEqual(model.get('durationHours'), 1);
    assert.strictEqual(model.get('durationMinutes'), 0);
  });

  test('check allLearners', async function (assert) {
    assert.expect(11);
    const offering = this.owner.lookup('service:store').createRecord('offering');
    const store = this.owner.lookup('service:store');

    let allLearners = await offering.get('allLearners');
    assert.strictEqual(allLearners.length, 0);

    const user1 = store.createRecord('user', { displayName: 'Beta' });
    const user2 = store.createRecord('user', { displayName: 'Alpha' });
    const user3 = store.createRecord('user', { displayName: 'Omega' });
    offering.get('learners').pushObject(user1);
    const learnerGroup1 = store.createRecord('learner-group', {
      users: [user2],
    });
    const learnerGroup2 = store.createRecord('learner-group', {
      users: [user3],
    });
    offering.get('learnerGroups').pushObjects([learnerGroup1, learnerGroup2]);

    allLearners = await offering.get('allLearners');

    assert.strictEqual(allLearners.length, 3);
    assert.ok(allLearners.includes(user1));
    assert.ok(allLearners.includes(user2));
    assert.ok(allLearners.includes(user3));

    const user4 = store.createRecord('user', {
      firstName: 'Larry',
      lastName: 'Lazy',
    });
    const user5 = store.createRecord('user', { displayName: 'Gamma' });
    offering.get('learners').pushObject(user4);
    const learnerGroup3 = store.createRecord('learner-group', {
      users: [user5],
    });
    offering.get('learnerGroups').pushObject(learnerGroup3);

    allLearners = await offering.get('allLearners');

    assert.strictEqual(allLearners.length, 5);
    assert.strictEqual(allLearners[0].fullName, 'Alpha');
    assert.strictEqual(allLearners[1].fullName, 'Beta');
    assert.strictEqual(allLearners[2].fullName, 'Gamma');
    assert.strictEqual(allLearners[3].fullName, 'Larry Lazy');
    assert.strictEqual(allLearners[4].fullName, 'Omega');
  });
});
