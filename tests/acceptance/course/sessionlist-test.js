import { click, currentRouteName } from '@ember/test-helpers';
import moment from 'moment';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';

import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import page from 'ilios-common/page-objects/sessions';

moment.locale('en');
const today = moment().hour(8);
module('Acceptance | Course - Session List', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
    this.sessionType = this.server.create('sessionType', { school: this.school });

    const learner1 = this.server.create('user');
    const learner2 = this.server.create('user');
    const instructor1 = this.server.create('user');
    const instructor2 = this.server.create('user');
    const instructor3 = this.server.create('user');
    const learnerGroup1 = this.server.create('learnerGroup', { users: [ learner1, learner2 ] });
    const learnerGroup2 = this.server.create('learnerGroup');
    const instructorGroup = this.server.create('instructorGroup', { users: [ instructor1, instructor2, instructor3 ] });
    const course = this.course = this.server.create('course', {
      school: this.school,
      directorIds: [this.user.id]
    });
    this.session1 = this.server.create('session', {
      course,
      sessionType: this.sessionType,
      updatedAt: moment('2019-07-09 17:00:00').toDate()
    });
    this.session2 = this.server.create('session', {
      course,
      sessionType: this.sessionType,
    });
    this.session3 = this.server.create('session', {
      course,
      sessionType: this.sessionType,
      instructionalNotes: "They're good dogs Brent",
    });
    this.session4 = this.server.create('session', {
      course,
      sessionType: this.sessionType,
      prerequisites: [this.session2],
      title: 'session3\\'
    });
    this.server.create('offering', {
      session: this.session1,
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
      learners: [ learner1 ],
      learnerGroups: [ learnerGroup1, learnerGroup2 ],
      instructors: [ instructor1 ],
      instructorGroups: [ instructorGroup ]
    });
    this.server.create('offering', {
      session: this.session1,
      startDate: today.clone().add(1, 'day').add(1, 'hour').format(),
      endDate: today.clone().add(1, 'day').add(4, 'hour').format(),
    });
    this.server.create('offering', {
      session: this.session1,
      startDate: today.clone().add(2, 'days').format(),
      endDate: today.clone().add(3, 'days').add(1, 'hour').format(),
    });
  });

  test('session list', async function(assert) {
    await page.visit({ courseId: 1, details: true });
    const { sessions } = page.sessionsList;

    assert.equal(sessions.length, 4);
    assert.equal(sessions[0].title, 'session 0');
    assert.equal(sessions[0].type, 'session type 0');
    assert.equal(sessions[0].groupCount, '2');
    assert.equal(sessions[0].objectiveCount, '0');
    assert.equal(sessions[0].termCount, '0');
    assert.equal(sessions[0].firstOffering, today.toDate().toLocaleString('en', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }));
    assert.equal(sessions[0].offeringCount, '3');
    assert.notOk(sessions[0].hasInstructionalNotes);
    assert.notOk(sessions[0].hasPrerequisites);

    assert.equal(sessions[1].title, 'session 1');
    assert.equal(sessions[1].type, 'session type 0');
    assert.equal(sessions[1].groupCount, '0');
    assert.equal(sessions[1].objectiveCount, '0');
    assert.equal(sessions[1].termCount, '0');
    assert.equal(sessions[1].firstOffering, '');
    assert.equal(sessions[1].offeringCount, '0');
    assert.notOk(sessions[1].hasInstructionalNotes);
    assert.notOk(sessions[1].hasPrerequisites);

    assert.equal(sessions[2].title, 'session 2');
    assert.equal(sessions[2].type, 'session type 0');
    assert.equal(sessions[2].groupCount, '0');
    assert.equal(sessions[2].objectiveCount, '0');
    assert.equal(sessions[2].termCount, '0');
    assert.equal(sessions[2].firstOffering, '');
    assert.equal(sessions[2].offeringCount, '0');
    assert.ok(sessions[2].hasInstructionalNotes);
    assert.notOk(sessions[2].hasPrerequisites);

    assert.equal(sessions[3].title, 'session3\\');
    assert.equal(sessions[3].type, 'session type 0');
    assert.equal(sessions[3].groupCount, '0');
    assert.equal(sessions[3].objectiveCount, '0');
    assert.equal(sessions[3].termCount, '0');
    assert.equal(sessions[3].firstOffering, '');
    assert.equal(sessions[3].offeringCount, '0');
    assert.notOk(sessions[3].hasInstructionalNotes);
    assert.ok(sessions[3].hasPrerequisites);
  });

  test('expanded offering', async function (assert) {
    await page.visit({ courseId: 1, details: true });
    const { sessions } = page.sessionsList;

    assert.equal(sessions.length, 4);
    await sessions[0].expandCollapse();
    const { offerings } = sessions[0];


    const offering1StartDate = moment(this.server.db.offerings[0].startDate);
    const offering2StartDate = moment(this.server.db.offerings[1].startDate);
    const offering3StartDate = moment(this.server.db.offerings[2].startDate);

    assert.equal(offerings.dates.length, 3);

    assert.equal(offerings.dates[0].dayOfWeek, offering1StartDate.format('dddd'));
    assert.equal(offerings.dates[0].dayOfMonth, offering1StartDate.format('MMMM Do'));
    assert.equal(offerings.dates[1].dayOfWeek, offering2StartDate.format('dddd'));
    assert.equal(offerings.dates[1].dayOfMonth, offering2StartDate.format('MMMM Do'));
    assert.equal(offerings.dates[2].dayOfWeek, offering3StartDate.format('dddd'));
    assert.equal(offerings.dates[2].dayOfMonth, offering3StartDate.format('MMMM Do'));

    assert.equal(offerings.offerings.length, 3);
    assert.equal(offerings.offerings[0].startTime, offering1StartDate.format('LT'));
    assert.equal(offerings.offerings[0].location, 'room 0');
    assert.equal(offerings.offerings[0].learners, '(2) 1 guy M. Mc1son, 2 guy...');
    assert.equal(offerings.offerings[0].learnerGroups, '(2) learner group 0, learn...');
    assert.equal(offerings.offerings[0].instructors, '(3) 3 guy M. Mc3son, 4 guy...');

    assert.equal(offerings.offerings[1].startTime, offering2StartDate.format('LT'));
    assert.equal(offerings.offerings[1].location, 'room 1');
    assert.equal(offerings.offerings[1].learners, '');
    assert.equal(offerings.offerings[1].learnerGroups, '');
    assert.equal(offerings.offerings[1].instructors, '');

    assert.equal(offerings.offerings[2].startTime, offering3StartDate.format('LT'));
    assert.equal(offerings.offerings[2].location, 'room 2');
    assert.equal(offerings.offerings[2].learners, '');
    assert.equal(offerings.offerings[2].learnerGroups, '');
    assert.equal(offerings.offerings[2].instructors, '');
  });

  test('no offerings', async function(assert) {
    await page.visit({ courseId: 1, details: true });
    const { sessions } = page.sessionsList;

    assert.equal(sessions.length, 4);
    assert.ok(sessions[0].canExpand);
    assert.equal(sessions[1].expandTitle, 'This session has no offerings');
    assert.notOk(sessions[1].canExpand);
    assert.equal(sessions[2].expandTitle, 'This session has no offerings');
    assert.notOk(sessions[2].canExpand);
    assert.equal(sessions[3].expandTitle, 'This session has no offerings');
    assert.notOk(sessions[3].canExpand);
  });

  test('close offering details', async function (assert) {
    await page.visit({ courseId: 1, details: true });
    const { sessions, expandedSessions } = page.sessionsList;
    assert.equal(sessions.length, 4);
    assert.equal(expandedSessions.length, 0);
    await sessions[0].expandCollapse();
    assert.equal(expandedSessions.length, 1);
    await sessions[0].expandCollapse();
    assert.equal(expandedSessions.length, 0);
  });

  test('session last update timestamp visible in expanded mode', async function (assert) {
    assert.expect(1);
    await page.visit({ courseId: 1, details: true });
    const { sessions, expandedSessions } = page.sessionsList;
    await sessions[0].expandCollapse();
    assert.equal(expandedSessions[0].lastUpdated, 'Last Update Last Update: 07/09/2019 5:00 PM');
  });

  test('expand all sessions', async function (assert) {
    this.server.create('offering', { session: this.session2 });
    this.server.create('offering', { session: this.session3 });
    this.server.create('offering', { session: this.session4 });
    await page.visit({ courseId: 1, details: true });
    const { sessions, expandedSessions } = page.sessionsList;
    assert.equal(sessions.length, 4);
    assert.equal(expandedSessions.length, 0);
    assert.notOk(page.showsAllSessionsExpanded);
    await page.expandCollapseAllSessions();
    assert.equal(expandedSessions.length, 4);
    assert.ok(page.showsAllSessionsExpanded);
    await page.expandCollapseAllSessions();
    assert.equal(expandedSessions.length, 0);
    assert.notOk(page.showsAllSessionsExpanded);
  });

  test('expand all sessions does not expand sessions with no offerings', async function (assert) {
    this.server.create('offering', { session: this.session2 });
    this.server.create('offering', { session: this.session4 });
    await page.visit({ courseId: 1, details: true });
    const { sessions, expandedSessions } = page.sessionsList;
    assert.equal(sessions.length, 4);
    assert.equal(expandedSessions.length, 0);
    assert.notOk(page.showsAllSessionsExpanded);
    await page.expandCollapseAllSessions();
    assert.equal(expandedSessions.length, 3);
    assert.ok(page.showsAllSessionsExpanded);
    await page.expandCollapseAllSessions();
    assert.equal(expandedSessions.length, 0);
    assert.notOk(page.showsAllSessionsExpanded);
  });

  test('expand all sessions with one session expanded already', async function(assert) {
    this.server.create('offering', { session: this.session2 });
    this.server.create('offering', { session: this.session3 });
    this.server.create('offering', { session: this.session4 });
    await page.visit({ courseId: 1, details: true });
    const { sessions, expandedSessions } = page.sessionsList;
    assert.equal(sessions.length, 4);
    assert.equal(expandedSessions.length, 0);
    await sessions[0].expandCollapse();
    assert.equal(expandedSessions.length, 1);
    await page.expandCollapseAllSessions();
    assert.equal(expandedSessions.length, 4);
    await page.expandCollapseAllSessions();
    assert.equal(expandedSessions.length, 0);
  });

  test('expand sessions one at a time and collapse all', async function(assert) {
    this.server.create('offering', { session: this.session2 });
    this.server.create('offering', { session: this.session3 });
    this.server.create('offering', { session: this.session4 });
    await page.visit({ courseId: 1, details: true });
    const { sessions, expandedSessions } = page.sessionsList;
    assert.equal(sessions.length, 4);
    assert.equal(expandedSessions.length, 0);
    await sessions[0].expandCollapse();
    await sessions[1].expandCollapse();
    await sessions[2].expandCollapse();
    await sessions[3].expandCollapse();
    assert.equal(expandedSessions.length, 4);
    assert.ok(page.showsAllSessionsExpanded);
    await page.expandCollapseAllSessions();
    assert.equal(expandedSessions.length, 0);
  });

  test('new session', async function (assert) {
    this.server.create('sessionType', { school: this.school });
    await page.visit({ courseId: 1, details: true });
    const { sessions } = page.sessionsList;
    assert.equal(sessions.length, 4);
    await page.expandNewSessionForm();
    await page.newSession.title.set('xx new session');
    await page.newSession.selectSessionType('2');
    await page.newSession.save();

    assert.equal(sessions.length, 5);
    assert.equal(sessions[4].title, 'xx new session');
    assert.equal(sessions[4].type, 'session type 1');
    assert.equal(sessions[4].groupCount, '0');
    assert.equal(sessions[4].objectiveCount, '0');
    assert.equal(sessions[4].termCount, '0');
    assert.equal(sessions[4].firstOffering, '');
    assert.equal(sessions[4].offeringCount, '0');

  });

  test('cancel session', async function (assert) {
    await page.visit({ courseId: 1, details: true });
    const { sessions } = page.sessionsList;
    assert.equal(sessions.length, 4);
    await page.expandNewSessionForm();
    assert.ok(page.newSession.isVisible);
    await page.newSession.title.set('new');
    await page.newSession.cancel();

    assert.equal(sessions.length, 4);
    assert.notOk(page.newSession.isVisible);
  });


  test('new session goes away when we navigate #643', async function(assert) {
    await page.visit({ courseId: 1, details: true });
    const { sessions } = page.sessionsList;
    await page.expandNewSessionForm();
    assert.ok(page.newSession.isVisible);
    const newTitle = 'new session';
    await page.newSession.title.set(newTitle);
    await page.newSession.save();
    assert.equal(sessions.length, 5);

    assert.ok(page.newSavedSession.isPresent);
    assert.equal(page.newSavedSession.text, newTitle);
    await page.newSavedSession.click();
    assert.equal(currentRouteName(), 'session.index');
    await click('[data-test-back-to-sessions] a');
    assert.equal(currentRouteName(), 'course.index');
    assert.notOk(page.newSavedSession.isPresent);
  });

  test('first offering is updated when offering is updated #1276', async function (assert) {
    await page.visit({ courseId: 1, details: true });
    const { sessions } = page.sessionsList;
    const { offerings } = sessions[0].offerings;

    assert.equal(sessions.length, 4);
    assert.equal(sessions[0].firstOffering, today.toDate().toLocaleString('en', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }));
    await sessions[0].expandCollapse();
    await offerings[0].edit();
    const { offeringForm: form } = offerings[0];
    const newDate = moment(new Date(2011, 8, 11)).hour(2).minute(15);
    await form.startDate.set(newDate.toDate());
    await form.startTime.hour(newDate.format('h'));
    await form.startTime.minutes(newDate.format('m'));
    await form.startTime.ampm(newDate.format('a'));
    await form.save();

    assert.equal(sessions[0].firstOffering, newDate.toDate().toLocaleString('en', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }));

  });

  test('title filter escapes regex', async function(assert) {
    assert.expect(4);
    await page.visit({ courseId: 1, details: true });
    const { sessions } = page.sessionsList;
    assert.equal(sessions.length, 4);
    assert.equal(sessions[0].title, 'session 0');
    await page.filter('\\');
    assert.equal(sessions.length, 1);
    assert.equal(sessions[0].title, 'session3\\');
  });

  test('delete session', async function (assert) {
    await page.visit({ courseId: 1, details: true });
    const { sessions } = page.sessionsList;
    assert.equal(sessions.length, 4);
    assert.equal(sessions[0].title, 'session 0');
    assert.equal(sessions[1].title, 'session 1');
    await sessions[0].trash();
    await sessions[0].confirm();
    assert.equal(sessions.length, 3);
    assert.equal(sessions[0].title, 'session 1');
  });

  test('back and forth #3771', async function (assert) {
    const sessionCount = 50;
    this.server.createList('session', sessionCount, {
      course: this.course,
      sessionType: this.sessionType,
    });
    await page.visit({ courseId: 1, details: true });
    const { sessions } = page.sessionsList;
    assert.equal(sessions.length, sessionCount + 4);

    for (let i = 1; i < 10; i++) {
      await sessions[i].visit();
      assert.equal(currentRouteName(), 'session.index');
      await click('[data-test-back-to-sessions] a');
      assert.equal(currentRouteName(), 'course.index');
      assert.equal(sessions.length, sessionCount + 4);
    }

  });

  test('edit offering URL', async function (assert) {
    await page.visit({ courseId: 1, details: true });
    const { sessions } = page.sessionsList;
    const { offerings } = sessions[0].offerings;

    assert.equal(sessions.length, 4);
    assert.equal(sessions[0].firstOffering, today.toDate().toLocaleString('en', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }));
    await sessions[0].expandCollapse();
    await offerings[0].edit();
    const { offeringForm: form } = offerings[0];
    await form.url.set('https://zoom.example.edu');
    await form.save();
    assert.equal(this.server.schema.offerings.find(1).url, 'https://zoom.example.edu');
  });
});
