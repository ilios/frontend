import {
  click,
  findAll,
  find,
  currentURL,
  currentRouteName,
  visit,
  triggerEvent,
} from '@ember/test-helpers';
import { isEmpty } from '@ember/utils';
import { DateTime } from 'luxon';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'dummy/tests/helpers';
import { map } from 'rsvp';
import page from 'ilios-common/page-objects/dashboard-calendar';
import { freezeDateAt, unfreezeDate } from 'ilios-common';

module('Acceptance | Dashboard Calendar', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
    const program = this.server.create('program', {
      school: this.school,
    });
    const programYear1 = this.server.create('programYear', {
      program,
      startYear: 2015,
    });
    const programYear2 = this.server.create('programYear', {
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
    this.server.create('academicYear', {
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
  });

  hooks.afterEach(() => {
    unfreezeDate();
  });

  test('load month calendar', async function (assert) {
    const today = DateTime.fromObject({ hour: 8, minute: 8, second: 8 });
    const startOfMonth = today.startOf('month');
    const endOfMonth = today.endOf('month').set({ hour: 22, minute: 59 });
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
    await visit('/dashboard/calendar?view=month');
    assert.strictEqual(currentRouteName(), 'dashboard.calendar');
    const events = findAll('[data-test-ilios-calendar-event]');
    assert.strictEqual(events.length, 2);
    const startOfMonthStartFormat = this.intl.formatTime(startOfMonth.toJSDate(), {
      hour: 'numeric',
      minute: 'numeric',
    });
    const startOfMonthEndFormat = this.intl.formatTime(startOfMonth.plus({ hour: 1 }).toJSDate(), {
      hour: 'numeric',
      minute: 'numeric',
    });
    assert
      .dom(events[0])
      .hasText(`${startOfMonthStartFormat} - ${startOfMonthEndFormat} : start of month`);
    const endOfMonthStartFormat = this.intl.formatTime(endOfMonth.toJSDate(), {
      hour: 'numeric',
      minute: 'numeric',
    });
    const endOfMonthEndFormat = this.intl.formatTime(endOfMonth.plus({ hour: 1 }).toJSDate(), {
      hour: 'numeric',
      minute: 'numeric',
    });
    assert
      .dom(events[1])
      .hasText(`${endOfMonthStartFormat} - ${endOfMonthEndFormat} : end of month`);
  });

  test('load week calendar', async function (assert) {
    const startOfWeek = DateTime.fromJSDate(
      this.owner.lookup('service:locale-days').firstDayOfThisWeek
    );
    const endOfWeek = DateTime.fromJSDate(
      this.owner.lookup('service:locale-days').lastDayOfThisWeek
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

    assert.strictEqual(page.calendar.weeklyCalendar.dayHeadings.length, 7);
    assert.ok(page.calendar.weeklyCalendar.dayHeadings[0].isFirstDayOfWeek);
    assert.strictEqual(
      page.calendar.weeklyCalendar.dayHeadings[0].text,
      `Sunday Sun ${longDayHeading} ${shortDayHeading}`
    );

    assert.strictEqual(page.calendar.weeklyCalendar.events.length, 2);
    assert.ok(page.calendar.weeklyCalendar.events[0].isFirstDayOfWeek);
    assert.strictEqual(page.calendar.weeklyCalendar.events[0].name, 'start of week');
    assert.ok(page.calendar.weeklyCalendar.events[1].isSeventhDayOfWeek);
    assert.strictEqual(page.calendar.weeklyCalendar.events[1].name, 'end of week');
  });

  test('load week calendar on Sunday', async function (assert) {
    freezeDateAt(
      DateTime.fromObject({
        year: 2022,
        month: 10,
        day: 9,
        hour: 10,
      }).toJSDate()
    );
    const startOfWeek = DateTime.fromJSDate(
      this.owner.lookup('service:locale-days').firstDayOfThisWeek
    );
    const endOfWeek = DateTime.fromJSDate(
      this.owner.lookup('service:locale-days').lastDayOfThisWeek
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

    assert.strictEqual(page.calendar.weeklyCalendar.dayHeadings.length, 7);
    assert.ok(page.calendar.weeklyCalendar.dayHeadings[0].isFirstDayOfWeek);
    assert.strictEqual(
      page.calendar.weeklyCalendar.dayHeadings[0].text,
      `Sunday Sun ${longDayHeading} ${shortDayHeading}`
    );

    assert.strictEqual(page.calendar.weeklyCalendar.longWeekOfYear, 'Week of October 9, 2022');
    assert.strictEqual(page.calendar.weeklyCalendar.events.length, 2);
    assert.ok(page.calendar.weeklyCalendar.events[0].isFirstDayOfWeek);
    assert.strictEqual(page.calendar.weeklyCalendar.events[0].name, 'start of week');
    assert.ok(page.calendar.weeklyCalendar.events[1].isSeventhDayOfWeek);
    assert.strictEqual(page.calendar.weeklyCalendar.events[1].name, 'end of week');
  });

  test('load day calendar', async function (assert) {
    const today = DateTime.fromObject({ hour: 8, minute: 8, second: 8 });
    const tomorow = today.plus({ day: 1 });
    const yesterday = today.minus({ day: 1 });
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
    await visit('/dashboard/calendar?view=day');
    assert.strictEqual(currentRouteName(), 'dashboard.calendar');

    assert.strictEqual(page.calendar.dailyCalendar.events.length, 1);
    assert.strictEqual(page.calendar.dailyCalendar.events[0].name, 'today');
  });

  test('click month day number and go to day', async function (assert) {
    const aDayInTheMonth = DateTime.fromObject({ hour: 8 }).startOf('month').plus({ days: 12 });
    this.server.create('userevent', {
      user: this.user.id,
      name: 'start of month',
      startDate: aDayInTheMonth.toJSDate(),
      endDate: aDayInTheMonth.plus({ hour: 1 }).toJSDate(),
    });
    await visit('/dashboard/calendar?view=month');
    await click(`[data-test-day-button="${aDayInTheMonth.day}"]`);
    assert.strictEqual(
      currentURL(),
      '/dashboard/calendar?date=' + aDayInTheMonth.toFormat('y-MM-dd') + '&view=day'
    );
  });

  test('click week day title and go to day', async function (assert) {
    const today = DateTime.fromObject({ hour: 8, minute: 8, second: 8 });
    this.server.create('userevent', {
      user: this.user.id,
      name: 'today',
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
    });
    await page.visit({ show: 'calendar', view: 'week' });
    assert.strictEqual(page.calendar.weeklyCalendar.dayHeadings.length, 7);
    await page.calendar.weeklyCalendar.dayHeadings[today.weekday].selectDay();
    assert.strictEqual(
      currentURL(),
      '/dashboard/calendar?date=' + today.toFormat('y-MM-dd') + '&view=day'
    );
  });

  test('click forward on a day goes to next day', async function (assert) {
    const today = DateTime.fromObject({ hour: 8, minute: 8, second: 8 });
    this.server.create('userevent', {
      user: this.user.id,
      name: 'today',
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
    });
    await visit('/dashboard/calendar?view=day');
    await click('.calendar-time-picker li:nth-of-type(3) a');
    assert.strictEqual(
      currentURL(),
      '/dashboard/calendar?date=' + today.plus({ day: 1 }).toFormat('y-MM-dd') + '&view=day'
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
    await visit('/dashboard/calendar?view=week');
    await click('.calendar-time-picker li:nth-of-type(3) a');
    assert.strictEqual(
      currentURL(),
      '/dashboard/calendar?date=' + today.plus({ week: 1 }).toFormat('y-MM-dd')
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
    await visit('/dashboard/calendar?view=month');
    await click('.calendar-time-picker li:nth-of-type(3) a');
    await click(findAll('.calendar-time-picker li')[2]);
    assert.strictEqual(
      currentURL(),
      '/dashboard/calendar?date=' + today.plus({ month: 1 }).toFormat('y-MM-dd') + '&view=month'
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
    await visit('/dashboard/calendar?view=day');
    await click('.calendar-time-picker li:nth-of-type(1) a');
    assert.strictEqual(
      currentURL(),
      '/dashboard/calendar?date=' + today.minus({ day: 1 }).toFormat('y-MM-dd') + '&view=day'
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
    await visit('/dashboard/calendar?view=week');
    await click('.calendar-time-picker li:nth-of-type(1) a');
    assert.strictEqual(
      currentURL(),
      '/dashboard/calendar?date=' + today.minus({ week: 1 }).toFormat('y-MM-dd')
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
    await visit('/dashboard/calendar?view=month');
    await click('.calendar-time-picker li:nth-of-type(1) a');
    assert.strictEqual(
      currentURL(),
      '/dashboard/calendar?date=' + today.minus({ month: 1 }).toFormat('y-MM-dd') + '&view=month'
    );
  });

  test('show user events', async function (assert) {
    const today = DateTime.fromObject({ hour: 8, minute: 8, second: 8 });
    this.server.create('userevent', {
      user: this.user.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      offering: 1,
    });
    this.server.create('userevent', {
      user: this.user.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      offering: 2,
    });
    await page.visit({ show: 'calendar' });
    assert.strictEqual(page.calendar.weeklyCalendar.events.length, 2);
  });

  const chooseSchoolEvents = async function () {
    return await click(find(findAll('.togglemyschedule label')[1]));
  };
  test('show school events', async function (assert) {
    const today = DateTime.fromObject({ hour: 8, minute: 8, second: 8 });
    this.server.create('schoolevent', {
      school: 1,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      offering: 1,
    });
    this.server.create('schoolevent', {
      school: 1,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      offering: 2,
    });
    await page.visit();
    await chooseSchoolEvents();
    assert.strictEqual(page.calendar.weeklyCalendar.events.length, 2);
  });

  const showFilters = async function () {
    return await click('.showfilters label:nth-of-type(2)');
  };

  const pickSessionType = async function (i) {
    return await click(find(`.sessiontypefilter li:nth-of-type(${i}) [data-test-target]`));
  };

  test('test session type filter', async function (assert) {
    const today = DateTime.fromObject({ hour: 8, minute: 8, second: 8 });
    this.server.create('userevent', {
      user: this.user.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      sessionTypeId: 1,
    });
    this.server.create('userevent', {
      user: this.user.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      sessionTypeId: 2,
    });
    await page.visit({ show: 'calendar', view: 'week' });
    await showFilters();
    assert.strictEqual(page.calendar.weeklyCalendar.events.length, 2);
    await pickSessionType(1);
    assert.strictEqual(page.calendar.weeklyCalendar.events.length, 1);
    await pickSessionType(2);
    assert.strictEqual(page.calendar.weeklyCalendar.events.length, 2);

    await pickSessionType(1);
    await pickSessionType(2);
    await pickSessionType(3);
    assert.strictEqual(page.calendar.weeklyCalendar.events.length, 0);
  });

  const pickCourseLevel = async function (i) {
    return await click(find(`.courselevelfilter li:nth-of-type(${i}) [data-test-target]`));
  };
  const clearCourseLevels = async function () {
    const selected = findAll('.courselevelfilter [data-test-checked]');
    await map(selected, (e) => click(e));
  };

  test('test course level filter', async function (assert) {
    const today = DateTime.fromObject({ hour: 8, minute: 8, second: 8 });
    this.server.create('userevent', {
      user: this.user.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      courseLevel: 1,
    });
    this.server.create('userevent', {
      user: this.user.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      courseLevel: 1,
    });
    await page.visit({ show: 'calendar', view: 'week' });
    await showFilters();
    await chooseDetailFilter();
    assert.strictEqual(page.calendar.weeklyCalendar.events.length, 2);
    await pickCourseLevel(1);
    assert.strictEqual(page.calendar.weeklyCalendar.events.length, 2);
    await clearCourseLevels();
    await pickCourseLevel(3);
    assert.strictEqual(page.calendar.weeklyCalendar.events.length, 0);
  });

  const pickCohort = async function (i) {
    return await click(
      find(`[data-test-cohort-calendar-filter] li:nth-of-type(${i}) [data-test-target]`)
    );
  };

  test('test cohort filter', async function (assert) {
    const today = DateTime.fromObject({ hour: 8, minute: 8, second: 8 });
    this.server.create('userevent', {
      user: this.user.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      cohorts: [{ id: 1 }],
    });
    this.server.create('userevent', {
      user: this.user.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      cohorts: [{ id: 1 }],
    });
    await page.visit({ show: 'calendar', view: 'week' });
    await showFilters();
    await chooseDetailFilter();
    assert.strictEqual(page.calendar.weeklyCalendar.events.length, 2);
    await pickCohort(2);
    assert.strictEqual(page.calendar.weeklyCalendar.events.length, 2);

    await pickCohort(1);
    await pickCohort(2);
    assert.strictEqual(page.calendar.weeklyCalendar.events.length, 0);
  });

  const chooseDetailFilter = async function () {
    return await click(find(findAll('.togglecoursefilters label')[1]));
  };

  const pickCourse = async function (i) {
    return await click(
      find(`[data-test-courses-calendar-filter] li:nth-of-type(${i}) [data-test-target]`)
    );
  };
  const clearCourses = async function () {
    const selected = findAll('[data-test-courses-calendar-filter] [data-test-checked]');
    await map(selected, (e) => click(e));
  };

  test('test course filter', async function (assert) {
    const today = DateTime.fromObject({ hour: 8, minute: 8, second: 8 });
    this.server.create('userevent', {
      user: this.user.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      course: 1,
    });
    this.server.create('userevent', {
      user: this.user.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      course: 2,
    });
    this.server.create('userevent', {
      user: this.user.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      course: 1,
    });
    await page.visit({ show: 'calendar', view: 'week' });
    await showFilters();
    assert.strictEqual(page.calendar.weeklyCalendar.events.length, 3);
    await pickCourse(1);
    assert.strictEqual(page.calendar.weeklyCalendar.events.length, 2);
    await clearCourses();
    await pickCourse(2);
    assert.strictEqual(page.calendar.weeklyCalendar.events.length, 1);
  });

  test('test course and session type filter together', async function (assert) {
    const today = DateTime.fromObject({ hour: 8, minute: 8, second: 8 });
    this.server.create('userevent', {
      user: this.user.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      course: 1,
      sessionTypeId: 1,
    });
    this.server.create('userevent', {
      user: this.user.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      course: 2,
      sessionTypeId: 2,
    });
    this.server.create('userevent', {
      user: this.user.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      course: 1,
      sessionTypeId: 2,
    });
    await page.visit({ show: 'calendar', view: 'week' });
    await showFilters();

    assert.strictEqual(page.calendar.weeklyCalendar.events.length, 3);
    await pickCourse(1);
    assert.strictEqual(page.calendar.weeklyCalendar.events.length, 2);
    await clearCourses();
    await pickCourse(1);
    await pickSessionType(1);
    assert.strictEqual(page.calendar.weeklyCalendar.events.length, 1);
  });

  test('clear all filters', async function (assert) {
    const vocabulary = this.server.create('vocabulary', {
      school: this.school,
    });
    this.server.createList('term', 2, {
      vocabulary,
    });

    const clearFilter = '.filters-clear-filters';
    const sessiontype = '.sessiontypefilter li:nth-of-type(1) input';
    const course = '[data-test-courses-calendar-filter] li:nth-of-type(1) input';
    const term = '.vocabularyfilter li:nth-of-type(1) input';

    await page.visit({ show: 'calendar', view: 'week' });
    await showFilters();
    assert.ok(isEmpty(find(clearFilter)), 'clear filter button is inactive');

    await click(sessiontype);
    await click(course);
    await click(term);

    assert.dom(clearFilter).hasText('Clear Filters', 'clear filter button is active');
    assert.dom(sessiontype).isChecked('filter is checked');
    assert.dom(course).isChecked('filter is checked');
    assert.dom(term).isChecked('filter is checked');

    await click(clearFilter);
    assert.ok(isEmpty(find(clearFilter)), 'clear filter button is inactive');
    assert.dom(sessiontype).isNotChecked('filter is unchecked');
    assert.dom(course).isNotChecked('filter is unchecked');
    assert.dom(term).isNotChecked('filter is unchecked');
  });

  test('clear all detail filters', async function (assert) {
    const clearFilter = '.filters-clear-filters';
    const sessiontype = '.sessiontypefilter li:nth-of-type(1) input';
    const courselevel = '.courselevelfilter li:nth-of-type(1) input';
    const cohort = '[data-test-cohort-calendar-filter] li:nth-of-type(1) input';

    await page.visit({ show: 'calendar', view: 'week' });
    await showFilters();
    await chooseDetailFilter();
    assert.ok(isEmpty(find(clearFilter)), 'clear filter button is inactive');

    await click(sessiontype);
    await click(courselevel);
    await click(cohort);

    assert.dom(clearFilter).hasText('Clear Filters', 'clear filter button is active');
    assert.dom(sessiontype).isChecked('filter is checked');
    assert.dom(courselevel).isChecked('filter is checked');
    assert.dom(cohort).isChecked('filter is checked');

    await click(clearFilter);
    assert.ok(isEmpty(find(clearFilter)), 'clear filter button is inactive');
    assert.dom(sessiontype).isNotChecked('filter is unchecked');
    assert.dom(courselevel).isNotChecked('filter is unchecked');
    assert.dom(cohort).isNotChecked('filter is unchecked');
  });

  test('filter tags work properly', async function (assert) {
    const sessiontype = '.sessiontypefilter li:nth-of-type(1) [data-test-target]';
    const courselevel = '.courselevelfilter li:nth-of-type(1) [data-test-target]';
    const cohort = '[data-test-cohort-calendar-filter] li:nth-of-type(2) [data-test-target]';

    const filtersList = '.filters-list';
    const clearFilter = '.filters-clear-filters';

    function getTagText(n) {
      return find(`.filter-tag:nth-of-type(${n + 1})`).textContent.trim();
    }

    async function clickTag(n) {
      return await click(`.filter-tag:nth-of-type(${n + 1})`);
    }

    await page.visit({ show: 'calendar', view: 'week' });
    await showFilters();
    await chooseDetailFilter();
    assert.ok(isEmpty(find(filtersList)), 'filter tags list is inactive');

    await click(sessiontype);
    await click(courselevel);
    await click(cohort);
    assert.strictEqual(getTagText(0), 'cohort 0 program 0', 'filter tag is active');
    assert.strictEqual(getTagText(1), 'Course Level 1', 'filter tag is active');
    assert.strictEqual(getTagText(2), 'session type 0', 'filter tag is active');

    await clickTag(1);
    assert.dom(courselevel).isNotChecked('filter is unchecked');
    assert.strictEqual(getTagText(0), 'cohort 0 program 0', 'filter tag is active');
    assert.strictEqual(getTagText(1), 'session type 0', 'filter tag is active');

    await clickTag(0);
    assert.strictEqual(getTagText(0), 'session type 0', 'filter tag is active');

    await click(clearFilter);
    assert.ok(isEmpty(find(filtersList)), 'filter tags list is inactive');
    assert.dom(sessiontype).isNotChecked('filter is unchecked');
    assert.dom(cohort).isNotChecked('filter is unchecked');
  });

  test('calendar is active in dashboard navigation', async function (assert) {
    await page.visit();
    assert.ok(page.calendar.dashboardViewPicker.calendar.isActive);
    assert.notOk(page.calendar.dashboardViewPicker.materials.isActive);
    assert.notOk(page.calendar.dashboardViewPicker.week.isActive);
  });

  test('week summary displays the whole week', async function (assert) {
    const startOfTheWeek = DateTime.fromJSDate(
      this.owner.lookup('service:locale-days').firstDayOfThisWeek
    ).set({ minute: 2 });
    const endOfTheWeek = DateTime.fromJSDate(
      this.owner.lookup('service:locale-days').lastDayOfThisWeek
    ).set({ hour: 22, minute: 5 });

    this.server.create('userevent', {
      user: this.user.id,
      startDate: startOfTheWeek.toJSDate(),
      endDate: startOfTheWeek.plus({ hour: 1 }).toJSDate(),
      offering: 1,
      isPublished: true,
    });
    this.server.create('userevent', {
      user: this.user.id,
      startDate: endOfTheWeek.toJSDate(),
      endDate: endOfTheWeek.plus({ hour: 1 }).toJSDate(),
      offering: 2,
      isPublished: true,
    });
    const dashboard = '.dashboard-week';
    const events = `${dashboard} .event`;

    await visit('/dashboard/week');

    const eventBLocks = findAll(events);
    assert.strictEqual(eventBLocks.length, 2);
    const options = {
      weekday: 'long',
      hour: 'numeric',
      minute: 'numeric',
    };
    assert
      .dom(eventBLocks[0])
      .hasText('event 0 ' + this.intl.formatTime(startOfTheWeek.toJSDate(), options));
    assert
      .dom(eventBLocks[1])
      .hasText('event 1 ' + this.intl.formatTime(endOfTheWeek.toJSDate(), options));
  });

  const pickTerm = async function (i) {
    return await click(find(`.vocabularyfilter li:nth-of-type(${i}) [data-test-target]`));
  };

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
    this.server.create('userevent', {
      user: this.user.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      sessionTerms: [{ id: 1 }],
    });
    this.server.create('userevent', {
      user: this.user.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      sessionTerms: [{ id: 1 }],
    });
    await page.visit({ show: 'calendar', view: 'week' });
    await showFilters();
    assert.strictEqual(page.calendar.weeklyCalendar.events.length, 2);
    await pickTerm(1);
    assert.strictEqual(page.calendar.weeklyCalendar.events.length, 2);

    await pickTerm(1);
    await pickTerm(2);
    assert.strictEqual(page.calendar.weeklyCalendar.events.length, 0);
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
    this.server.create('userevent', {
      user: this.user.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      sessionTerms: [{ id: 1 }],
    });
    this.server.create('userevent', {
      user: this.user.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      sessionTerms: [],
    });
    const filters = '.filter-tags .filter-tag';
    const filter = `${filters}:nth-of-type(1)`;

    await page.visit({ show: 'calendar', view: 'week' });
    await showFilters();
    assert.strictEqual(page.calendar.weeklyCalendar.events.length, 2);
    await pickTerm(1);
    assert.strictEqual(page.calendar.weeklyCalendar.events.length, 1);

    assert.dom(filters).exists({ count: 1 });
    await click(filter);
    assert.dom(filters).doesNotExist();
    assert.strictEqual(page.calendar.weeklyCalendar.events.length, 2);
  });

  test('test tooltip', async function (assert) {
    const today = DateTime.fromObject({ hour: 8, minute: 8, second: 8 });
    this.server.create('userevent', {
      user: this.user.id,
      startDate: today.toJSDate(),
      endDate: today.plus({ hour: 1 }).toJSDate(),
      offering: 1,
    });
    await page.visit({ show: 'calendar', view: 'week' });
    await triggerEvent('[data-test-weekly-calendar-event]', 'mouseover');
    assert.dom('[data-test-ilios-calendar-event-tooltip]').exists();
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
    assert.strictEqual(page.calendar.weeklyCalendar.events.length, 1);
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
    assert.strictEqual(page.calendar.weeklyCalendar.events.length, 1);
  });
});
