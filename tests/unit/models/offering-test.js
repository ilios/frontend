import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { DateTime } from 'luxon';
import { waitForResource } from 'ilios-common';

module('Unit | Model | Offering', function (hooks) {
  setupTest(hooks);

  test('check allInstructors', async function (assert) {
    assert.expect(11);
    const offering = this.owner.lookup('service:store').createRecord('offering');
    const store = this.owner.lookup('service:store');

    let allInstructors = await waitForResource(offering, 'allInstructors');

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

    allInstructors = await waitForResource(offering, 'allInstructors');

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

    allInstructors = await waitForResource(offering, 'allInstructors');

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
    model.set('startDate', DateTime.now().toJSDate());
    model.set('endDate', DateTime.now().plus({ minutes: 90 }).toJSDate());

    assert.strictEqual(model.get('durationHours'), 1);
    assert.strictEqual(model.get('durationMinutes'), 30);

    model.set('startDate', DateTime.now().toJSDate());
    model.set('endDate', DateTime.now().plus({ minutes: 30 }).toJSDate());

    assert.strictEqual(model.get('durationHours'), 0);
    assert.strictEqual(model.get('durationMinutes'), 30);

    model.set('startDate', DateTime.now().toJSDate());
    model.set('endDate', DateTime.now().plus({ minutes: 60 }).toJSDate());

    assert.strictEqual(model.get('durationHours'), 1);
    assert.strictEqual(model.get('durationMinutes'), 0);
  });

  test('check allLearners', async function (assert) {
    assert.expect(11);
    const offering = this.owner.lookup('service:store').createRecord('offering');
    const store = this.owner.lookup('service:store');

    let allLearners = await waitForResource(offering, 'allLearners');
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

    allLearners = await waitForResource(offering, 'allLearners');

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

    allLearners = await waitForResource(offering, 'allLearners');

    assert.strictEqual(allLearners.length, 5);
    assert.strictEqual(allLearners[0].fullName, 'Alpha');
    assert.strictEqual(allLearners[1].fullName, 'Beta');
    assert.strictEqual(allLearners[2].fullName, 'Gamma');
    assert.strictEqual(allLearners[3].fullName, 'Larry Lazy');
    assert.strictEqual(allLearners[4].fullName, 'Omega');
  });

  test('startDayOfYear', function (assert) {
    const startDate = new Date('December 17, 1995 03:24:00');
    const offering = this.owner.lookup('service:store').createRecord('offering', { startDate });
    const startDayOfYear = offering.startDayOfYear;
    assert.strictEqual(startDayOfYear, '351');
  });

  test('startYear', function (assert) {
    const startDate = new Date('December 17, 1995 03:24:00');
    const offering = this.owner.lookup('service:store').createRecord('offering', { startDate });
    const startYear = offering.startYear;
    assert.strictEqual(startYear, '1995');
  });

  test('startTime', function (assert) {
    const startDate = new Date('December 17, 1995 03:24:00');
    const offering = this.owner.lookup('service:store').createRecord('offering', { startDate });
    const startTime = offering.startTime;
    assert.strictEqual(startTime, '0324');
  });

  test('startYearAndDayOfYear', function (assert) {
    const startDate = new Date('December 17, 1995 03:24:00');
    const offering = this.owner.lookup('service:store').createRecord('offering', { startDate });
    const startYearAndDayOfYear = offering.startYearAndDayOfYear;
    assert.strictEqual(startYearAndDayOfYear, '3511995');
  });

  test('endDayOfYear', function (assert) {
    const endDate = new Date('December 17, 1995 03:24:00');
    const offering = this.owner.lookup('service:store').createRecord('offering', { endDate });
    const endDayOfYear = offering.endDayOfYear;
    assert.strictEqual(endDayOfYear, '351');
  });

  test('endYear', function (assert) {
    const endDate = new Date('December 17, 1995 03:24:00');
    const offering = this.owner.lookup('service:store').createRecord('offering', { endDate });
    const endYear = offering.endYear;
    assert.strictEqual(endYear, '1995');
  });

  test('endTime', function (assert) {
    const endDate = new Date('December 17, 1995 03:24:00');
    const offering = this.owner.lookup('service:store').createRecord('offering', { endDate });
    const endTime = offering.endTime;
    assert.strictEqual(endTime, '0324');
  });

  test('endYearAndDayOfYear', function (assert) {
    const endDate = new Date('December 17, 1995 03:24:00');
    const offering = this.owner.lookup('service:store').createRecord('offering', { endDate });
    const endYearAndDayOfYear = offering.endYearAndDayOfYear;
    assert.strictEqual(endYearAndDayOfYear, '3511995');
  });

  test('getAllInstructors', async function (assert) {
    const store = this.owner.lookup('service:store');
    const instructor1 = store.createRecord('user');
    const instructor2 = store.createRecord('user');
    const instructor3 = store.createRecord('user');
    const instructor4 = store.createRecord('user');
    const instructorGroup1 = store.createRecord('instructorGroup', {
      users: [instructor1, instructor2],
    });
    const instructorGroup2 = store.createRecord('instructorGroup', {
      users: [instructor3],
    });
    const model = store.createRecord('offering', {
      instructorGroups: [instructorGroup1, instructorGroup2],
      instructors: [instructor1, instructor3, instructor4],
    });
    const allInstructors = await model.getAllInstructors();
    assert.strictEqual(allInstructors.length, 4);
    assert.ok(allInstructors.includes(instructor1));
    assert.ok(allInstructors.includes(instructor2));
    assert.ok(allInstructors.includes(instructor3));
    assert.ok(allInstructors.includes(instructor4));
  });

  test('getAllInstructors - no instructors', async function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('offering');
    const allInstructors = await model.getAllInstructors();
    assert.strictEqual(allInstructors.length, 0);
  });
});
