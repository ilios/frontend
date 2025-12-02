import { currentURL, currentRouteName } from '@ember/test-helpers';
import { DateTime } from 'luxon';
import { module, test } from 'qunit';
import { setupAuthentication, freezeDateAt, unfreezeDate } from 'ilios-common';
import { setupApplicationTest, takeScreenshot } from 'frontend/tests/helpers';
import page from 'ilios-common/page-objects/dashboard-calendar';
import percySnapshot from '@percy/ember';

module('Acceptance | Dashboard Calendar', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    this.intl = this.owner.lookup('service:intl');
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
    const program = this.server.create('program', {
      school: this.school,
    });
    const programYear1 = this.server.create('program-year', {
      program,
      startYear: 2015,
    });
    const programYear2 = this.server.create('program-year', {
      program,
      startYear: 2016,
    });
    const cohort1 = this.server.create('cohort', {
      programYear: programYear1,
    });
    const cohort2 = this.server.create('cohort', {
      programYear: programYear2,
    });
    const sessionType1 = this.server.create('session-type', {
      school: this.school,
    });
    const sessionType2 = this.server.create('session-type', {
      school: this.school,
    });
    this.server.create('session-type', {
      school: this.school,
    });
    const course1 = this.server.create('course', {
      school: this.school,
      year: 2015,
      level: 1,
      cohorts: [cohort1],
    });
    const course2 = this.server.create('course', {
      year: 2015,
      school: this.school,
      level: 2,
      cohorts: [cohort2],
    });
    const session1 = this.server.create('session', {
      course: course1,
      sessionType: sessionType1,
    });
    const session2 = this.server.create('session', {
      course: course1,
      sessionType: sessionType2,
    });
    const session3 = this.server.create('session', {
      course: course2,
      sessionType: sessionType2,
    });
    const session4 = this.server.create('session', {
      course: course2,
      sessionType: sessionType2,
    });
    this.server.create('academic-year', {
      id: 2015,
    });
    this.server.create('offering', {
      session: session1,
    });
    this.server.create('offering', {
      session: session2,
    });
    this.server.create('offering', {
      session: session3,
    });
    this.ilmSession = this.server.create('ilm-session', {
      id: 1,
      session: session4,
    });
  });

  hooks.afterEach(() => {
    unfreezeDate();
  });

  test('load month calendar', async function (assert) {
    const day = DateTime.fromObject({
      month: 9,
      day: 9,
      year: 2029,
    });
    freezeDateAt(day.toJSDate());

    const today = DateTime.fromObject({ hour: 8, minute: 8, second: 8 });
    const startOfMonth = today.startOf('month');
    const endOfMonth = today.endOf('month').set({ hour: 22, minute: 59 });
    const ilmStartDate = today.set({ hour: 23, minute: 50, second: 0 });
    const ilmEndDate = today.plus({ days: 1 }).set({ hour: 0, minute: 5 });
    this.server.create('userevent', {
      user: this.user.id,
      name: 'start of month',
      startDate: startOfMonth.toJSDate(),
      endDate: startOfMonth.plus({ hour: 1 }).toJSDate(),
      lastModified: today.minus({ year: 1 }),
    });
    this.server.create('userevent', {
      user: this.user.id,
      name: 'end of month',
      startDate: endOfMonth.toJSDate(),
      endDate: endOfMonth.plus({ hour: 1 }).toJSDate(),
      lastModified: today.minus({ year: 1 }),
    });
    this.server.create('userevent', {
      user: this.user.id,
      name: 'end-of-day ILM',
      ilmSession: this.ilmSession.id,
      startDate: ilmStartDate.toJSDate(),
      endDate: ilmEndDate.toJSDate(),
    });
    await page.visit({ view: 'month' });
    await takeScreenshot(assert);
    await percySnapshot(assert);
    assert.strictEqual(currentRouteName(), 'dashboard.calendar');
    assert.strictEqual(page.calendar.calendar.monthly.events.length, 3);
    const startOfMonthStartFormat = this.intl.formatTime(startOfMonth.toJSDate(), {
      hour: '2-digit',
      minute: '2-digit',
    });
    const startOfMonthEndFormat = this.intl.formatTime(startOfMonth.plus({ hour: 1 }).toJSDate(), {
      hour: '2-digit',
      minute: '2-digit',
    });
    assert.strictEqual(
      page.calendar.calendar.monthly.events[0].text,
      `${startOfMonthStartFormat} - ${startOfMonthEndFormat} : start of month`,
    );
    const ilmEventStartFormat = this.intl.formatTime(ilmStartDate.toJSDate(), {
      hour: '2-digit',
      minute: '2-digit',
    });
    const ilmEventEndFormat = this.intl.formatTime(ilmEndDate.toJSDate(), {
      hour: '2-digit',
      minute: '2-digit',
    });
    assert.strictEqual(
      page.calendar.calendar.monthly.events[1].text,
      `${ilmEventStartFormat} - ${ilmEventEndFormat} : end-of-day ILM`,
    );
    const endOfMonthStartFormat = this.intl.formatTime(endOfMonth.toJSDate(), {
      hour: 'numeric',
      minute: 'numeric',
    });
    const endOfMonthEndFormat = this.intl.formatTime(endOfMonth.plus({ hour: 1 }).toJSDate(), {
      hour: 'numeric',
      minute: 'numeric',
    });
    assert.strictEqual(
      page.calendar.calendar.monthly.events[2].text,
      `${endOfMonthStartFormat} - ${endOfMonthEndFormat} : end of month`,
    );
  });

  test('load week calendar', async function (assert) {
    const march11th2009 = DateTime.fromObject({
      year: 2009,
      month: 3,
      day: 11,
      hour: 8,
    });
    freezeDateAt(march11th2009.toJSDate());
    const startOfWeek = DateTime.fromJSDate(
      this.owner.lookup('service:locale-days').firstDayOfThisWeek,
    );
    const endOfWeek = DateTime.fromJSDate(
      this.owner.lookup('service:locale-days').lastDayOfThisWeek,
    ).set({ hour: 22, minute: 59 });
    const ilmStartDate = march11th2009.set({ hour: 23, minute: 50, second: 0 });
    const ilmEndDate = march11th2009.plus({ days: 1 }).set({ hour: 0, minute: 5 });

    const longDayHeading = this.intl.formatDate(startOfWeek.toJSDate(), {
      month: 'short',
      day: 'numeric',
    });
    const shortDayHeading = this.intl.formatDate(startOfWeek.toJSDate(), {
      day: 'numeric',
    });
    this.server.create('userevent', {
      user: this.user.id,
      name: 'start of week',
      startDate: startOfWeek.toJSDate(),
      endDate: startOfWeek.plus({ hour: 1 }).toJSDate(),
      lastModified: DateTime.now().minus({ year: 1 }),
    });
    this.server.create('userevent', {
      user: this.user.id,
      name: 'end of week',
      startDate: endOfWeek.toJSDate(),
      endDate: endOfWeek.plus({ hour: 1 }).toJSDate(),
      lastModified: DateTime.now().minus({ year: 1 }),
    });
    this.server.create('userevent', {
      user: this.user.id,
      name: 'end-of-day ILM',
      ilmSession: this.ilmSession.id,
      startDate: ilmStartDate.toJSDate(),
      endDate: ilmEndDate.toJSDate(),
    });
    await page.visit({ show: 'calendar' });
    await takeScreenshot(assert);
    await percySnapshot(assert);
    assert.strictEqual(currentRouteName(), 'dashboard.calendar');

    assert.strictEqual(page.calendar.calendar.weekly.dayHeadings.length, 7);
    assert.ok(page.calendar.calendar.weekly.dayHeadings[0].isFirstDayOfWeek);
    assert.strictEqual(
      page.calendar.calendar.weekly.dayHeadings[0].text,
      `Sunday Sun ${longDayHeading} ${shortDayHeading}`,
    );

    assert.strictEqual(page.calendar.calendar.weekly.events.length, 3);
    assert.ok(page.calendar.calendar.weekly.events[0].isFirstDayOfWeek);
    assert.strictEqual(page.calendar.calendar.weekly.events[0].name, 'start of week');
    assert.ok(page.calendar.calendar.weekly.events[1].isFourthDayOfWeek);
    assert.strictEqual(page.calendar.calendar.weekly.events[1].name, 'end-of-day ILM');
    assert.ok(page.calendar.calendar.weekly.events[2].isSeventhDayOfWeek);
    assert.strictEqual(page.calendar.calendar.weekly.events[2].name, 'end of week');
  });

  test('load week calendar on Sunday', async function (assert) {
    freezeDateAt(
      DateTime.fromObject({
        year: 2022,
        month: 10,
        day: 9,
        hour: 10,
      }).toJSDate(),
    );
    const startOfWeek = DateTime.fromJSDate(
      this.owner.lookup('service:locale-days').firstDayOfThisWeek,
    );
    const endOfWeek = DateTime.fromJSDate(
      this.owner.lookup('service:locale-days').lastDayOfThisWeek,
    ).set({ hour: 22, minute: 59 });

    const longDayHeading = this.intl.formatDate(startOfWeek.toJSDate(), {
      month: 'short',
      day: 'numeric',
    });
    const shortDayHeading = this.intl.formatDate(startOfWeek.toJSDate(), {
      day: 'numeric',
    });
    this.server.create('userevent', {
      user: this.user.id,
      name: 'start of week',
      startDate: startOfWeek.toJSDate(),
      endDate: startOfWeek.plus({ hour: 1 }).toJSDate(),
      lastModified: DateTime.now().minus({ year: 1 }),
    });
    this.server.create('userevent', {
      user: this.user.id,
      name: 'end of week',
      startDate: endOfWeek.toJSDate(),
      endDate: endOfWeek.plus({ hour: 1 }).toJSDate(),
      lastModified: DateTime.now().minus({ year: 1 }),
    });
    await page.visit({ show: 'calendar' });
    assert.strictEqual(currentRouteName(), 'dashboard.calendar');

    assert.strictEqual(page.calendar.calendar.weekly.dayHeadings.length, 7);
    assert.ok(page.calendar.calendar.weekly.dayHeadings[0].isFirstDayOfWeek);
    assert.strictEqual(
      page.calendar.calendar.weekly.dayHeadings[0].text,
      `Sunday Sun ${longDayHeading} ${shortDayHeading}`,
    );

    assert.strictEqual(
      page.calendar.calendar.weekly.title.longWeekOfYear,
      'Week of October 9, 2022',
    );
    assert.strictEqual(page.calendar.calendar.weekly.events.length, 2);
    assert.ok(page.calendar.calendar.weekly.events[0].isFirstDayOfWeek);
    assert.strictEqual(page.calendar.calendar.weekly.events[0].name, 'start of week');
    assert.ok(page.calendar.calendar.weekly.events[1].isSeventhDayOfWeek);
    assert.strictEqual(page.calendar.calendar.weekly.events[1].name, 'end of week');
  });

  test('load day calendar', async function (assert) {
    freezeDateAt(
      DateTime.fromObject({
        year: 2025,
        month: 6,
        day: 24,
      }).toJSDate(),
    );
    const today = DateTime.fromObject({ hour: 8, minute: 8, second: 8 });
    const tomorow = today.plus({ day: 1 });
    const yesterday = today.minus({ day: 1 });
    const ilmStartDate = today.set({ hour: 23, minute: 50, second: 0 });
    const ilmEndDate = today.plus({ days: 1 }).set({ hour: 0, minute: 5 });
    this.server.create('userevent', {
      user: this.user.id,
      name: 'today',
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      lastModified: today.minus({ year: 1 }),
    });
    this.server.create('userevent', {
      user: this.user.id,
      name: 'tomorow',
      startDate: tomorow.toJSDate(),
      endDate: tomorow.plus({ hour: 1 }).toJSDate(),
      lastModified: today.minus({ year: 1 }),
    });
    this.server.create('userevent', {
      user: this.user.id,
      name: 'yesterday',
      startDate: yesterday.toJSDate(),
      endDate: yesterday.plus({ hour: 1 }).toJSDate(),
      lastModified: today.minus({ year: 1 }),
    });
    this.server.create('userevent', {
      user: this.user.id,
      name: 'end-of-day ILM',
      ilmSession: this.ilmSession.id,
      startDate: ilmStartDate.toJSDate(),
      endDate: ilmEndDate.toJSDate(),
    });
    await page.visit({ view: 'day' });
    await takeScreenshot(assert);
    await percySnapshot(assert);
    assert.strictEqual(currentRouteName(), 'dashboard.calendar');

    assert.strictEqual(page.calendar.calendar.daily.events.length, 2);
    assert.strictEqual(page.calendar.calendar.daily.events[0].name, 'today');
    assert.strictEqual(page.calendar.calendar.daily.events[1].name, 'end-of-day ILM');
  });

  test('invalid date loads today #5342', async function (assert) {
    freezeDateAt(
      DateTime.fromObject({
        year: 2005,
        month: 6,
        day: 24,
      }).toJSDate(),
    );
    await page.visit({ view: 'day', date: 'somethinginvalid' });
    assert.strictEqual(currentRouteName(), 'dashboard.calendar');
    assert.strictEqual(page.calendar.calendar.daily.title.longDayOfWeek, 'Friday, June 24, 2005');
  });

  test('click month day number and go to day', async function (assert) {
    const aDayInTheMonth = DateTime.fromObject({ hour: 8 }).startOf('month').plus({ days: 12 });
    this.server.create('userevent', {
      user: this.user.id,
      name: 'start of month',
      startDate: aDayInTheMonth.toJSDate(),
      endDate: aDayInTheMonth.plus({ hour: 1 }).toJSDate(),
    });
    await page.visit({ view: 'month' });
    await page.calendar.calendar.monthly.days[aDayInTheMonth.day - 1].selectDay();
    assert.strictEqual(
      currentURL(),
      '/dashboard/calendar?date=' + aDayInTheMonth.toFormat('y-MM-dd') + '&view=day',
    );
  });

  test('click week day title and go to day', async function (assert) {
    const june24th2005 = DateTime.fromObject({
      year: 2005,
      month: 6,
      day: 24,
      hour: 8,
    });
    freezeDateAt(june24th2005.toJSDate());
    this.server.create('userevent', {
      user: this.user.id,
      name: 'today',
      startDate: june24th2005.toJSDate(),
      endDate: june24th2005.plus({ hour: 1 }).toJSDate(),
    });
    await page.visit({ show: 'calendar', view: 'week' });
    assert.strictEqual(page.calendar.calendar.weekly.dayHeadings.length, 7);
    await page.calendar.calendar.weekly.dayHeadings[0].selectDay();
    assert.strictEqual(currentURL(), '/dashboard/calendar?date=2005-06-19&view=day');
    await page.visit({ show: 'calendar', view: 'week' });
    await page.calendar.calendar.weekly.dayHeadings[5].selectDay();
    assert.strictEqual(currentURL(), '/dashboard/calendar?date=2005-06-24&view=day');
  });

  test('click forward on a day goes to next day', async function (assert) {
    const today = DateTime.fromObject({ hour: 8, minute: 8, second: 8 });
    this.server.create('userevent', {
      user: this.user.id,
      name: 'today',
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
    });
    await page.visit({ view: 'day' });
    await page.calendar.calendar.goForward.click();
    assert.strictEqual(
      currentURL(),
      '/dashboard/calendar?date=' + today.plus({ day: 1 }).toFormat('y-MM-dd') + '&view=day',
    );
  });

  test('click forward on a week goes to next week', async function (assert) {
    const today = DateTime.fromObject({ hour: 8, minute: 8, second: 8 });
    this.server.create('userevent', {
      user: this.user.id,
      name: 'today',
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
    });
    await page.visit({ view: 'week' });
    await page.calendar.calendar.goForward.click();
    assert.strictEqual(
      currentURL(),
      '/dashboard/calendar?date=' + today.plus({ week: 1 }).toFormat('y-MM-dd'),
    );
  });

  test('click forward on a month goes to next month', async function (assert) {
    const today = DateTime.fromObject({ hour: 8, minute: 8, second: 8 });
    this.server.create('userevent', {
      user: this.user.id,
      name: 'today',
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
    });
    await page.visit({ view: 'month' });
    await page.calendar.calendar.goForward.click();
    assert.strictEqual(
      currentURL(),
      '/dashboard/calendar?date=' + today.plus({ month: 1 }).toFormat('y-MM-dd') + '&view=month',
    );
  });

  test('click back on a day goes to previous day', async function (assert) {
    const today = DateTime.fromObject({ hour: 8, minute: 8, second: 8 });
    this.server.create('userevent', {
      user: this.user.id,
      name: 'today',
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
    });
    await page.visit({ view: 'day' });
    await page.calendar.calendar.goBack.click();
    assert.strictEqual(
      currentURL(),
      '/dashboard/calendar?date=' + today.minus({ day: 1 }).toFormat('y-MM-dd') + '&view=day',
    );
  });

  test('click back on a week goes to previous week', async function (assert) {
    const today = DateTime.fromObject({ hour: 8, minute: 8, second: 8 });
    this.server.create('userevent', {
      user: this.user.id,
      name: 'today',
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
    });
    await page.visit({ view: 'week' });
    await page.calendar.calendar.goBack.click();
    assert.strictEqual(
      currentURL(),
      '/dashboard/calendar?date=' + today.minus({ week: 1 }).toFormat('y-MM-dd'),
    );
  });

  test('click back on a month goes to previous month', async function (assert) {
    const today = DateTime.fromObject({ hour: 8, minute: 8, second: 8 });
    this.server.create('userevent', {
      user: this.user.id,
      name: 'today',
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
    });
    await page.visit({ view: 'month' });
    await page.calendar.calendar.goBack.click();
    assert.strictEqual(
      currentURL(),
      '/dashboard/calendar?date=' + today.minus({ month: 1 }).toFormat('y-MM-dd') + '&view=month',
    );
  });

  test('show user events', async function (assert) {
    const day = DateTime.fromObject({
      month: 4,
      day: 4,
      year: 2004,
      hour: 4,
      minute: 0,
      second: 7,
    });
    freezeDateAt(day.toJSDate());
    this.server.create('userevent', {
      user: this.user.id,
      startDate: day.toJSDate(),
      endDate: day.plus({ hour: 1 }).toJSDate(),
      offering: 1,
    });
    this.server.create('userevent', {
      user: this.user.id,
      startDate: day.toJSDate(),
      endDate: day.plus({ hour: 1 }).toJSDate(),
      offering: 2,
    });
    await page.visit({ show: 'calendar' });
    await takeScreenshot(assert);
    await percySnapshot(assert);
    assert.strictEqual(page.calendar.calendar.weekly.events.length, 2);
  });

  test('show school events', async function (assert) {
    const day = DateTime.fromObject({
      month: 7,
      day: 7,
      year: 2007,
      hour: 8,
      minute: 8,
      second: 8,
    });
    freezeDateAt(day.toJSDate());
    this.server.create('schoolevent', {
      school: 1,
      startDate: day.toJSDate(),
      endDate: day.plus({ hour: 1 }).toJSDate(),
      offering: 1,
    });
    this.server.create('schoolevent', {
      school: 1,
      startDate: day.toJSDate(),
      endDate: day.plus({ hour: 1 }).toJSDate(),
      offering: 2,
    });
    await page.visit();
    await page.calendar.controls.mySchedule.toggle.secondLabel.click();
    await takeScreenshot(assert);
    await percySnapshot(assert);
    assert.strictEqual(page.calendar.calendar.weekly.events.length, 2);
  });

  test('user context filters are not present on student-only user calendar', async function (assert) {
    await page.visit({ show: 'calendar' });
    assert.notOk(page.calendar.controls.userContextFilter.isPresent);
  });

  test('user context filters are present on user calendar for privileged users', async function (assert) {
    await setupAuthentication({ school: this.school }, true);
    await page.visit({ show: 'calendar' });
    await takeScreenshot(assert);
    await percySnapshot(assert);
    assert.ok(page.calendar.controls.userContextFilter.isPresent);
  });

  test('user context filters are not present on school calendar', async function (assert) {
    await setupAuthentication({ school: this.school }, true);
    await page.visit({ show: 'calendar' });
    assert.ok(page.calendar.controls.userContextFilter.isPresent);
    await page.calendar.controls.mySchedule.toggle.secondLabel.click();
    await takeScreenshot(assert);
    await percySnapshot(assert);
    assert.notOk(page.calendar.controls.userContextFilter.isPresent);
  });

  test('user context filters do not apply to school calendar', async function (assert) {
    this.user = await setupAuthentication({ school: this.school }, true);
    const day = DateTime.fromObject({
      month: 7,
      day: 7,
      year: 2007,
      hour: 8,
      minute: 8,
      second: 8,
    });
    freezeDateAt(day.toJSDate());
    this.server.create('schoolevent', {
      school: 1,
      startDate: day.toJSDate(),
      endDate: day.plus({ hour: 1 }).toJSDate(),
      offering: 1,
    });
    this.server.create('schoolevent', {
      school: 1,
      startDate: day.toJSDate(),
      endDate: day.plus({ hour: 1 }).toJSDate(),
      offering: 2,
    });
    await page.visit({ show: 'calendar' });
    // switch to the school calendar and verify that events are present
    await page.calendar.controls.mySchedule.toggle.secondLabel.click();
    assert.strictEqual(page.calendar.calendar.weekly.events.length, 2);
    // switch to the user calendar and apply a user context filter
    await page.calendar.controls.mySchedule.toggle.firstLabel.click();
    await page.calendar.controls.userContextFilter.learning.toggle();
    // switch to the school calendar and verify that nothing has changed
    await page.calendar.controls.mySchedule.toggle.secondLabel.click();
    assert.strictEqual(page.calendar.calendar.weekly.events.length, 2);
  });

  test('test user context filters', async function (assert) {
    this.user = await setupAuthentication({ school: this.school }, true);
    const day = DateTime.fromObject({
      month: 4,
      day: 4,
      year: 2004,
      hour: 4,
      minute: 0,
      second: 7,
    });
    freezeDateAt(day.toJSDate());
    this.server.create('userevent', {
      user: this.user.id,
      startDate: day.toJSDate(),
      endDate: day.plus({ hour: 1 }).toJSDate(),
      offering: 1,
      userContexts: ['learner'],
    });
    this.server.create('userevent', {
      user: this.user.id,
      startDate: day.plus({ hour: 1 }).toJSDate(),
      endDate: day.plus({ hour: 2 }).toJSDate(),
      offering: 2,
      userContexts: ['instructor'],
    });
    this.server.create('userevent', {
      user: this.user.id,
      startDate: day.plus({ hour: 2 }).toJSDate(),
      endDate: day.plus({ hour: 3 }).toJSDate(),
      offering: 3,
      userContexts: ['course director'],
    });
    await page.visit({ show: 'calendar' });
    assert.strictEqual(page.calendar.calendar.weekly.events.length, 3);
    assert.strictEqual(page.calendar.calendar.weekly.events[0].title, '04:00 AM event 0');
    assert.strictEqual(page.calendar.calendar.weekly.events[1].title, '05:00 AM event 1');
    assert.strictEqual(page.calendar.calendar.weekly.events[2].title, '06:00 AM event 2');
    await page.calendar.controls.userContextFilter.learning.toggle();
    assert.strictEqual(page.calendar.calendar.weekly.events.length, 1);
    assert.strictEqual(page.calendar.calendar.weekly.events[0].title, '04:00 AM event 0');
    await page.calendar.controls.userContextFilter.instructing.toggle();
    assert.strictEqual(page.calendar.calendar.weekly.events.length, 1);
    assert.strictEqual(page.calendar.calendar.weekly.events[0].title, '05:00 AM event 1');
    await page.calendar.controls.userContextFilter.admin.toggle();
    assert.strictEqual(page.calendar.calendar.weekly.events.length, 1);
    assert.strictEqual(page.calendar.calendar.weekly.events[0].title, '06:00 AM event 2');
    await page.calendar.controls.userContextFilter.admin.toggle();
    assert.strictEqual(page.calendar.calendar.weekly.events.length, 3);
  });

  test('user context filter selections persist across page reloads', async function (assert) {
    this.user = await setupAuthentication({ school: this.school }, true);
    const day = DateTime.fromObject({
      month: 4,
      day: 4,
      year: 2004,
      hour: 4,
      minute: 0,
      second: 7,
    });
    freezeDateAt(day.toJSDate());
    this.server.create('userevent', {
      user: this.user.id,
      startDate: day.toJSDate(),
      endDate: day.plus({ hour: 1 }).toJSDate(),
      offering: 1,
      userContexts: ['learner'],
    });
    this.server.create('userevent', {
      user: this.user.id,
      startDate: day.plus({ hour: 1 }).toJSDate(),
      endDate: day.plus({ hour: 2 }).toJSDate(),
      offering: 2,
      userContexts: ['instructor'],
    });
    this.server.create('userevent', {
      user: this.user.id,
      startDate: day.plus({ hour: 2 }).toJSDate(),
      endDate: day.plus({ hour: 3 }).toJSDate(),
      offering: 3,
      userContexts: ['course director'],
    });
    await page.visit({ show: 'calendar' });
    assert.ok(page.calendar.controls.userContextFilter.learning.isActive);
    assert.ok(page.calendar.controls.userContextFilter.instructing.isActive);
    assert.ok(page.calendar.controls.userContextFilter.admin.isActive);

    await page.calendar.controls.userContextFilter.learning.toggle();
    assert.ok(page.calendar.controls.userContextFilter.learning.isActive);
    assert.notOk(page.calendar.controls.userContextFilter.instructing.isActive);
    assert.notOk(page.calendar.controls.userContextFilter.admin.isActive);

    await page.visit({ show: 'calendar' });
    assert.ok(page.calendar.controls.userContextFilter.learning.isActive);
    assert.notOk(page.calendar.controls.userContextFilter.instructing.isActive);
    assert.notOk(page.calendar.controls.userContextFilter.admin.isActive);

    await page.calendar.controls.userContextFilter.instructing.toggle();
    assert.notOk(page.calendar.controls.userContextFilter.learning.isActive);
    assert.ok(page.calendar.controls.userContextFilter.instructing.isActive);
    assert.notOk(page.calendar.controls.userContextFilter.admin.isActive);

    await page.visit({ show: 'calendar' });
    assert.notOk(page.calendar.controls.userContextFilter.learning.isActive);
    assert.ok(page.calendar.controls.userContextFilter.instructing.isActive);
    assert.notOk(page.calendar.controls.userContextFilter.admin.isActive);

    await page.calendar.controls.userContextFilter.admin.toggle();
    assert.notOk(page.calendar.controls.userContextFilter.learning.isActive);
    assert.notOk(page.calendar.controls.userContextFilter.instructing.isActive);
    assert.ok(page.calendar.controls.userContextFilter.admin.isActive);

    await page.visit({ show: 'calendar' });
    assert.notOk(page.calendar.controls.userContextFilter.learning.isActive);
    assert.notOk(page.calendar.controls.userContextFilter.instructing.isActive);
    assert.ok(page.calendar.controls.userContextFilter.admin.isActive);

    await page.calendar.controls.userContextFilter.admin.toggle();
    assert.ok(page.calendar.controls.userContextFilter.learning.isActive);
    assert.ok(page.calendar.controls.userContextFilter.instructing.isActive);
    assert.ok(page.calendar.controls.userContextFilter.admin.isActive);

    await page.visit({ show: 'calendar' });
    assert.ok(page.calendar.controls.userContextFilter.learning.isActive);
    assert.ok(page.calendar.controls.userContextFilter.instructing.isActive);
    assert.ok(page.calendar.controls.userContextFilter.admin.isActive);
  });

  test('filter toggle not present on my-schedule', async function (assert) {
    await setupAuthentication({ school: this.school }, true);
    await page.visit({ show: 'calendar' });
    assert.notOk(page.calendar.controls.showFilters.isPresent);
    await page.calendar.controls.mySchedule.toggle.secondLabel.click();
    assert.ok(page.calendar.controls.showFilters.isPresent);
  });

  test('test session type filter', async function (assert) {
    const today = DateTime.fromObject({ hour: 8, minute: 8, second: 8 });
    this.server.create('schoolevent', {
      school: this.school.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      sessionTypeId: 1,
    });
    this.server.create('schoolevent', {
      school: this.school.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      sessionTypeId: 2,
    });
    await page.visit({ show: 'calendar', view: 'week', mySchedule: false });
    await page.calendar.controls.showFilters.toggle.secondLabel.click();
    assert.strictEqual(page.calendar.calendar.weekly.events.length, 2);
    await page.calendar.controls.filters.sessionTypesFilter.sessionTypes[0].click();
    assert.strictEqual(page.calendar.calendar.weekly.events.length, 1);
    await page.calendar.controls.filters.sessionTypesFilter.sessionTypes[1].click();
    assert.strictEqual(page.calendar.calendar.weekly.events.length, 2);

    await page.calendar.controls.filters.sessionTypesFilter.sessionTypes[0].click();
    await page.calendar.controls.filters.sessionTypesFilter.sessionTypes[1].click();
    await page.calendar.controls.filters.sessionTypesFilter.sessionTypes[2].click();
    assert.strictEqual(page.calendar.calendar.weekly.events.length, 0);
  });

  test('test session type filter resets when switching to my-schedule', async function (assert) {
    const today = DateTime.fromObject({ hour: 8, minute: 8, second: 8 });
    this.server.create('schoolevent', {
      school: this.school.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      sessionTypeId: 1,
    });
    this.server.create('schoolevent', {
      school: this.school.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      sessionTypeId: 2,
    });
    await page.visit({ show: 'calendar', view: 'week', mySchedule: false });
    await page.calendar.controls.showFilters.toggle.secondLabel.click();
    await page.calendar.controls.filters.sessionTypesFilter.sessionTypes[0].click();

    assert.strictEqual(
      currentURL(),
      '/dashboard/calendar?mySchedule=false&sessionTypes=1&showFilters=true',
    );
    await page.calendar.controls.mySchedule.toggle.firstLabel.click();
    assert.strictEqual(currentURL(), '/dashboard/calendar');
  });

  test('test course level filter', async function (assert) {
    const today = DateTime.fromObject({ hour: 8, minute: 8, second: 8 });
    this.server.create('schoolevent', {
      school: this.school.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      courseLevel: 1,
    });
    this.server.create('schoolevent', {
      school: this.school.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      courseLevel: 1,
    });
    await page.visit({ show: 'calendar', view: 'week', mySchedule: false });
    await page.calendar.controls.showFilters.toggle.secondLabel.click();
    await page.calendar.controls.showCourseFilters.toggle.secondLabel.click();
    assert.strictEqual(page.calendar.calendar.weekly.events.length, 2);
    await page.calendar.controls.filters.courseLevelsFilter.courseLevels[0].click();
    assert.strictEqual(page.calendar.calendar.weekly.events.length, 2);
    await page.calendar.filterTags.clearAll.click();
    await page.calendar.controls.filters.courseLevelsFilter.courseLevels[1].click();
    assert.strictEqual(page.calendar.calendar.weekly.events.length, 0);
  });

  test('test course level filter resets when switching to my-schedule', async function (assert) {
    const today = DateTime.fromObject({ hour: 8, minute: 8, second: 8 });
    this.server.create('schoolevent', {
      school: this.school.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      courseLevel: 1,
    });
    this.server.create('schoolevent', {
      school: this.school.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      courseLevel: 1,
    });
    await page.visit({ show: 'calendar', view: 'week', mySchedule: false });
    await page.calendar.controls.showFilters.toggle.secondLabel.click();
    await page.calendar.controls.showCourseFilters.toggle.secondLabel.click();
    await page.calendar.controls.filters.courseLevelsFilter.courseLevels[0].click();

    assert.strictEqual(
      currentURL(),
      '/dashboard/calendar?courseFilters=false&courseLevels=1&mySchedule=false&showFilters=true',
    );
    await page.calendar.controls.mySchedule.toggle.firstLabel.click();
    assert.strictEqual(currentURL(), '/dashboard/calendar');
  });

  test('test cohort filter', async function (assert) {
    const today = DateTime.fromObject({ hour: 8, minute: 8, second: 8 });
    this.server.create('schoolevent', {
      school: this.school.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      cohorts: [{ id: 1 }],
    });
    this.server.create('schoolevent', {
      school: this.school.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      cohorts: [{ id: 1 }],
    });
    await page.visit({ show: 'calendar', view: 'week', mySchedule: false });
    await page.calendar.controls.showFilters.toggle.secondLabel.click();
    await page.calendar.controls.showCourseFilters.toggle.secondLabel.click();
    assert.strictEqual(page.calendar.calendar.weekly.events.length, 2);

    await page.calendar.controls.filters.cohortsFilter.cohorts[1].toggle();
    assert.strictEqual(page.calendar.calendar.weekly.events.length, 2);

    await page.calendar.controls.filters.cohortsFilter.cohorts[0].toggle();
    await page.calendar.controls.filters.cohortsFilter.cohorts[1].toggle();
    assert.strictEqual(page.calendar.calendar.weekly.events.length, 0);
  });

  test('test cohort level filter resets when switching to my-schedule', async function (assert) {
    const today = DateTime.fromObject({ hour: 8, minute: 8, second: 8 });
    this.server.create('schoolevent', {
      school: this.school.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      cohorts: [{ id: 1 }],
    });
    this.server.create('schoolevent', {
      school: this.school.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      cohorts: [{ id: 1 }],
    });
    await page.visit({ show: 'calendar', view: 'week', mySchedule: false });
    await page.calendar.controls.showFilters.toggle.secondLabel.click();
    await page.calendar.controls.showCourseFilters.toggle.secondLabel.click();
    assert.strictEqual(page.calendar.calendar.weekly.events.length, 2);

    await page.calendar.controls.filters.cohortsFilter.cohorts[1].toggle();
    assert.strictEqual(
      currentURL(),
      '/dashboard/calendar?cohorts=1&courseFilters=false&mySchedule=false&showFilters=true',
    );
    await page.calendar.controls.mySchedule.toggle.firstLabel.click();
    assert.strictEqual(currentURL(), '/dashboard/calendar');
  });

  test('test cohort filter on page load ilios/ilios#5699', async function (assert) {
    const today = DateTime.fromObject({ hour: 8, minute: 8, second: 8 });
    this.server.create('schoolevent', {
      school: this.school.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      cohorts: [{ id: 1 }],
    });
    this.server.create('schoolevent', {
      school: this.school.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      cohorts: [{ id: 1 }],
    });
    await page.visit({ show: 'calendar', view: 'week', cohorts: 2, mySchedule: false });
    await page.calendar.controls.showFilters.toggle.secondLabel.click();
    await page.calendar.controls.showCourseFilters.toggle.secondLabel.click();
    assert.ok(page.calendar.controls.filters.cohortsFilter.cohorts[0].isChecked);
    assert.notOk(page.calendar.controls.filters.cohortsFilter.cohorts[1].isChecked);
    assert.strictEqual(page.calendar.calendar.weekly.events.length, 0);
  });

  test('test course filter', async function (assert) {
    const today = DateTime.fromObject({ hour: 8, minute: 8, second: 8 });
    this.server.create('schoolevent', {
      school: this.school.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      course: 1,
    });
    this.server.create('schoolevent', {
      school: this.school.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      course: 2,
    });
    this.server.create('schoolevent', {
      school: this.school.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      course: 1,
    });
    await page.visit({ show: 'calendar', view: 'week', mySchedule: false });
    await page.calendar.controls.showFilters.toggle.secondLabel.click();
    assert.strictEqual(page.calendar.calendar.weekly.events.length, 3);
    await page.calendar.controls.filters.coursesFilter.years[0].courses[0].toggle();
    assert.strictEqual(page.calendar.calendar.weekly.events.length, 2);
    await page.calendar.controls.filters.coursesFilter.years[0].courses[0].toggle();
    await page.calendar.controls.filters.coursesFilter.years[0].courses[1].toggle();
    assert.strictEqual(page.calendar.calendar.weekly.events.length, 1);
  });

  test('test course filter resets when switching to my-schedule', async function (assert) {
    const today = DateTime.fromObject({ hour: 8, minute: 8, second: 8 });
    this.server.create('schoolevent', {
      school: this.school.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      course: 1,
    });
    this.server.create('schoolevent', {
      school: this.school.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      course: 2,
    });
    this.server.create('schoolevent', {
      school: this.school.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      course: 1,
    });
    await page.visit({ show: 'calendar', view: 'week', mySchedule: false });
    await page.calendar.controls.showFilters.toggle.secondLabel.click();
    await page.calendar.controls.filters.coursesFilter.years[0].courses[0].toggle();

    assert.strictEqual(
      currentURL(),
      '/dashboard/calendar?courses=1&mySchedule=false&showFilters=true',
    );
    await page.calendar.controls.mySchedule.toggle.firstLabel.click();
    assert.strictEqual(currentURL(), '/dashboard/calendar');
  });

  test('test course and session type filter together', async function (assert) {
    const today = DateTime.fromObject({ hour: 8, minute: 8, second: 8 });
    this.server.create('schoolevent', {
      school: this.school.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      course: 1,
      sessionTypeId: 1,
    });
    this.server.create('schoolevent', {
      school: this.school.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      course: 2,
      sessionTypeId: 2,
    });
    this.server.create('schoolevent', {
      school: this.school.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      course: 1,
      sessionTypeId: 2,
    });
    await page.visit({ show: 'calendar', view: 'week', mySchedule: false });
    await page.calendar.controls.showFilters.toggle.secondLabel.click();

    assert.strictEqual(page.calendar.calendar.weekly.events.length, 3);
    await page.calendar.controls.filters.coursesFilter.years[0].courses[0].toggle();
    assert.strictEqual(page.calendar.calendar.weekly.events.length, 2);
    await page.calendar.controls.filters.coursesFilter.years[0].courses[0].toggle();
    await page.calendar.controls.filters.coursesFilter.years[0].courses[0].toggle();
    await page.calendar.controls.filters.sessionTypesFilter.sessionTypes[0].click();
    assert.strictEqual(page.calendar.calendar.weekly.events.length, 1);
  });

  test('clear all filters', async function (assert) {
    const vocabulary = this.server.create('vocabulary', {
      school: this.school,
    });
    this.server.createList('term', 2, {
      vocabulary,
    });

    await page.visit({ show: 'calendar', view: 'week', mySchedule: false });
    await page.calendar.controls.showFilters.toggle.secondLabel.click();
    assert.notOk(page.calendar.filterTags.clearAll.isPresent);
    assert.strictEqual(page.calendar.filterTags.tags.length, 0);

    await page.calendar.controls.filters.sessionTypesFilter.sessionTypes[0].click();
    assert.strictEqual(page.calendar.filterTags.tags.length, 1);
    await page.calendar.controls.filters.coursesFilter.years[0].courses[0].toggle();
    assert.strictEqual(page.calendar.filterTags.tags.length, 2);
    await page.calendar.controls.filters.vocabularyFilter.vocabularies[0].selectedTermTree.checkboxes[0].click();
    assert.strictEqual(page.calendar.filterTags.tags.length, 3);

    assert.ok(page.calendar.filterTags.clearAll.isPresent);
    assert.strictEqual(page.calendar.filterTags.clearAll.text, 'Clear Filters');
    assert.strictEqual(page.calendar.filterTags.tags[0].text, '2015 course 0');
    assert.strictEqual(page.calendar.filterTags.tags[1].text, 'session type 0');
    assert.strictEqual(page.calendar.filterTags.tags[2].text, 'Vocabulary 1 > term 0');
    assert.ok(page.calendar.controls.filters.sessionTypesFilter.sessionTypes[0].isChecked);
    assert.ok(page.calendar.controls.filters.coursesFilter.years[0].courses[0].isChecked);
    assert.ok(
      page.calendar.controls.filters.vocabularyFilter.vocabularies[0].selectedTermTree.checkboxes[0]
        .isChecked,
    );

    await page.calendar.filterTags.clearAll.click();

    assert.notOk(page.calendar.filterTags.clearAll.isPresent);
    assert.strictEqual(page.calendar.filterTags.tags.length, 0);
    assert.notOk(page.calendar.controls.filters.sessionTypesFilter.sessionTypes[0].isChecked);
    assert.notOk(page.calendar.controls.filters.coursesFilter.years[0].courses[0].isChecked);
    assert.notOk(
      page.calendar.controls.filters.vocabularyFilter.vocabularies[0].selectedTermTree.checkboxes[0]
        .isChecked,
    );
  });

  test('clear all detail filters', async function (assert) {
    await page.visit({ show: 'calendar', view: 'week', mySchedule: false });
    await page.calendar.controls.showFilters.toggle.secondLabel.click();
    await page.calendar.controls.showCourseFilters.toggle.secondLabel.click();
    assert.notOk(page.calendar.filterTags.clearAll.isPresent);

    await page.calendar.controls.filters.sessionTypesFilter.sessionTypes[0].click();
    assert.strictEqual(page.calendar.filterTags.tags.length, 1);
    await page.calendar.controls.filters.courseLevelsFilter.courseLevels[0].click();
    assert.strictEqual(page.calendar.filterTags.tags.length, 2);
    await page.calendar.controls.filters.cohortsFilter.cohorts[0].toggle();
    assert.strictEqual(page.calendar.filterTags.tags.length, 3);

    assert.ok(page.calendar.filterTags.clearAll.isPresent);
    assert.strictEqual(page.calendar.filterTags.tags[0].text, 'cohort 1 program 0');
    assert.strictEqual(page.calendar.filterTags.tags[1].text, 'Course Level 1');
    assert.strictEqual(page.calendar.filterTags.tags[2].text, 'session type 0');
    assert.ok(page.calendar.controls.filters.sessionTypesFilter.sessionTypes[0].isChecked);
    assert.ok(page.calendar.controls.filters.courseLevelsFilter.courseLevels[0].isChecked);
    assert.ok(page.calendar.controls.filters.cohortsFilter.cohorts[0].isChecked);

    await page.calendar.filterTags.clearAll.click();

    assert.notOk(page.calendar.filterTags.clearAll.isPresent);
    assert.notOk(page.calendar.controls.filters.sessionTypesFilter.sessionTypes[0].isChecked);
    assert.notOk(page.calendar.controls.filters.courseLevelsFilter.courseLevels[0].isChecked);
    assert.notOk(page.calendar.controls.filters.cohortsFilter.cohorts[0].isChecked);
  });

  test('filter tags work properly', async function (assert) {
    await page.visit({ show: 'calendar', view: 'week', mySchedule: false });
    await page.calendar.controls.showFilters.toggle.secondLabel.click();
    await page.calendar.controls.showCourseFilters.toggle.secondLabel.click();
    assert.notOk(page.calendar.filterTags.clearAll.isPresent);

    await page.calendar.controls.filters.sessionTypesFilter.sessionTypes[0].click();
    await page.calendar.controls.filters.courseLevelsFilter.courseLevels[0].click();
    await page.calendar.controls.filters.cohortsFilter.cohorts[0].toggle();

    assert.ok(page.calendar.filterTags.clearAll.isPresent);
    assert.strictEqual(page.calendar.filterTags.tags.length, 3);
    assert.strictEqual(page.calendar.filterTags.tags[0].text, 'cohort 1 program 0');
    assert.strictEqual(page.calendar.filterTags.tags[1].text, 'Course Level 1');
    assert.strictEqual(page.calendar.filterTags.tags[2].text, 'session type 0');
    assert.ok(page.calendar.controls.filters.sessionTypesFilter.sessionTypes[0].isChecked);
    assert.ok(page.calendar.controls.filters.courseLevelsFilter.courseLevels[0].isChecked);
    assert.ok(page.calendar.controls.filters.cohortsFilter.cohorts[0].isChecked);

    await page.calendar.filterTags.tags[0].click();

    assert.ok(page.calendar.filterTags.clearAll.isPresent);
    assert.strictEqual(page.calendar.filterTags.tags.length, 2);
    assert.strictEqual(page.calendar.filterTags.tags[0].text, 'Course Level 1');
    assert.strictEqual(page.calendar.filterTags.tags[1].text, 'session type 0');
    assert.ok(page.calendar.controls.filters.sessionTypesFilter.sessionTypes[0].isChecked);
    assert.ok(page.calendar.controls.filters.courseLevelsFilter.courseLevels[0].isChecked);
    assert.notOk(page.calendar.controls.filters.cohortsFilter.cohorts[0].isChecked);

    await page.calendar.filterTags.tags[0].click();

    assert.ok(page.calendar.filterTags.clearAll.isPresent);
    assert.strictEqual(page.calendar.filterTags.tags.length, 1);
    assert.strictEqual(page.calendar.filterTags.tags[0].text, 'session type 0');
    assert.ok(page.calendar.controls.filters.sessionTypesFilter.sessionTypes[0].isChecked);
    assert.notOk(page.calendar.controls.filters.courseLevelsFilter.courseLevels[0].isChecked);
    assert.notOk(page.calendar.controls.filters.cohortsFilter.cohorts[0].isChecked);

    await page.calendar.filterTags.tags[0].click();

    assert.notOk(page.calendar.filterTags.clearAll.isPresent);
    assert.strictEqual(page.calendar.filterTags.tags.length, 0);
    assert.notOk(page.calendar.controls.filters.sessionTypesFilter.sessionTypes[0].isChecked);
    assert.notOk(page.calendar.controls.filters.courseLevelsFilter.courseLevels[0].isChecked);
    assert.notOk(page.calendar.controls.filters.cohortsFilter.cohorts[0].isChecked);
  });

  test('calendar is active in dashboard navigation', async function (assert) {
    await page.visit();
    assert.ok(page.navigation.calendar.isActive);
    assert.notOk(page.navigation.materials.isActive);
    assert.notOk(page.navigation.week.isActive);
  });

  test('test term filter', async function (assert) {
    const vocabulary = this.server.create('vocabulary', {
      school: this.school,
    });
    this.server.create('term', {
      vocabulary,
      sessionIds: [1, 2],
    });
    this.server.create('term', {
      vocabulary,
    });
    const today = DateTime.fromObject({ hour: 8, minute: 8, second: 8 });
    this.server.create('schoolevent', {
      school: this.school.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      sessionTerms: [{ id: 1 }],
    });
    this.server.create('schoolevent', {
      school: this.school.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      sessionTerms: [{ id: 1 }],
    });
    await page.visit({ show: 'calendar', view: 'week', mySchedule: false });
    await page.calendar.controls.showFilters.toggle.secondLabel.click();
    assert.strictEqual(page.calendar.calendar.weekly.events.length, 2);
    await page.calendar.controls.filters.vocabularyFilter.vocabularies[0].selectedTermTree.checkboxes[0].click();
    assert.strictEqual(page.calendar.calendar.weekly.events.length, 2);
    await page.calendar.controls.filters.vocabularyFilter.vocabularies[0].selectedTermTree.checkboxes[0].click();
    await page.calendar.controls.filters.vocabularyFilter.vocabularies[0].selectedTermTree.checkboxes[1].click();
    assert.strictEqual(page.calendar.calendar.weekly.events.length, 0);
  });

  test('test term filter resets when switching to my-schedule', async function (assert) {
    const vocabulary = this.server.create('vocabulary', {
      school: this.school,
    });
    this.server.create('term', {
      vocabulary,
      sessionIds: [1, 2],
    });
    this.server.create('term', {
      vocabulary,
    });
    const today = DateTime.fromObject({ hour: 8, minute: 8, second: 8 });
    this.server.create('schoolevent', {
      school: this.school.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      sessionTerms: [{ id: 1 }],
    });
    this.server.create('schoolevent', {
      school: this.school.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      sessionTerms: [{ id: 1 }],
    });
    await page.visit({ show: 'calendar', view: 'week', mySchedule: false });
    await page.calendar.controls.showFilters.toggle.secondLabel.click();
    await page.calendar.controls.filters.vocabularyFilter.vocabularies[0].selectedTermTree.checkboxes[0].click();

    assert.strictEqual(
      currentURL(),
      '/dashboard/calendar?mySchedule=false&showFilters=true&terms=1',
    );
    await page.calendar.controls.mySchedule.toggle.firstLabel.click();
    assert.strictEqual(currentURL(), '/dashboard/calendar');
  });

  test('clear vocab filter #3450', async function (assert) {
    const vocabulary = this.server.create('vocabulary', {
      school: this.school,
    });
    this.server.create('term', {
      vocabulary,
      sessionIds: [1],
    });
    const today = DateTime.fromObject({ hour: 8, minute: 8, second: 8 });
    this.server.create('schoolevent', {
      school: this.school.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      sessionTerms: [{ id: 1 }],
    });
    this.server.create('schoolevent', {
      school: this.school.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      sessionTerms: [],
    });

    await page.visit({ show: 'calendar', view: 'week', mySchedule: false });
    await page.calendar.controls.showFilters.toggle.secondLabel.click();
    assert.strictEqual(page.calendar.calendar.weekly.events.length, 2);
    await page.calendar.controls.filters.vocabularyFilter.vocabularies[0].selectedTermTree.checkboxes[0].click();
    assert.strictEqual(page.calendar.calendar.weekly.events.length, 1);

    assert.strictEqual(page.calendar.filterTags.tags.length, 1);
    await page.calendar.filterTags.tags[0].click();
    assert.strictEqual(page.calendar.filterTags.tags.length, 0);
    assert.strictEqual(page.calendar.calendar.weekly.events.length, 2);
  });

  test('test tooltip', async function (assert) {
    const november11th = DateTime.fromObject({ month: 11, day: 11, hour: 8, minute: 8, second: 8 });
    this.server.create('userevent', {
      user: this.user.id,
      startDate: november11th.toJSDate(),
      endDate: november11th.plus({ hour: 1 }).toJSDate(),
      offering: 1,
    });
    await page.visit({ show: 'calendar', view: 'week', date: november11th.toFormat('yyyy-LL-dd') });
    assert.notOk(page.calendar.calendar.weekly.events[0].tooltip.isPresent);

    await page.calendar.calendar.weekly.events[0].mouseOver();
    await takeScreenshot(assert);
    await percySnapshot(assert);
    assert.ok(page.calendar.calendar.weekly.events[0].tooltip.isPresent);
  });

  test('visit with course filters open #5098', async function (assert) {
    const today = DateTime.fromObject({ hour: 8, minute: 8, second: 8 });
    this.server.create('userevent', {
      user: this.user.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      cohorts: [{ id: 1 }],
    });
    await page.visit({
      show: 'calendar',
      view: 'week',
      showFilters: 'true',
      courseFilters: 'true',
    });
    assert.strictEqual(page.calendar.calendar.weekly.events.length, 1);
  });

  test('visit with detail filters open #5098', async function (assert) {
    const today = DateTime.fromObject({ hour: 8, minute: 8, second: 8 });
    this.server.create('userevent', {
      user: this.user.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      cohorts: [{ id: 1 }],
    });
    await page.visit({
      show: 'calendar',
      view: 'week',
      showFilters: 'true',
      courseFilters: 'false',
    });
    assert.strictEqual(page.calendar.calendar.weekly.events.length, 1);
  });

  test('transition from weekly calendar to day calendar when multi-event is clicked', async function (assert) {
    const today = DateTime.fromObject({ hour: 8, minute: 8, second: 8 });
    freezeDateAt(today.toJSDate());
    this.server.create('userevent', {
      name: 'multi-event',
      user: this.user.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      offering: 1,
    });
    this.server.create('userevent', {
      name: 'multi-event',
      user: this.user.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      offering: 1,
    });
    await page.visit({ show: 'calendar', view: 'week' });
    assert.strictEqual(page.calendar.calendar.weekly.events.length, 1);
    await page.calendar.calendar.weekly.events[0].click();
    assert.strictEqual(
      currentURL(),
      `/dashboard/calendar?date=${today.toFormat('yyyy-MM-dd')}&view=day`,
    );
    assert.strictEqual(page.calendar.calendar.daily.events.length, 2);
  });

  test('transition from monthly calendar to day calendar when multi-event is clicked', async function (assert) {
    const today = DateTime.fromObject({ hour: 8, minute: 8, second: 8 });
    freezeDateAt(today.toJSDate());
    this.server.create('userevent', {
      name: 'multi-event',
      user: this.user.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      offering: 1,
    });
    this.server.create('userevent', {
      name: 'multi-event',
      user: this.user.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      offering: 1,
    });
    await page.visit({ show: 'calendar', view: 'month' });
    assert.strictEqual(page.calendar.calendar.monthly.events.length, 1);
    await page.calendar.calendar.monthly.events[0].click();
    assert.strictEqual(
      currentURL(),
      `/dashboard/calendar?date=${today.toFormat('yyyy-MM-dd')}&view=day`,
    );
    assert.strictEqual(page.calendar.calendar.daily.events.length, 2);
  });
});
