import { currentRouteName, currentURL } from '@ember/test-helpers';
import { DateTime } from 'luxon';
import { module, test } from 'qunit';
import { setupAuthentication, freezeDateAt, unfreezeDate } from 'ilios-common';
import { setupApplicationTest } from 'frontend/tests/helpers';
import page from 'ilios-common/page-objects/sessions';
import sessionPage from 'ilios-common/page-objects/session';
import percySnapshot from '@percy/ember';
import { getUniqueName } from '../../helpers/percy-snapshot-name';

module('Acceptance | Course - Session List', function (hooks) {
  setupApplicationTest(hooks);
  hooks.beforeEach(async function () {
    freezeDateAt(
      DateTime.fromObject({
        month: 4,
        day: 1,
      }).toJSDate(),
    );
    this.intl = this.owner.lookup('service:intl');
    this.today = DateTime.fromObject({ hour: 8 });
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school }, true);
    this.sessionType = this.server.create('session-type', {
      school: this.school,
    });

    const learner1 = this.server.create('user');
    const learner2 = this.server.create('user');
    const instructor1 = this.server.create('user');
    const instructor2 = this.server.create('user');
    const instructor3 = this.server.create('user');
    const learnerGroup1 = this.server.create('learner-group', {
      users: [learner1, learner2],
    });
    const learnerGroup2 = this.server.create('learner-group');
    const instructorGroup = this.server.create('instructor-group', {
      users: [instructor1, instructor2, instructor3],
    });
    this.course = this.server.create('course', {
      school: this.school,
      directorIds: [this.user.id],
    });
    this.session1 = this.server.create('session', {
      course: this.course,
      sessionType: this.sessionType,
      updatedAt: DateTime.fromObject({ year: 2019, month: 7, day: 9, hour: 17 }).toJSDate(),
    });
    this.session2 = this.server.create('session', {
      course: this.course,
      sessionType: this.sessionType,
    });
    this.session3 = this.server.create('session', {
      course: this.course,
      sessionType: this.sessionType,
      instructionalNotes: "They're good dogs Brent",
    });
    this.session4 = this.server.create('session', {
      course: this.course,
      sessionType: this.sessionType,
      prerequisites: [this.session2],
      title: 'session3\\',
    });
    this.server.create('offering', {
      session: this.session1,
      startDate: this.today.toJSDate(),
      endDate: this.today.plus({ hour: 1 }).toJSDate(),
      learners: [learner1],
      learnerGroups: [learnerGroup1, learnerGroup2],
      instructors: [instructor1],
      instructorGroups: [instructorGroup],
    });
    this.server.create('offering', {
      session: this.session1,
      startDate: this.today.plus({ day: 1, hour: 1 }).toJSDate(),
      endDate: this.today.plus({ day: 1, hour: 4 }).toJSDate(),
    });
    this.server.create('offering', {
      session: this.session1,
      startDate: this.today.plus({ day: 2 }).toJSDate(),
      endDate: this.today.plus({ day: 3 }).toJSDate(),
    });
  });

  hooks.afterEach(() => {
    unfreezeDate();
  });

  test('session list', async function (assert) {
    await page.visit({ courseId: this.course.id, details: true });
    await percySnapshot(assert);
    const { sessions } = page.courseSessions.sessionsGrid;

    assert.strictEqual(sessions.length, 4);
    assert.strictEqual(sessions[0].row.title, 'session 0');
    assert.strictEqual(sessions[0].row.type, 'session type 0');
    assert.strictEqual(sessions[0].row.groupCount, '2');
    assert.strictEqual(sessions[0].row.objectiveCount, '0');
    assert.strictEqual(sessions[0].row.termCount, '0');
    assert.strictEqual(
      sessions[0].row.firstOffering,
      this.intl.formatDate(this.today.toJSDate(), {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    );
    assert.strictEqual(sessions[0].row.offeringCount, '3');
    assert.notOk(sessions[0].row.hasInstructionalNotes);
    assert.notOk(sessions[0].row.hasPrerequisites);

    assert.strictEqual(sessions[1].row.title, 'session 1');
    assert.strictEqual(sessions[1].row.type, 'session type 0');
    assert.strictEqual(sessions[1].row.groupCount, '0');
    assert.strictEqual(sessions[1].row.objectiveCount, '0');
    assert.strictEqual(sessions[1].row.termCount, '0');
    assert.strictEqual(sessions[1].row.firstOffering, '');
    assert.strictEqual(sessions[1].row.offeringCount, '0');
    assert.notOk(sessions[1].row.hasInstructionalNotes);
    assert.notOk(sessions[1].row.hasPrerequisites);

    assert.strictEqual(sessions[2].row.title, 'session 2');
    assert.strictEqual(sessions[2].row.type, 'session type 0');
    assert.strictEqual(sessions[2].row.groupCount, '0');
    assert.strictEqual(sessions[2].row.objectiveCount, '0');
    assert.strictEqual(sessions[2].row.termCount, '0');
    assert.strictEqual(sessions[2].row.firstOffering, '');
    assert.strictEqual(sessions[2].row.offeringCount, '0');
    assert.ok(sessions[2].row.hasInstructionalNotes);
    assert.notOk(sessions[2].row.hasPrerequisites);

    assert.strictEqual(sessions[3].row.title, 'session3\\');
    assert.strictEqual(sessions[3].row.type, 'session type 0');
    assert.strictEqual(sessions[3].row.groupCount, '0');
    assert.strictEqual(sessions[3].row.objectiveCount, '0');
    assert.strictEqual(sessions[3].row.termCount, '0');
    assert.strictEqual(sessions[3].row.firstOffering, '');
    assert.strictEqual(sessions[3].row.offeringCount, '0');
    assert.notOk(sessions[3].row.hasInstructionalNotes);
    assert.ok(sessions[3].row.hasPrerequisites);
  });

  test('expanded offering', async function (assert) {
    await page.visit({ courseId: this.course.id, details: true });
    const { sessions } = page.courseSessions.sessionsGrid;

    assert.strictEqual(sessions.length, 4);
    await sessions[0].row.expand();
    const { offerings } = sessions[0];

    const offering1StartDate = DateTime.fromJSDate(this.server.db.offerings[0].startDate);
    const offering2StartDate = DateTime.fromJSDate(this.server.db.offerings[1].startDate);
    const offering3StartDate = DateTime.fromJSDate(this.server.db.offerings[2].startDate);

    assert.strictEqual(offerings.dates.length, 3);

    assert.strictEqual(offerings.dates[0].dayOfWeek, offering1StartDate.toFormat('cccc'));
    assert.strictEqual(offerings.dates[0].dayOfMonth, offering1StartDate.toFormat('MMMM d'));
    assert.strictEqual(offerings.dates[1].dayOfWeek, offering2StartDate.toFormat('cccc'));
    assert.strictEqual(offerings.dates[1].dayOfMonth, offering2StartDate.toFormat('MMMM d'));
    assert.strictEqual(offerings.dates[2].dayOfWeek, offering3StartDate.toFormat('cccc'));
    assert.strictEqual(offerings.dates[2].dayOfMonth, offering3StartDate.toFormat('MMMM d'));

    assert.strictEqual(offerings.offerings.length, 3);
    assert.strictEqual(offerings.offerings[0].startTime, offering1StartDate.toFormat('hh:mm a'));
    assert.strictEqual(offerings.offerings[0].location, 'room 0');
    assert.strictEqual(offerings.offerings[0].learners, '(2) 1 guy M. Mc1son, 2 guy...');
    assert.strictEqual(offerings.offerings[0].learnerGroups, '(2) learner group 0, learn...');
    assert.strictEqual(offerings.offerings[0].instructors, '(3) 3 guy M. Mc3son, 4 guy...');

    assert.strictEqual(offerings.offerings[1].startTime, offering2StartDate.toFormat('hh:mm a'));
    assert.strictEqual(offerings.offerings[1].location, 'room 1');
    assert.strictEqual(offerings.offerings[1].learners, '');
    assert.strictEqual(offerings.offerings[1].learnerGroups, '');
    assert.strictEqual(offerings.offerings[1].instructors, '');

    assert.strictEqual(offerings.offerings[2].startTime, offering3StartDate.toFormat('hh:mm a'));
    assert.strictEqual(offerings.offerings[2].location, 'room 2');
    assert.strictEqual(offerings.offerings[2].learners, '');
    assert.strictEqual(offerings.offerings[2].learnerGroups, '');
    assert.strictEqual(offerings.offerings[2].instructors, '');
  });

  test('no offerings', async function (assert) {
    await page.visit({ courseId: this.course.id, details: true });
    const { sessions } = page.courseSessions.sessionsGrid;

    assert.strictEqual(sessions.length, 4);
    assert.ok(sessions[0].row.canExpand);
    assert.strictEqual(sessions[1].row.expandTitle, 'This session has no offerings');
    assert.notOk(sessions[1].row.canExpand);
    assert.strictEqual(sessions[2].row.expandTitle, 'This session has no offerings');
    assert.notOk(sessions[2].row.canExpand);
    assert.strictEqual(sessions[3].row.expandTitle, 'This session has no offerings');
    assert.notOk(sessions[3].row.canExpand);
  });

  test('close offering details', async function (assert) {
    await page.visit({ courseId: this.course.id, details: true });
    const { sessions, expandedSessions } = page.courseSessions.sessionsGrid;
    assert.strictEqual(sessions.length, 4);
    assert.strictEqual(expandedSessions.length, 0);
    await sessions[0].row.expand();
    assert.strictEqual(expandedSessions.length, 1);
    await sessions[0].row.collapse();
    assert.strictEqual(expandedSessions.length, 0);
  });

  test('session last update timestamp visible in expanded mode', async function (assert) {
    await page.visit({ courseId: this.course.id, details: true });
    const { sessions, expandedSessions } = page.courseSessions.sessionsGrid;
    await sessions[0].row.expand();
    const updatedAt = this.intl.formatDate(this.session1.updatedAt, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    assert.strictEqual(expandedSessions[0].lastUpdated, `Last Update Last Update: ${updatedAt}`);
  });

  test('expand all sessions', async function (assert) {
    this.server.create('offering', { session: this.session2 });
    this.server.create('offering', { session: this.session3 });
    this.server.create('offering', { session: this.session4 });
    await page.visit({ courseId: this.course.id, details: true });
    const { sessions, expandedSessions } = page.courseSessions.sessionsGrid;
    assert.strictEqual(sessions.length, 4);
    assert.strictEqual(expandedSessions.length, 0);
    assert.notOk(page.courseSessions.sessionsGridHeader.expandCollapse.allAreExpanded);
    await page.courseSessions.sessionsGridHeader.expandCollapse.toggle.click();
    await percySnapshot(getUniqueName(assert, 'not expanded'));
    assert.strictEqual(expandedSessions.length, 4);
    assert.ok(page.courseSessions.sessionsGridHeader.expandCollapse.allAreExpanded);
    await page.courseSessions.sessionsGridHeader.expandCollapse.toggle.click();
    await percySnapshot(getUniqueName(assert, 'expanded'));
    assert.strictEqual(expandedSessions.length, 0);
    assert.notOk(page.courseSessions.sessionsGridHeader.expandCollapse.allAreExpanded);
  });

  test('expand all sessions does not expand sessions with no offerings', async function (assert) {
    this.server.create('offering', { session: this.session2 });
    this.server.create('offering', { session: this.session4 });
    await page.visit({ courseId: this.course.id, details: true });
    const { sessions, expandedSessions } = page.courseSessions.sessionsGrid;
    assert.strictEqual(sessions.length, 4);
    assert.strictEqual(expandedSessions.length, 0);
    assert.notOk(page.courseSessions.sessionsGridHeader.expandCollapse.allAreExpanded);
    await page.courseSessions.sessionsGridHeader.expandCollapse.toggle.click();
    assert.strictEqual(expandedSessions.length, 3);
    assert.ok(page.courseSessions.sessionsGridHeader.expandCollapse.allAreExpanded);
  });

  test('expand all sessions with one session expanded already', async function (assert) {
    this.server.create('offering', { session: this.session2 });
    this.server.create('offering', { session: this.session3 });
    this.server.create('offering', { session: this.session4 });
    await page.visit({ courseId: this.course.id, details: true });
    const { sessions, expandedSessions } = page.courseSessions.sessionsGrid;
    assert.strictEqual(sessions.length, 4);
    assert.strictEqual(expandedSessions.length, 0);
    await sessions[0].row.expand();
    assert.strictEqual(expandedSessions.length, 1);
    await page.courseSessions.sessionsGridHeader.expandCollapse.toggle.click();
    assert.strictEqual(expandedSessions.length, 4);
    await page.courseSessions.sessionsGridHeader.expandCollapse.toggle.click();
    assert.strictEqual(expandedSessions.length, 0);
  });

  test('expand sessions one at a time and collapse all', async function (assert) {
    this.server.create('offering', { session: this.session2 });
    this.server.create('offering', { session: this.session3 });
    this.server.create('offering', { session: this.session4 });
    await page.visit({ courseId: this.course.id, details: true });
    const { sessions, expandedSessions } = page.courseSessions.sessionsGrid;
    assert.strictEqual(sessions.length, 4);
    assert.strictEqual(expandedSessions.length, 0);
    await sessions[0].row.expand();
    await sessions[1].row.expand();
    await sessions[2].row.expand();
    await sessions[3].row.expand();
    assert.strictEqual(expandedSessions.length, 4);
    assert.ok(page.courseSessions.sessionsGridHeader.expandCollapse.allAreExpanded);
    await page.courseSessions.sessionsGridHeader.expandCollapse.toggle.click();
    assert.strictEqual(expandedSessions.length, 0);
  });

  test('new session', async function (assert) {
    this.server.create('session-type', { school: this.school });
    await page.visit({ courseId: this.course.id, details: true });
    assert.strictEqual(page.courseSessions.header.title, 'Sessions (4)');
    const { sessions } = page.courseSessions.sessionsGrid;
    assert.strictEqual(sessions.length, 4);
    await page.courseSessions.header.expandNewSessionForm();
    await page.courseSessions.newSession.title.set('xx new session');
    await page.courseSessions.newSession.selectSessionType('2');
    await page.courseSessions.newSession.save();

    assert.strictEqual(page.courseSessions.header.title, 'Sessions (5)');
    assert.strictEqual(sessions.length, 5);
    assert.strictEqual(sessions[4].row.title, 'xx new session');
    assert.strictEqual(sessions[4].row.type, 'session type 1');
    assert.strictEqual(sessions[4].row.groupCount, '0');
    assert.strictEqual(sessions[4].row.objectiveCount, '0');
    assert.strictEqual(sessions[4].row.termCount, '0');
    assert.strictEqual(sessions[4].row.firstOffering, '');
    assert.strictEqual(sessions[4].row.offeringCount, '0');
  });

  test('cancel session', async function (assert) {
    await page.visit({ courseId: this.course.id, details: true });
    const { sessions } = page.courseSessions.sessionsGrid;
    assert.strictEqual(sessions.length, 4);
    await page.courseSessions.header.expandNewSessionForm();
    assert.ok(page.courseSessions.newSession.isVisible);
    await page.courseSessions.newSession.title.set('new');
    await page.courseSessions.newSession.cancel();
    assert.strictEqual(sessions.length, 4);
    assert.notOk(page.courseSessions.newSession.isVisible);
  });

  test('new session goes away when we navigate #643', async function (assert) {
    await page.visit({ courseId: this.course.id, details: true });
    const { sessions } = page.courseSessions.sessionsGrid;
    await page.courseSessions.header.expandNewSessionForm();
    assert.ok(page.courseSessions.newSession.isVisible);
    const newTitle = 'new session';
    await page.courseSessions.newSession.title.set(newTitle);
    await page.courseSessions.newSession.save();
    assert.strictEqual(sessions.length, 5);

    assert.ok(page.courseSessions.newSavedSession.isPresent);
    assert.strictEqual(page.courseSessions.newSavedSession.text, newTitle);
    await page.courseSessions.newSavedSession.click();
    assert.strictEqual(currentRouteName(), 'session.index');
    await sessionPage.backToSessions.click();
    assert.strictEqual(currentRouteName(), 'course.index');
    assert.notOk(page.courseSessions.newSavedSession.isPresent);
  });

  test('first offering is updated when offering is updated #1276', async function (assert) {
    await page.visit({ courseId: this.course.id, details: true });
    const { sessions } = page.courseSessions.sessionsGrid;
    const { offerings } = sessions[0].offerings;

    assert.strictEqual(sessions.length, 4);
    assert.strictEqual(
      sessions[0].row.firstOffering,
      this.intl.formatDate(this.today.toJSDate(), {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    );
    await sessions[0].row.expand();
    await offerings[0].edit();
    const { offeringForm: form } = offerings[0];
    const newDate = DateTime.fromObject({ year: 2011, month: 8, day: 11, hour: 14, minute: 2 });
    await form.startDate.datePicker.set(newDate.toJSDate());
    await form.startTime.timePicker.hour.select(newDate.toFormat('hh'));
    await form.startTime.timePicker.minute.select(newDate.toFormat('mm'));
    await form.startTime.timePicker.ampm.select(newDate.toFormat('a'));
    await form.save();

    assert.strictEqual(
      sessions[0].row.firstOffering,
      this.intl.formatDate(newDate.toJSDate(), {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    );
  });

  test('title filter escapes regex', async function (assert) {
    await page.visit({ courseId: this.course.id, details: true });
    const { sessions } = page.courseSessions.sessionsGrid;
    assert.strictEqual(sessions.length, 4);
    assert.strictEqual(sessions[0].row.title, 'session 0');
    await page.courseSessions.filter('\\');
    assert.strictEqual(sessions.length, 1);
    assert.strictEqual(sessions[0].row.title, 'session3\\');
  });

  test('delete session', async function (assert) {
    await page.visit({ courseId: this.course.id, details: true });
    const { sessions } = page.courseSessions.sessionsGrid;
    assert.strictEqual(sessions.length, 4);
    assert.strictEqual(sessions[0].row.title, 'session 0');
    assert.strictEqual(sessions[1].row.title, 'session 1');
    await sessions[0].row.trash();
    await sessions[0].confirm();
    assert.strictEqual(sessions.length, 3);
    assert.strictEqual(sessions[0].row.title, 'session 1');
  });

  test('back and forth #3771', async function (assert) {
    const sessionCount = 50;
    this.server.createList('session', sessionCount, {
      course: this.course,
      sessionType: this.sessionType,
    });
    await page.visit({ courseId: this.course.id, details: true });
    const { sessions } = page.courseSessions.sessionsGrid;
    assert.strictEqual(sessions.length, sessionCount + 4);

    for (let i = 1; i < 10; i++) {
      await sessions[i].row.visit();
      assert.strictEqual(currentRouteName(), 'session.index');
      await sessionPage.backToSessions.click();
      assert.strictEqual(currentRouteName(), 'course.index');
      assert.strictEqual(sessions.length, sessionCount + 4);
    }
  });

  test('edit offering URL', async function (assert) {
    await page.visit({ courseId: this.course.id, details: true });
    const { sessions } = page.courseSessions.sessionsGrid;
    const { offerings } = sessions[0].offerings;

    assert.strictEqual(sessions.length, 4);
    assert.strictEqual(
      sessions[0].row.firstOffering,
      this.intl.formatDate(this.today.toJSDate(), {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    );
    await sessions[0].row.expand();
    await offerings[0].edit();
    const { offeringForm: form } = offerings[0];
    await form.url.set('https://zoom.example.edu');
    await form.save();
    assert.strictEqual(this.server.schema.offerings.find(1).url, 'https://zoom.example.edu');
  });

  test('sort by title #3941', async function (assert) {
    await page.visit({ courseId: this.course.id });
    assert.strictEqual(currentURL(), '/courses/1');
    const { sessions } = page.courseSessions.sessionsGrid;
    const header = page.courseSessions.sessionsGridHeader;
    assert.strictEqual(sessions.length, 4);
    assert.strictEqual(sessions[0].row.title, 'session 0');
    assert.strictEqual(sessions[1].row.title, 'session 1');
    assert.strictEqual(sessions[2].row.title, 'session 2');
    assert.strictEqual(sessions[3].row.title, 'session3\\');
    await header.title.click();
    assert.strictEqual(currentURL(), '/courses/1?sortSessionsBy=title%3Adesc');
    assert.strictEqual(sessions.length, 4);
    assert.strictEqual(sessions[0].row.title, 'session3\\');
    assert.strictEqual(sessions[1].row.title, 'session 2');
    assert.strictEqual(sessions[2].row.title, 'session 1');
    assert.strictEqual(sessions[3].row.title, 'session 0');
    await header.title.click();
    assert.strictEqual(currentURL(), '/courses/1?sortSessionsBy=title');
    assert.strictEqual(sessions.length, 4);
    assert.strictEqual(sessions[0].row.title, 'session 0');
    assert.strictEqual(sessions[1].row.title, 'session 1');
    assert.strictEqual(sessions[2].row.title, 'session 2');
    assert.strictEqual(sessions[3].row.title, 'session3\\');
  });
});
