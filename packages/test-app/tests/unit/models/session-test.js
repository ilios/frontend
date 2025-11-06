import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { DateTime } from 'luxon';
import { waitForResource } from 'ilios-common';

module('Unit | Model | Session', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');
  });

  test('check required publication items', async function (assert) {
    const session = this.store.createRecord('session');

    assert.strictEqual(session.get('requiredPublicationIssues').length, 2);
    session.set('title', 'nothing');
    assert.strictEqual(session.get('requiredPublicationIssues').length, 1);
    this.store.createRecord('offering', { session });
    assert.strictEqual(session.get('requiredPublicationIssues').length, 0);
  });

  test('check required ILM publication items', function (assert) {
    const session = this.store.createRecord('session');

    session.set('title', 'nothing');
    assert.strictEqual(session.get('requiredPublicationIssues').length, 1);
    this.store.createRecord('ilm-session', { session });
    assert.strictEqual(session.get('requiredPublicationIssues').length, 1);
  });

  test('check optional publication items', async function (assert) {
    const session = this.store.createRecord('session');

    assert.strictEqual(session.optionalPublicationIssues.length, 3);
    assert.deepEqual(session.optionalPublicationIssues, [
      'terms',
      'sessionObjectives',
      'meshDescriptors',
    ]);
    this.store.createRecord('term', { sessions: [session] });
    assert.strictEqual(session.optionalPublicationIssues.length, 2);
    assert.deepEqual(session.optionalPublicationIssues, ['sessionObjectives', 'meshDescriptors']);
    this.store.createRecord('session-objective', { session });
    assert.strictEqual(session.optionalPublicationIssues.length, 1);
    assert.deepEqual(session.optionalPublicationIssues, ['meshDescriptors']);
    this.store.createRecord('mesh-descriptor', { sessions: [session] });
    assert.strictEqual(session.optionalPublicationIssues.length, 0);
  });

  test('check empty associatedOfferingLearnerGroups', async function (assert) {
    const session = this.store.createRecord('session');
    const groups = await waitForResource(session, 'associatedOfferingLearnerGroups');
    assert.strictEqual(groups.length, 0);
  });

  test('check first level associatedOfferingLearnerGroups', async function (assert) {
    const session = this.store.createRecord('session');

    const learnerGroup1 = this.store.createRecord('learner-group');
    const learnerGroup2 = this.store.createRecord('learner-group');
    const learnerGroup3 = this.store.createRecord('learner-group');
    this.store.createRecord('offering', {
      learnerGroups: [learnerGroup1, learnerGroup2],
      session,
    });
    this.store.createRecord('offering', {
      learnerGroups: [learnerGroup3],
      session,
    });

    const groups = await waitForResource(session, 'associatedOfferingLearnerGroups');
    assert.strictEqual(groups.length, 3);
    assert.ok(groups.includes(learnerGroup1));
    assert.ok(groups.includes(learnerGroup2));
    assert.ok(groups.includes(learnerGroup3));
  });

  test('check multi level associatedOfferingLearnerGroups', async function (assert) {
    const session = this.store.createRecord('session');

    const learnerGroup1 = this.store.createRecord('learner-group');
    const learnerGroup2 = this.store.createRecord('learner-group');
    const learnerGroup3 = this.store.createRecord('learner-group');
    const learnerGroup4 = this.store.createRecord('learner-group');
    const learnerGroup5 = this.store.createRecord('learner-group');
    this.store.createRecord('offering', {
      learnerGroups: [learnerGroup1, learnerGroup2, learnerGroup5],
      session,
    });
    this.store.createRecord('offering', {
      learnerGroups: [learnerGroup3],
      session,
    });
    this.store.createRecord('offering', {
      learnerGroups: [learnerGroup4],
      session,
    });

    const groups = await waitForResource(session, 'associatedOfferingLearnerGroups');
    assert.strictEqual(groups.length, 5);
    assert.ok(groups.includes(learnerGroup1));
    assert.ok(groups.includes(learnerGroup2));
    assert.ok(groups.includes(learnerGroup3));
    assert.ok(groups.includes(learnerGroup4));
    assert.ok(groups.includes(learnerGroup5));
  });

  test('check empty associatedIlmLearnerGroups without ilm session', async function (assert) {
    const session = this.store.createRecord('session');

    const groups = await waitForResource(session, 'associatedIlmLearnerGroups');
    assert.strictEqual(groups.length, 0);
  });

  test('check empty associatedIlmLearnerGroups with ilm session', async function (assert) {
    const session = this.store.createRecord('session');

    this.store.createRecord('ilm-session', { session });
    const groups = await waitForResource(session, 'associatedIlmLearnerGroups');
    assert.deepEqual(groups.length, 0);
  });

  test('check associatedIlmLearnerGroups', async function (assert) {
    const session = this.store.createRecord('session');

    const learnerGroup1 = this.store.createRecord('learner-group');
    const learnerGroup2 = this.store.createRecord('learner-group');
    const learnerGroup3 = this.store.createRecord('learner-group');
    this.store.createRecord('ilm-session', {
      learnerGroups: [learnerGroup1, learnerGroup2, learnerGroup3],
      session,
    });

    const groups = await waitForResource(session, 'associatedIlmLearnerGroups');
    assert.strictEqual(groups.length, 3);
    assert.ok(groups.includes(learnerGroup1));
    assert.ok(groups.includes(learnerGroup2));
    assert.ok(groups.includes(learnerGroup3));
  });

  test('check empty associatedLearnerGroups', async function (assert) {
    const session = this.store.createRecord('session');
    const groups = await waitForResource(session, 'associatedLearnerGroups');
    assert.strictEqual(groups.length, 0);
  });

  test('check associatedLearnerGroups', async function (assert) {
    const session = this.store.createRecord('session');

    const learnerGroup1 = this.store.createRecord('learner-group');
    const learnerGroup2 = this.store.createRecord('learner-group');
    const learnerGroup3 = this.store.createRecord('learner-group');
    const learnerGroup4 = this.store.createRecord('learner-group');
    const learnerGroup5 = this.store.createRecord('learner-group');

    this.store.createRecord('ilm-session', {
      learnerGroups: [learnerGroup1, learnerGroup2, learnerGroup3, learnerGroup4],
      session,
    });
    this.store.createRecord('offering', {
      learnerGroups: [learnerGroup1, learnerGroup2, learnerGroup5],
      session,
    });
    this.store.createRecord('offering', {
      learnerGroups: [learnerGroup3],
      session,
    });

    const groups = await waitForResource(session, 'associatedLearnerGroups');
    assert.strictEqual(groups.length, 5);
    assert.ok(groups.includes(learnerGroup1));
    assert.ok(groups.includes(learnerGroup2));
    assert.ok(groups.includes(learnerGroup3));
    assert.ok(groups.includes(learnerGroup4));
    assert.ok(groups.includes(learnerGroup5));
  });

  test('check learner groups count', async function (assert) {
    const session = this.store.createRecord('session');

    const learnerGroup1 = this.store.createRecord('learner-group');
    const learnerGroup2 = this.store.createRecord('learner-group');
    const learnerGroup3 = this.store.createRecord('learner-group');
    const learnerGroup4 = this.store.createRecord('learner-group');
    const offering1 = this.store.createRecord('offering', {
      learnerGroups: [learnerGroup1, learnerGroup2],
      session,
    });
    this.store.createRecord('offering', {
      learnerGroups: [learnerGroup3],
      session,
    });

    this.store.createRecord('ilm-session', {
      id: '1',
      learnerGroups: [learnerGroup1, learnerGroup4],
      session,
    });

    assert.strictEqual(await waitForResource(session, 'learnerGroupCount'), 4);

    const learnerGroup5 = this.store.createRecord('learner-group');
    this.store.createRecord('offering', {
      learnerGroups: [learnerGroup5],
      session,
    });
    this.store.createRecord('learner-group', { offerings: [offering1] });

    assert.strictEqual(await waitForResource(session, 'learnerGroupCount'), 6);
  });

  test('isIndependentLearning', async function (assert) {
    const model = this.store.createRecord('session');

    assert.notOk(model.get('isIndependentLearning'));
    await this.store.createRecord('ilm-session', { session: model });
    assert.ok(await waitForResource(model, 'isIndependentLearning'));
  });

  test('associatedVocabularies', async function (assert) {
    const session = this.store.createRecord('session');

    const vocab1 = this.store.createRecord('vocabulary', { title: 'Zeppelin' });
    const vocab2 = this.store.createRecord('vocabulary', { title: 'Aardvark' });
    this.store.createRecord('term', { vocabulary: vocab1, sessions: [session] });
    this.store.createRecord('term', { vocabulary: vocab1, sessions: [session] });
    this.store.createRecord('term', { vocabulary: vocab2, sessions: [session] });
    const vocabularies = await waitForResource(session, 'associatedVocabularies');
    assert.strictEqual(vocabularies.length, 2);
    assert.strictEqual(vocabularies[0], vocab2);
    assert.strictEqual(vocabularies[1], vocab1);
  });

  test('termCount', async function (assert) {
    const subject = this.store.createRecord('session');

    assert.strictEqual(subject.termCount, 0);
    this.store.createRecord('term', { sessions: [subject] });
    this.store.createRecord('term', { sessions: [subject] });
    assert.strictEqual(subject.termCount, 2);
  });

  test('sortedSessionObjectives', async function (assert) {
    const session = this.store.createRecord('session');

    const sessionObjective1 = this.store.createRecord('session-objective', {
      id: '1',
      position: 10,
      session,
    });
    const sessionObjective2 = this.store.createRecord('session-objective', {
      id: '2',
      position: 5,
      session,
    });
    const sessionObjective3 = this.store.createRecord('session-objective', {
      id: '3',
      position: 5,
      session,
    });
    const sessionObjective4 = this.store.createRecord('session-objective', {
      id: '4',
      position: 0,
      session,
    });
    const sortedObjectives = await waitForResource(session, 'sortedSessionObjectives');
    assert.strictEqual(sortedObjectives.length, 4);
    assert.strictEqual(sortedObjectives[0], sessionObjective4);
    assert.strictEqual(sortedObjectives[1], sessionObjective3);
    assert.strictEqual(sortedObjectives[2], sessionObjective2);
    assert.strictEqual(sortedObjectives[3], sessionObjective1);
  });

  test('totalSumOfferingsDuration', async function (assert) {
    const session = this.store.createRecord('session');

    let total = await waitForResource(session, 'totalSumOfferingsDuration');

    assert.strictEqual(total, 0);

    this.store.createRecord('offering', {
      startDate: DateTime.fromObject({ year: 2017, month: 1, day: 1 }).toJSDate(),
      endDate: DateTime.fromObject({ year: 2017, month: 1, day: 2 }).toJSDate(),
      session,
    });
    this.store.createRecord('offering', {
      startDate: DateTime.fromObject({
        year: 2017,
        month: 1,
        day: 1,
        hour: 9,
        minute: 30,
        second: 0,
      }).toJSDate(),
      endDate: DateTime.fromObject({
        year: 2017,
        month: 1,
        day: 1,
        hour: 10,
        minute: 0,
        second: 0,
      }).toJSDate(),
      session,
    });
    total = await waitForResource(session, 'totalSumOfferingsDuration');
    assert.strictEqual(Number(total), 24.5);
  });

  test('maxSingleOfferingDuration', async function (assert) {
    const session = this.store.createRecord('session');

    let max = await waitForResource(session, 'maxSingleOfferingDuration');
    assert.strictEqual(max, 0);

    this.store.createRecord('offering', {
      startDate: DateTime.fromObject({ year: 2017, month: 1, day: 1 }).toJSDate(),
      endDate: DateTime.fromObject({ year: 2017, month: 1, day: 2 }).toJSDate(),
      session,
    });
    this.store.createRecord('offering', {
      startDate: DateTime.fromObject({
        year: 2017,
        month: 1,
        day: 1,
        hour: 9,
        minute: 30,
        second: 0,
      }).toJSDate(),
      endDate: DateTime.fromObject({
        year: 2017,
        month: 1,
        day: 1,
        hour: 10,
        minute: 0,
        second: 0,
      }).toJSDate(),
      session,
    });
    max = await waitForResource(session, 'maxSingleOfferingDuration');
    assert.strictEqual(Number(max), 24.0);
  });

  test('firstOfferingDate - no offerings, and no ILM', async function (assert) {
    const subject = this.store.createRecord('session');
    const firstDate = await waitForResource(subject, 'firstOfferingDate');
    assert.strictEqual(firstDate, null);
  });

  test('firstOfferingDate - ILM', async function (assert) {
    const session = this.store.createRecord('session');

    const ilm = this.store.createRecord('ilm-session', {
      dueDate: DateTime.fromObject({ year: 2015, month: 1, day: 1 }).toJSDate(),
      session,
    });

    const firstDate = await waitForResource(session, 'firstOfferingDate');
    assert.strictEqual(firstDate, ilm.get('dueDate'));
  });

  test('firstOfferingDate - offerings', async function (assert) {
    const session = this.store.createRecord('session');

    this.store.createRecord('offering', {
      startDate: DateTime.fromObject({ year: 2017, month: 1, day: 1 }).toJSDate(),
      session,
    });
    const offering2 = this.store.createRecord('offering', {
      startDate: DateTime.fromObject({ year: 2016, month: 1, day: 1 }).toJSDate(),
      session,
    });
    const firstDate = await waitForResource(session, 'firstOfferingDate');
    assert.strictEqual(offering2.get('startDate'), firstDate);
  });

  test('sortedOfferingsByDate', async function (assert) {
    const session = this.store.createRecord('session');

    const offering1 = this.store.createRecord('offering', {
      startDate: DateTime.fromObject({ year: 2017, month: 1, day: 1 }).toJSDate(),
      session,
    });
    const offering2 = this.store.createRecord('offering', {
      startDate: DateTime.fromObject({ year: 2016, month: 1, day: 1 }).toJSDate(),
      session,
    });
    const offering3 = this.store.createRecord('offering', {
      startDate: DateTime.fromObject({ year: 2015, month: 1, day: 1 }).toJSDate(),
      session,
    });
    this.store.createRecord('offering', { session });
    const sortedDates = await waitForResource(session, 'sortedOfferingsByDate');
    assert.strictEqual(sortedDates.length, 3);
    assert.strictEqual(sortedDates[0], offering3);
    assert.strictEqual(sortedDates[1], offering2);
    assert.strictEqual(sortedDates[2], offering1);
  });

  test('maxDuration with ILM', async function (assert) {
    const session = this.store.createRecord('session');

    this.store.createRecord('offering', {
      startDate: DateTime.fromObject({ year: 2017, month: 1, day: 1 }).toJSDate(),
      endDate: DateTime.fromObject({ year: 2017, month: 1, day: 2 })
        .plus({ minutes: 30 })
        .toJSDate(),
      session,
    });
    this.store.createRecord('offering', {
      startDate: DateTime.fromObject({
        year: 2017,
        month: 1,
        day: 1,
        hour: 9,
        minute: 30,
        second: 0,
      }).toJSDate(),
      endDate: DateTime.fromObject({
        year: 2017,
        month: 1,
        day: 1,
        hour: 10,
        minute: 0,
        second: 0,
      }).toJSDate(),
      session,
    });
    this.store.createRecord('ilm-session', { hours: 2.1, session });

    const max = await waitForResource(session, 'maxDuration');
    assert.strictEqual(Number(max), 26.6);
  });

  test('maxDuration without ILM', async function (assert) {
    const session = this.store.createRecord('session');

    this.store.createRecord('offering', {
      startDate: DateTime.fromObject({ year: 2017, month: 1, day: 1 }).toJSDate(),
      endDate: DateTime.fromObject({ year: 2017, month: 1, day: 2 }).toJSDate(),
      session,
    });
    this.store.createRecord('offering', {
      startDate: DateTime.fromObject({
        year: 2017,
        month: 1,
        day: 1,
        hour: 9,
        minute: 30,
        second: 0,
      }).toJSDate(),
      endDate: DateTime.fromObject({
        year: 2017,
        month: 1,
        day: 1,
        hour: 10,
        minute: 0,
        second: 0,
      }).toJSDate(),
      session,
    });

    const max = await waitForResource(session, 'maxDuration');
    assert.strictEqual(Number(max), 24.0);
  });

  test('maxDuration only ILM', async function (assert) {
    const session = this.store.createRecord('session');

    this.store.createRecord('ilm-session', { hours: 2, session });

    const max = await waitForResource(session, 'maxDuration');
    assert.strictEqual(Number(max), 2.0);
  });

  test('totalSumDuration with ILM', async function (assert) {
    const session = this.store.createRecord('session');

    this.store.createRecord('offering', {
      startDate: DateTime.fromObject({ year: 2017, month: 1, day: 1 }).toJSDate(),
      endDate: DateTime.fromObject({ year: 2017, month: 1, day: 2 })
        .plus({ minutes: 30 })
        .toJSDate(),
      session,
    });
    this.store.createRecord('offering', {
      startDate: DateTime.fromObject({
        year: 2017,
        month: 1,
        day: 1,
        hour: 9,
        minute: 30,
        second: 0,
      }).toJSDate(),
      endDate: DateTime.fromObject({
        year: 2017,
        month: 1,
        day: 1,
        hour: 10,
        minute: 0,
        second: 0,
      }).toJSDate(),
      session,
    });
    this.store.createRecord('ilm-session', { hours: 2.1, session });

    const total = await waitForResource(session, 'totalSumDuration');
    assert.strictEqual(Number(total), 27.1);
  });

  test('totalSumDuration without ILM', async function (assert) {
    const session = this.store.createRecord('session');

    this.store.createRecord('offering', {
      startDate: DateTime.fromObject({ year: 2017, month: 1, day: 1 }).toJSDate(),
      endDate: DateTime.fromObject({ year: 2017, month: 1, day: 2 }).toJSDate(),
      session,
    });
    this.store.createRecord('offering', {
      startDate: DateTime.fromObject({
        year: 2017,
        month: 1,
        day: 1,
        hour: 9,
        minute: 30,
        second: 0,
      }).toJSDate(),
      endDate: DateTime.fromObject({
        year: 2017,
        month: 1,
        day: 1,
        hour: 10,
        minute: 0,
        second: 0,
      }).toJSDate(),
      session,
    });

    const total = await waitForResource(session, 'totalSumDuration');
    assert.strictEqual(Number(total), 24.5);
  });

  test('totalSumDuration only ILM', async function (assert) {
    const session = this.store.createRecord('session');

    this.store.createRecord('ilm-session', { hours: 2, session });

    const total = await waitForResource(session, 'totalSumDuration');
    assert.strictEqual(Number(total), 2.0);
  });

  test('allInstructors gets offerings data', async function (assert) {
    const session = this.store.createRecord('session');

    const offering = this.store.createRecord('offering', { session });
    const instructorGroup = this.store.createRecord('instructor-group', {
      offerings: [offering],
    });
    const user1 = this.store.createRecord('user', {
      instructedOfferings: [offering],
    });
    const user2 = this.store.createRecord('user', {
      instructorGroups: [instructorGroup],
    });

    const allInstructors = await waitForResource(session, 'allInstructors');
    assert.strictEqual(allInstructors.length, 2);
    assert.ok(allInstructors.includes(user1));
    assert.ok(allInstructors.includes(user2));
  });

  test('allInstructors gets ilmSession data', async function (assert) {
    const session = this.store.createRecord('session');

    const ilmSession = this.store.createRecord('ilm-session', { session });
    const instructorGroup = this.store.createRecord('instructor-group', {
      ilmSessions: [ilmSession],
    });
    const user1 = this.store.createRecord('user', {
      instructorIlmSessions: [ilmSession],
    });
    const user2 = this.store.createRecord('user', {
      instructorGroups: [instructorGroup],
    });

    const allInstructors = await waitForResource(session, 'allInstructors');
    assert.strictEqual(allInstructors.length, 2);
    assert.ok(allInstructors.includes(user1));
    assert.ok(allInstructors.includes(user2));
  });

  test('text only empty description', async function (assert) {
    const subject = this.store.createRecord('session');
    assert.strictEqual(subject.textDescription, '');
  });

  test('test showUnlinkIcon shows when only some sessionObjectives are linked to courseObjectives', async function (assert) {
    const course = this.store.createRecord('course');
    const courseObjective = this.store.createRecord('course-objective', { course });
    const session = this.store.createRecord('session', { course });
    this.store.createRecord('session-objective', {
      session,
      courseObjectives: [courseObjective],
    });
    this.store.createRecord('session-objective', {
      session,
    });
    const showUnlinkIcon = await waitForResource(session, 'showUnlinkIcon');
    assert.ok(showUnlinkIcon);
  });

  test('test showUnlinkIcon shows when no sessionObjectives are linked to courseObjectives', async function (assert) {
    const course = this.store.createRecord('course');
    this.store.createRecord('course-objective', { course });
    const session = this.store.createRecord('session', { course });
    this.store.createRecord('session-objective', {
      session,
    });
    this.store.createRecord('session-objective', {
      session,
    });
    const showUnlinkIcon = await waitForResource(session, 'showUnlinkIcon');
    assert.ok(showUnlinkIcon);
  });

  test('test dont showUnlinkIcon when all session objectives are linked to course objectives', async function (assert) {
    const course = this.store.createRecord('course');
    const courseObjective1 = this.store.createRecord('course-objective', { course });
    const courseObjective2 = this.store.createRecord('course-objective', { course });
    const courseObjective3 = this.store.createRecord('course-objective', { course });
    const session = this.store.createRecord('session', { course });
    this.store.createRecord('session-objective', {
      session,
      courseObjectives: [courseObjective1],
    });
    this.store.createRecord('session-objective', {
      session,
      courseObjectives: [courseObjective2, courseObjective3],
    });
    const showUnlinkIcon = await waitForResource(session, 'showUnlinkIcon');
    assert.notOk(showUnlinkIcon);
  });

  test('getAllInstructors', async function (assert) {
    const instructor1 = this.store.createRecord('user');
    const instructor2 = this.store.createRecord('user');
    const instructor3 = this.store.createRecord('user');
    const instructor4 = this.store.createRecord('user');
    const instructor5 = this.store.createRecord('user');
    const instructor6 = this.store.createRecord('user');
    const instructor7 = this.store.createRecord('user');
    const instructor8 = this.store.createRecord('user');
    const instructor9 = this.store.createRecord('user');
    const instructorGroup1 = this.store.createRecord('instructor-group', {
      users: [instructor1, instructor2],
    });
    const instructorGroup2 = this.store.createRecord('instructor-group', {
      users: [instructor3],
    });
    const instructorGroup3 = this.store.createRecord('instructor-group', {
      users: [instructor4, instructor5],
    });
    const ilmSession = this.store.createRecord('ilm-session', {
      instructorGroups: [instructorGroup1],
      instructors: [instructor6, instructor1],
    });
    const offering1 = this.store.createRecord('offering', {
      instructorGroups: [instructorGroup2],
      instructors: [instructor7, instructor2],
    });
    const offering2 = this.store.createRecord('offering', {
      instructorGroups: [instructorGroup3],
      instructors: [instructor8, instructor9],
    });
    const model = this.store.createRecord('session', {
      ilmSession,
      offerings: [offering1, offering2],
    });

    const allInstructors = await model.getAllInstructors();
    assert.strictEqual(allInstructors.length, 9);
    assert.ok(allInstructors.includes(instructor1));
    assert.ok(allInstructors.includes(instructor2));
    assert.ok(allInstructors.includes(instructor3));
    assert.ok(allInstructors.includes(instructor4));
    assert.ok(allInstructors.includes(instructor5));
    assert.ok(allInstructors.includes(instructor6));
    assert.ok(allInstructors.includes(instructor7));
    assert.ok(allInstructors.includes(instructor8));
    assert.ok(allInstructors.includes(instructor9));
  });

  test('getTotalSumDuration with ILM', async function (assert) {
    const session = this.store.createRecord('session');

    this.store.createRecord('offering', {
      startDate: DateTime.fromObject({ year: 2017, month: 1, day: 1 }).toJSDate(),
      endDate: DateTime.fromObject({ year: 2017, month: 1, day: 2 })
        .plus({ minutes: 30 })
        .toJSDate(),
      session,
    });
    this.store.createRecord('offering', {
      startDate: DateTime.fromObject({
        year: 2017,
        month: 1,
        day: 1,
        hour: 9,
        minute: 30,
        second: 0,
      }).toJSDate(),
      endDate: DateTime.fromObject({
        year: 2017,
        month: 1,
        day: 1,
        hour: 10,
        minute: 0,
        second: 0,
      }).toJSDate(),
      session,
    });
    this.store.createRecord('ilm-session', { hours: 2.1, session });

    const total = await session.getTotalSumDuration();
    assert.strictEqual(Number(total), 27.1);
  });

  test('getTotalSumDuration without ILM', async function (assert) {
    const session = this.store.createRecord('session');

    this.store.createRecord('offering', {
      startDate: DateTime.fromObject({ year: 2017, month: 1, day: 1 }).toJSDate(),
      endDate: DateTime.fromObject({ year: 2017, month: 1, day: 2 }).toJSDate(),
      session,
    });
    this.store.createRecord('offering', {
      startDate: DateTime.fromObject({
        year: 2017,
        month: 1,
        day: 1,
        hour: 9,
        minute: 30,
        second: 0,
      }).toJSDate(),
      endDate: DateTime.fromObject({
        year: 2017,
        month: 1,
        day: 1,
        hour: 10,
        minute: 0,
        second: 0,
      }).toJSDate(),
      session,
    });

    const total = await session.getTotalSumDuration();
    assert.strictEqual(Number(total), 24.5);
  });

  test('getTotalSumDuration only ILM', async function (assert) {
    const session = this.store.createRecord('session');

    this.store.createRecord('ilm-session', { hours: 2, session });

    const total = await session.getTotalSumDuration();
    assert.strictEqual(Number(total), 2.0);
  });

  test('getTotalSumDurationByInstructor', async function (assert) {
    const instructor1 = this.store.createRecord('user', { id: '1' });
    const instructor2 = this.store.createRecord('user', { id: '2' });
    const instructor3 = this.store.createRecord('user', { id: '3' });
    const instructorGroup1 = this.store.createRecord('instructor-group', {
      users: [instructor1],
    });
    const ilmSession = this.store.createRecord('ilm-session', {
      hours: 1.5,
      instructorGroups: [instructorGroup1],
      instructors: [instructor2],
    });
    const offering1 = this.store.createRecord('offering', {
      startDate: DateTime.fromObject({
        year: 2017,
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
      }).toJSDate(),
      endDate: DateTime.fromObject({
        year: 2017,
        month: 1,
        day: 2,
        hour: 0,
        minute: 0,
        second: 0,
      }).toJSDate(),
      instructorGroups: [instructorGroup1],
    });
    const offering2 = this.store.createRecord('offering', {
      startDate: DateTime.fromObject({
        year: 2017,
        month: 1,
        day: 1,
        hour: 9,
        minute: 30,
        second: 0,
      }).toJSDate(),
      endDate: DateTime.fromObject({
        year: 2017,
        month: 1,
        day: 1,
        hour: 10,
        minute: 0,
        second: 0,
      }).toJSDate(),
      instructors: [instructor1, instructor2],
    });
    const subject = this.store.createRecord('session', {
      ilmSession,
      offerings: [offering1, offering2],
    });
    let total = await subject.getTotalSumDurationByInstructor(instructor1);
    assert.strictEqual(total, 1560);
    total = await subject.getTotalSumDurationByInstructor(instructor2);
    assert.strictEqual(total, 120);
    total = await subject.getTotalSumDurationByInstructor(instructor3);
    assert.strictEqual(total, 0);
  });

  test('getTotalSumOfferingsDurationByInstructor', async function (assert) {
    const instructor1 = this.store.createRecord('user', { id: '1' });
    const instructor2 = this.store.createRecord('user', { id: '2' });
    const instructor3 = this.store.createRecord('user', { id: '3' });
    const instructorGroup1 = this.store.createRecord('instructor-group', {
      users: [instructor1],
    });
    const offering1 = this.store.createRecord('offering', {
      startDate: DateTime.fromObject({
        year: 2017,
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
      }).toJSDate(),
      endDate: DateTime.fromObject({
        year: 2017,
        month: 1,
        day: 2,
        hour: 0,
        minute: 0,
        second: 0,
      }).toJSDate(),
      instructorGroups: [instructorGroup1],
    });
    const offering2 = this.store.createRecord('offering', {
      startDate: DateTime.fromObject({
        year: 2017,
        month: 1,
        day: 1,
        hour: 9,
        minute: 30,
        second: 0,
      }).toJSDate(),
      endDate: DateTime.fromObject({
        year: 2017,
        month: 1,
        day: 1,
        hour: 10,
        minute: 0,
        second: 0,
      }).toJSDate(),
      instructors: [instructor1, instructor2],
    });
    const subject = this.store.createRecord('session', {
      offerings: [offering1, offering2],
    });
    let total = await subject.getTotalSumOfferingsDurationByInstructor(instructor1);
    assert.strictEqual(total, 1470);
    total = await subject.getTotalSumOfferingsDurationByInstructor(instructor2);
    assert.strictEqual(total, 30);
    total = await subject.getTotalSumOfferingsDurationByInstructor(instructor3);
    assert.strictEqual(total, 0);
  });

  test('getTotalSumIlmDurationByInstructor', async function (assert) {
    const instructor1 = this.store.createRecord('user', { id: '1' });
    const instructor2 = this.store.createRecord('user', { id: '2' });
    const instructor3 = this.store.createRecord('user', { id: '3' });
    const instructorGroup1 = this.store.createRecord('instructor-group', {
      users: [instructor1],
    });
    const ilmSession = this.store.createRecord('ilm-session', {
      hours: 1.5,
      instructorGroups: [instructorGroup1],
      instructors: [instructor2],
    });
    const subject = this.store.createRecord('session', {
      ilmSession,
    });
    let total = await subject.getTotalSumIlmDurationByInstructor(instructor1);
    assert.strictEqual(total, 90);
    total = await subject.getTotalSumIlmDurationByInstructor(instructor2);
    assert.strictEqual(total, 90);
    total = await subject.getTotalSumIlmDurationByInstructor(instructor3);
    assert.strictEqual(total, 0);
  });

  test('offeringCount', async function (assert) {
    const session = this.store.createRecord('session');

    assert.strictEqual(session.offeringCount, 0);
    this.store.createRecord('offering', { session });
    this.store.createRecord('offering', { session });
    assert.strictEqual(session.offeringCount, 2);
  });

  test('objectiveCount', async function (assert) {
    const session = this.store.createRecord('session');

    assert.strictEqual(session.objectiveCount, 0);
    this.store.createRecord('session-objective', { session });
    this.store.createRecord('session-objective', { session });
    assert.strictEqual(session.objectiveCount, 2);
  });

  test('prerequisiteCount', async function (assert) {
    const session = this.store.createRecord('session');

    assert.strictEqual(session.prerequisiteCount, 0);
    this.store.createRecord('session', { postrequisite: session });
    this.store.createRecord('session', { postrequisite: session });
    assert.strictEqual(session.prerequisiteCount, 2);
  });

  test('sessionTitlesInCourse', async function (assert) {
    const course = this.store.createRecord('course');
    const fooSession = this.store.createRecord('session', { course, id: '1', title: 'Foo' });
    this.store.createRecord('session', { course, id: '2', title: 'Bar' });
    await waitForResource(course, '_sessionsData');
    await waitForResource(fooSession, '_courseData');
    let sessionTitlesInCourse = fooSession.sessionTitlesInCourse;
    assert.strictEqual([...sessionTitlesInCourse.keys()].length, 2);
    assert.ok(sessionTitlesInCourse.has('Bar'));
    assert.ok(sessionTitlesInCourse.has('Foo'));
    assert.strictEqual([...sessionTitlesInCourse.get('Foo').values()].length, 1);
    assert.strictEqual([...sessionTitlesInCourse.get('Foo').values()][0], fooSession.id);

    const fooSession2 = this.store.createRecord('session', { course, id: '3', title: 'Foo' });
    await waitForResource(course, '_sessionsData');
    await waitForResource(fooSession, '_courseData');
    sessionTitlesInCourse = fooSession.sessionTitlesInCourse;
    assert.strictEqual([...sessionTitlesInCourse.keys()].length, 2);
    assert.ok(sessionTitlesInCourse.has('Bar'));
    assert.ok(sessionTitlesInCourse.has('Foo'));
    assert.strictEqual([...sessionTitlesInCourse.get('Foo').values()].length, 2);
    assert.strictEqual([...sessionTitlesInCourse.get('Foo').values()][0], fooSession.id);
    assert.strictEqual([...sessionTitlesInCourse.get('Foo').values()][1], fooSession2.id);
  });

  test('uniqueTitleInCourse', async function (assert) {
    const course = this.store.createRecord('course');
    const session = this.store.createRecord('session', { course, id: '1', title: 'Foo' });
    await waitForResource(course, '_sessionsData');
    await waitForResource(session, '_courseData');
    assert.strictEqual(session.uniqueTitleInCourse, 'Foo');

    const session2 = this.store.createRecord('session', { course, id: '3', title: 'Foo' });
    await waitForResource(course, '_sessionsData');
    await waitForResource(session2, '_courseData');
    assert.strictEqual(session2.uniqueTitleInCourse, 'Foo, 2');

    // add another session but with a lower id than session2's.
    const session3 = this.store.createRecord('session', { course, id: '2', title: 'Foo' });
    await waitForResource(course, '_sessionsData');
    await waitForResource(session3, '_courseData');
    assert.strictEqual(session3.uniqueTitleInCourse, 'Foo, 2');

    // check session 2 again. its unique title incrementor should have shifted up.
    await waitForResource(course, '_sessionsData');
    await waitForResource(session2, '_courseData');
    assert.strictEqual(session2.uniqueTitleInCourse, 'Foo, 3');
  });
});
