import { click, currentRouteName } from '@ember/test-helpers';
import moment from 'moment';
import {
  module,
  test
} from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from 'ilios/tests/pages/sessions';

moment.locale('en');
let today = moment().hour(8);
module('Acceptance: Course - Session List', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
    this.sessionType = this.server.create('sessionType', { school: this.school });
    const course = this.course = this.server.create('course', {
      school: this.school,
      directorIds: [this.user.id]
    });
    this.session1 = this.server.create('session', {
      course,
      sessionType: this.sessionType,
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
      title: 'session3\\'
    });
    this.server.create('offering', {
      session: this.session1,
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
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
    assert.equal(sessions.objectAt(0).title, 'session 0');
    assert.equal(sessions.objectAt(0).type, 'session type 0');
    assert.equal(sessions.objectAt(0).groupCount, '0');
    assert.equal(sessions.objectAt(0).objectiveCount, '0');
    assert.equal(sessions.objectAt(0).termCount, '0');
    assert.equal(sessions.objectAt(0).firstOffering, today.format('L LT'));
    assert.equal(sessions.objectAt(0).offeringCount, '3');
    assert.notOk(sessions.objectAt(0).hasInstructionalNotes);

    assert.equal(sessions.objectAt(1).title, 'session 1');
    assert.equal(sessions.objectAt(1).type, 'session type 0');
    assert.equal(sessions.objectAt(1).groupCount, '0');
    assert.equal(sessions.objectAt(1).objectiveCount, '0');
    assert.equal(sessions.objectAt(1).termCount, '0');
    assert.equal(sessions.objectAt(1).firstOffering, '');
    assert.equal(sessions.objectAt(1).offeringCount, '0');
    assert.notOk(sessions.objectAt(1).hasInstructionalNotes);

    assert.equal(sessions.objectAt(2).title, 'session 2');
    assert.equal(sessions.objectAt(2).type, 'session type 0');
    assert.equal(sessions.objectAt(2).groupCount, '0');
    assert.equal(sessions.objectAt(2).objectiveCount, '0');
    assert.equal(sessions.objectAt(2).termCount, '0');
    assert.equal(sessions.objectAt(2).firstOffering, '');
    assert.equal(sessions.objectAt(2).offeringCount, '0');
    assert.ok(sessions.objectAt(2).hasInstructionalNotes);

    assert.equal(sessions.objectAt(3).title, 'session3\\');
    assert.equal(sessions.objectAt(3).type, 'session type 0');
    assert.equal(sessions.objectAt(3).groupCount, '0');
    assert.equal(sessions.objectAt(3).objectiveCount, '0');
    assert.equal(sessions.objectAt(3).termCount, '0');
    assert.equal(sessions.objectAt(3).firstOffering, '');
    assert.equal(sessions.objectAt(3).offeringCount, '0');
    assert.notOk(sessions.objectAt(3).hasInstructionalNotes);
  });

  test('expanded offering', async function (assert) {
    await page.visit({ courseId: 1, details: true });
    const { sessions } = page.sessionsList;

    assert.equal(sessions.length, 4);
    await sessions.objectAt(0).expandCollapse();
    const { offerings } = sessions.objectAt(0);


    const offering1StartDate = moment(this.server.db.offerings[0].startDate);
    const offering2StartDate = moment(this.server.db.offerings[1].startDate);
    const offering3StartDate = moment(this.server.db.offerings[2].startDate);

    assert.equal(offerings.dates.length, 3);

    assert.equal(offerings.dates.objectAt(0).dayOfWeek, offering1StartDate.format('dddd'));
    assert.equal(offerings.dates.objectAt(0).dayOfMonth, offering1StartDate.format('MMMM Do'));
    assert.equal(offerings.dates.objectAt(1).dayOfWeek, offering2StartDate.format('dddd'));
    assert.equal(offerings.dates.objectAt(1).dayOfMonth, offering2StartDate.format('MMMM Do'));
    assert.equal(offerings.dates.objectAt(2).dayOfWeek, offering3StartDate.format('dddd'));
    assert.equal(offerings.dates.objectAt(2).dayOfMonth, offering3StartDate.format('MMMM Do'));

    assert.equal(offerings.offerings.length, 3);
    assert.equal(offerings.offerings.objectAt(0).startTime, offering1StartDate.format('LT'));
    assert.equal(offerings.offerings.objectAt(0).location, 'room 0');
    assert.equal(offerings.offerings.objectAt(0).learners, '0');
    assert.equal(offerings.offerings.objectAt(0).learnerGroups, '');
    assert.equal(offerings.offerings.objectAt(0).instructors, '');

    assert.equal(offerings.offerings.objectAt(1).startTime, offering2StartDate.format('LT'));
    assert.equal(offerings.offerings.objectAt(1).location, 'room 1');
    assert.equal(offerings.offerings.objectAt(1).learners, '0');
    assert.equal(offerings.offerings.objectAt(1).learnerGroups, '');
    assert.equal(offerings.offerings.objectAt(1).instructors, '');

    assert.equal(offerings.offerings.objectAt(2).startTime, offering3StartDate.format('LT'));
    assert.equal(offerings.offerings.objectAt(2).location, 'room 2');
    assert.equal(offerings.offerings.objectAt(2).learners, '0');
    assert.equal(offerings.offerings.objectAt(2).learnerGroups, '');
    assert.equal(offerings.offerings.objectAt(2).instructors, '');
  });

  test('no offerings', async function(assert) {
    await page.visit({ courseId: 1, details: true });
    const { sessions } = page.sessionsList;

    assert.equal(sessions.length, 4);
    assert.ok(sessions.objectAt(0).canExpand);
    assert.equal(sessions.objectAt(1).expandTitle, 'This session has no offerings');
    assert.notOk(sessions.objectAt(1).canExpand);
    assert.equal(sessions.objectAt(2).expandTitle, 'This session has no offerings');
    assert.notOk(sessions.objectAt(2).canExpand);
    assert.equal(sessions.objectAt(3).expandTitle, 'This session has no offerings');
    assert.notOk(sessions.objectAt(3).canExpand);
  });

  test('close offering details', async function (assert) {
    await page.visit({ courseId: 1, details: true });
    const { sessions, expandedSessions } = page.sessionsList;
    assert.equal(sessions.length, 4);
    assert.equal(expandedSessions.length, 0);
    await sessions.objectAt(0).expandCollapse();
    assert.equal(expandedSessions.length, 1);
    await sessions.objectAt(0).expandCollapse();
    assert.equal(expandedSessions.length, 0);
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
    await sessions.objectAt(0).expandCollapse();
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
    await sessions.objectAt(0).expandCollapse();
    await sessions.objectAt(1).expandCollapse();
    await sessions.objectAt(2).expandCollapse();
    await sessions.objectAt(3).expandCollapse();
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
    await page.newSession.title('xx new session');
    await page.newSession.type('2');
    await page.newSession.save();

    assert.equal(sessions.length, 5);
    assert.equal(sessions.objectAt(4).title, 'xx new session');
    assert.equal(sessions.objectAt(4).type, 'session type 1');
    assert.equal(sessions.objectAt(4).groupCount, '0');
    assert.equal(sessions.objectAt(4).objectiveCount, '0');
    assert.equal(sessions.objectAt(4).termCount, '0');
    assert.equal(sessions.objectAt(4).firstOffering, '');
    assert.equal(sessions.objectAt(4).offeringCount, '0');

  });

  test('cancel session', async function (assert) {
    await page.visit({ courseId: 1, details: true });
    const { sessions } = page.sessionsList;
    assert.equal(sessions.length, 4);
    await page.expandNewSessionForm();
    assert.ok(page.newSession.isVisible);
    await page.newSession.title('new');
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
    await page.newSession.title(newTitle);
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
    const { offerings } = sessions.objectAt(0).offerings;

    assert.equal(sessions.length, 4);
    assert.equal(sessions.objectAt(0).firstOffering, today.format('L LT'));
    await sessions.objectAt(0).expandCollapse();
    await offerings.objectAt(0).edit();
    const { offeringForm: form } = offerings.objectAt(0);
    const newDate = moment(new Date(2011, 8, 11)).hour(2).minute(15);
    await form.startDate(newDate.toDate());
    await form.startTime.hour(newDate.format('h'));
    await form.startTime.minutes(newDate.format('m'));
    await form.startTime.ampm(newDate.format('a'));
    await form.save();

    assert.equal(sessions.objectAt(0).firstOffering, newDate.format('L LT'));

  });

  test('title filter escapes regex', async function(assert) {
    assert.expect(4);
    await page.visit({ courseId: 1, details: true });
    const { sessions } = page.sessionsList;
    assert.equal(sessions.length, 4);
    assert.equal(sessions.objectAt(0).title, 'session 0');
    await page.filter('\\');
    assert.equal(sessions.length, 1);
    assert.equal(sessions.objectAt(0).title, 'session3\\');
  });

  test('delete session', async function (assert) {
    await page.visit({ courseId: 1, details: true });
    const { sessions } = page.sessionsList;
    assert.equal(sessions.length, 4);
    assert.equal(sessions.objectAt(0).title, 'session 0');
    assert.equal(sessions.objectAt(1).title, 'session 1');
    await sessions.objectAt(0).trash();
    await sessions.objectAt(0).confirm();
    assert.equal(sessions.length, 3);
    assert.equal(sessions.objectAt(0).title, 'session 1');
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
      await sessions.objectAt(i).visit();
      assert.equal(currentRouteName(), 'session.index');
      await click('[data-test-back-to-sessions] a');
      assert.equal(currentRouteName(), 'course.index');
      assert.equal(sessions.length, sessionCount + 4);
    }

  });
});
