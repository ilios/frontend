import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { DateTime } from 'luxon';
import { waitForResource } from 'ilios-common';

module('Unit | Model | Offering', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');
  });

  test('check allInstructors', async function (assert) {
    const offering = this.store.createRecord('offering');

    let allInstructors = await waitForResource(offering, 'allInstructors');

    assert.strictEqual(allInstructors.length, 0);

    const user1 = this.store.createRecord('user', {
      displayName: 'Beta',
      instructedOfferings: [offering],
    });
    const user2 = this.store.createRecord('user', { displayName: 'Alpha' });
    const user3 = this.store.createRecord('user', { displayName: 'Omega' });

    this.store.createRecord('instructor-group', { users: [user2], offerings: [offering] });
    this.store.createRecord('instructor-group', { users: [user3], offerings: [offering] });

    allInstructors = await waitForResource(offering, 'allInstructors');

    assert.strictEqual(allInstructors.length, 3);
    assert.ok(allInstructors.includes(user1));
    assert.ok(allInstructors.includes(user2));
    assert.ok(allInstructors.includes(user3));

    this.store.createRecord('user', {
      firstName: 'Larry',
      lastName: 'Lazy',
      instructedOfferings: [offering],
    });
    const user5 = this.store.createRecord('user', { displayName: 'Gamma' });
    this.store.createRecord('instructor-group', { users: [user5], offerings: [offering] });

    allInstructors = await waitForResource(offering, 'allInstructors');

    assert.strictEqual(allInstructors.length, 5);
    assert.strictEqual(allInstructors[0].fullName, 'Alpha');
    assert.strictEqual(allInstructors[1].fullName, 'Beta');
    assert.strictEqual(allInstructors[2].fullName, 'Gamma');
    assert.strictEqual(allInstructors[3].fullName, 'Larry Lazy');
    assert.strictEqual(allInstructors[4].fullName, 'Omega');
  });

  test('duration', function (assert) {
    const model = this.store.createRecord('offering');
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
    const offering = this.store.createRecord('offering');

    let allLearners = await waitForResource(offering, 'allLearners');
    assert.strictEqual(allLearners.length, 0);

    const user1 = this.store.createRecord('user', { displayName: 'Beta', offerings: [offering] });
    const user2 = this.store.createRecord('user', { displayName: 'Alpha' });
    const user3 = this.store.createRecord('user', { displayName: 'Omega' });

    this.store.createRecord('learner-group', { users: [user2], offerings: [offering] });
    this.store.createRecord('learner-group', { users: [user3], offerings: [offering] });

    allLearners = await waitForResource(offering, 'allLearners');

    assert.strictEqual(allLearners.length, 3);
    assert.ok(allLearners.includes(user1));
    assert.ok(allLearners.includes(user2));
    assert.ok(allLearners.includes(user3));

    this.store.createRecord('user', {
      firstName: 'Larry',
      lastName: 'Lazy',
      offerings: [offering],
    });

    const user5 = this.store.createRecord('user', { displayName: 'Gamma' });
    this.store.createRecord('learner-group', { users: [user5], offerings: [offering] });

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
    const offering = this.store.createRecord('offering', { startDate });
    const startDayOfYear = offering.startDayOfYear;
    assert.strictEqual(startDayOfYear, '351');
  });

  test('startYear', function (assert) {
    const startDate = new Date('December 17, 1995 03:24:00');
    const offering = this.store.createRecord('offering', { startDate });
    const startYear = offering.startYear;
    assert.strictEqual(startYear, '1995');
  });

  test('startTime', function (assert) {
    const startDate = new Date('December 17, 1995 03:24:00');
    const offering = this.store.createRecord('offering', { startDate });
    const startTime = offering.startTime;
    assert.strictEqual(startTime, '0324');
  });

  test('startYearAndDayOfYear', function (assert) {
    const startDate = new Date('December 17, 1995 03:24:00');
    const offering = this.store.createRecord('offering', { startDate });
    const startYearAndDayOfYear = offering.startYearAndDayOfYear;
    assert.strictEqual(startYearAndDayOfYear, '3511995');
  });

  test('endDayOfYear', function (assert) {
    const endDate = new Date('December 17, 1995 03:24:00');
    const offering = this.store.createRecord('offering', { endDate });
    const endDayOfYear = offering.endDayOfYear;
    assert.strictEqual(endDayOfYear, '351');
  });

  test('endYear', function (assert) {
    const endDate = new Date('December 17, 1995 03:24:00');
    const offering = this.store.createRecord('offering', { endDate });
    const endYear = offering.endYear;
    assert.strictEqual(endYear, '1995');
  });

  test('endTime', function (assert) {
    const endDate = new Date('December 17, 1995 03:24:00');
    const offering = this.store.createRecord('offering', { endDate });
    const endTime = offering.endTime;
    assert.strictEqual(endTime, '0324');
  });

  test('endYearAndDayOfYear', function (assert) {
    const endDate = new Date('December 17, 1995 03:24:00');
    const offering = this.store.createRecord('offering', { endDate });
    const endYearAndDayOfYear = offering.endYearAndDayOfYear;
    assert.strictEqual(endYearAndDayOfYear, '3511995');
  });

  test('getAllInstructors', async function (assert) {
    const instructor1 = this.store.createRecord('user');
    const instructor2 = this.store.createRecord('user');
    const instructor3 = this.store.createRecord('user');
    const instructor4 = this.store.createRecord('user');
    const instructorGroup1 = this.store.createRecord('instructor-group', {
      users: [instructor1, instructor2],
    });
    const instructorGroup2 = this.store.createRecord('instructor-group', {
      users: [instructor3],
    });
    const model = this.store.createRecord('offering', {
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
    const model = this.store.createRecord('offering');
    const allInstructors = await model.getAllInstructors();
    assert.strictEqual(allInstructors.length, 0);
  });
});
