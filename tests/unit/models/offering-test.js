import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { initialize } from '../../../initializers/replace-promise';
import moment from 'moment';

initialize();

module('Unit | Model | Offering', function(hooks) {
  setupTest(hooks);

  test('check allInstructors', async function(assert) {
    assert.expect(8);
    let offering = run(() => this.owner.lookup('service:store').createRecord('offering'));
    let store = this.owner.lookup('service:store');

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
  test('duration', function(assert) {
    let store = this.owner.lookup('service:store');
    let model = run(() => store.createRecord('offering', {}));
    assert.equal(model.get('durationHours'), 0);
    assert.equal(model.get('durationMinutes'), 0);
    run(() => {
      model.set('startDate', moment().toDate());
      model.set('endDate', moment().add(90, 'minutes').toDate());
    });

    assert.equal(model.get('durationHours'), 1);
    assert.equal(model.get('durationMinutes'), 30);

    run(() => {
      model.set('startDate', moment().toDate());
      model.set('endDate', moment().add(30, 'minutes').toDate());
    });

    assert.equal(model.get('durationHours'), 0);
    assert.equal(model.get('durationMinutes'), 30);

    run(() => {
      model.set('startDate', moment().toDate());
      model.set('endDate', moment().add(60, 'minutes').toDate());
    });

    assert.equal(model.get('durationHours'), 1);
    assert.equal(model.get('durationMinutes'), 0);
  });

  test('check allLearners', async function(assert) {
    assert.expect(8);
    let offering = run(() => this.owner.lookup('service:store').createRecord('offering'));
    let store = this.owner.lookup('service:store');

    await run( async () => {
      const allLearners = await offering.get('allLearners');
      assert.equal(allLearners.length, 0);
    });

    await run( async () => {
      const user1 = store.createRecord('user');
      const user2 = store.createRecord('user');
      const user3 = store.createRecord('user');
      offering.get('learners').pushObject(user1);
      const learnerGroup1 = store.createRecord('learner-group', {users: [user2]});
      const learnerGroup2 = store.createRecord('learner-group', {users: [user3]});
      offering.get('learnerGroups').pushObjects([learnerGroup1, learnerGroup2]);

      const allLearners = await offering.get('allLearners');

      assert.equal(allLearners.length, 3);
      assert.ok(allLearners.includes(user1));
      assert.ok(allLearners.includes(user2));
      assert.ok(allLearners.includes(user3));
    });

    await run( async () => {
      const user4 = store.createRecord('user');
      const user5 = store.createRecord('user');
      offering.get('learners').pushObject(user4);
      const learnerGroup3 = store.createRecord('learner-group', {users: [user5]});
      offering.get('learnerGroups').pushObject(learnerGroup3);

      const allLearners = await offering.get('allLearners');

      assert.equal(allLearners.length, 5);
      assert.ok(allLearners.includes(user4));
      assert.ok(allLearners.includes(user5));
    });
  });
});
