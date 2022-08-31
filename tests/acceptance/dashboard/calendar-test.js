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
import moment from 'moment';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'dummy/tests/helpers';
import { map } from 'rsvp';
import page from 'ilios-common/page-objects/dashboard-calendar';

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

  test('load month calendar', async function (assert) {
    const today = moment().hour(8);
    const startOfMonth = today.clone().startOf('month');
    const endOfMonth = today.clone().endOf('month').hour(22).minute(59);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      name: 'start of month',
      startDate: startOfMonth.format(),
      endDate: startOfMonth.clone().add(1, 'hour').format(),
      lastModified: today.clone().subtract(1, 'year'),
    });
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      name: 'end of month',
      startDate: endOfMonth.format(),
      endDate: endOfMonth.clone().add(1, 'hour').format(),
      lastModified: today.clone().subtract(1, 'year'),
    });
    await visit('/dashboard/calendar?view=month');
    assert.strictEqual(currentRouteName(), 'dashboard.calendar');
    const events = findAll('[data-test-ilios-calendar-event]');
    assert.strictEqual(events.length, 2);
    const startOfMonthStartFormat = startOfMonth
      .toDate()
      .toLocaleTimeString([], { hour: 'numeric', minute: 'numeric' });
    const startOfMonthEndFormat = startOfMonth
      .clone()
      .add(1, 'hour')
      .toDate()
      .toLocaleTimeString([], { hour: 'numeric', minute: 'numeric' });
    assert
      .dom(events[0])
      .hasText(`${startOfMonthStartFormat} - ${startOfMonthEndFormat} : start of month`);
    const endOfMonthStartFormat = endOfMonth
      .toDate()
      .toLocaleTimeString([], { hour: 'numeric', minute: 'numeric' });
    const endOfMonthEndFormat = endOfMonth
      .clone()
      .add(1, 'hour')
      .toDate()
      .toLocaleTimeString([], { hour: 'numeric', minute: 'numeric' });
    assert
      .dom(events[1])
      .hasText(`${endOfMonthStartFormat} - ${endOfMonthEndFormat} : end of month`);
  });

  test('load week calendar', async function (assert) {
    const today = moment().hour(8);
    const startOfWeek = today.clone().startOf('week');
    const endOfWeek = today.clone().endOf('week').hour(22).minute(59);
    const longDayHeading = startOfWeek.toDate().toLocaleString([], {
      month: 'short',
      day: 'numeric',
    });
    const shortDayHeading = startOfWeek.toDate().toLocaleString([], {
      day: 'numeric',
    });
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      name: 'start of week',
      startDate: startOfWeek.format(),
      endDate: startOfWeek.clone().add(1, 'hour').format(),
      lastModified: today.clone().subtract(1, 'year'),
    });
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      name: 'end of week',
      startDate: endOfWeek.format(),
      endDate: endOfWeek.clone().add(1, 'hour').format(),
      lastModified: today.clone().subtract(1, 'year'),
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

  test('load day calendar', async function (assert) {
    const today = moment().hour(8);
    const tomorow = today.clone().add(1, 'day');
    const yesterday = today.clone().subtract(1, 'day');
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      name: 'today',
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
      lastModified: today.clone().subtract(1, 'year'),
    });
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      name: 'tomorow',
      startDate: tomorow.format(),
      endDate: tomorow.clone().add(1, 'hour').format(),
      lastModified: today.clone().subtract(1, 'year'),
    });
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      name: 'yesterday',
      startDate: yesterday.format(),
      endDate: yesterday.clone().add(1, 'hour').format(),
      lastModified: today.clone().subtract(1, 'year'),
    });
    await visit('/dashboard/calendar?view=day');
    assert.strictEqual(currentRouteName(), 'dashboard.calendar');

    assert.strictEqual(page.calendar.dailyCalendar.events.length, 1);
    assert.strictEqual(page.calendar.dailyCalendar.events[0].name, 'today');
  });

  test('click month day number and go to day', async function (assert) {
    const aDayInTheMonth = moment().startOf('month').add(12, 'days').hour(8);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      name: 'start of month',
      startDate: aDayInTheMonth.format(),
      endDate: aDayInTheMonth.clone().add(1, 'hour').format(),
    });
    await visit('/dashboard/calendar?view=month');
    const dayOfMonth = aDayInTheMonth.date();
    await click(`[data-test-day-button="${dayOfMonth}"]`);
    assert.strictEqual(
      currentURL(),
      '/dashboard/calendar?date=' + aDayInTheMonth.format('YYYY-MM-DD') + '&view=day'
    );
  });

  test('click week day title and go to day', async function (assert) {
    const today = moment().hour(8);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      name: 'today',
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
    });
    await page.visit({ show: 'calendar', view: 'week' });
    const dayOfWeek = today.day();
    assert.strictEqual(page.calendar.weeklyCalendar.dayHeadings.length, 7);
    await page.calendar.weeklyCalendar.dayHeadings[dayOfWeek].selectDay();
    assert.strictEqual(
      currentURL(),
      '/dashboard/calendar?date=' + today.format('YYYY-MM-DD') + '&view=day'
    );
  });

  test('click forward on a day goes to next day', async function (assert) {
    const today = moment().hour(8);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      name: 'today',
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
    });
    await visit('/dashboard/calendar?view=day');
    await click('.calendar-time-picker li:nth-of-type(3) a');
    assert.strictEqual(
      currentURL(),
      '/dashboard/calendar?date=' + today.add(1, 'day').format('YYYY-MM-DD') + '&view=day'
    );
  });

  test('click forward on a week goes to next week', async function (assert) {
    const today = moment().hour(8);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      name: 'today',
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
    });
    await visit('/dashboard/calendar?view=week');
    await click('.calendar-time-picker li:nth-of-type(3) a');
    assert.strictEqual(
      currentURL(),
      '/dashboard/calendar?date=' + today.add(1, 'week').format('YYYY-MM-DD')
    );
  });

  test('click forward on a month goes to next month', async function (assert) {
    const today = moment().hour(8);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      name: 'today',
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
    });
    await visit('/dashboard/calendar?view=month');
    await click('.calendar-time-picker li:nth-of-type(3) a');
    await click(findAll('.calendar-time-picker li')[2]);
    assert.strictEqual(
      currentURL(),
      '/dashboard/calendar?date=' + today.add(1, 'month').format('YYYY-MM-DD') + '&view=month'
    );
  });

  test('click back on a day goes to previous day', async function (assert) {
    const today = moment().hour(8);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      name: 'today',
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
    });
    await visit('/dashboard/calendar?view=day');
    await click('.calendar-time-picker li:nth-of-type(1) a');
    assert.strictEqual(
      currentURL(),
      '/dashboard/calendar?date=' + today.subtract(1, 'day').format('YYYY-MM-DD') + '&view=day'
    );
  });

  test('click back on a week goes to previous week', async function (assert) {
    const today = moment().hour(8);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      name: 'today',
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
    });
    await visit('/dashboard/calendar?view=week');
    await click('.calendar-time-picker li:nth-of-type(1) a');
    assert.strictEqual(
      currentURL(),
      '/dashboard/calendar?date=' + today.subtract(1, 'week').format('YYYY-MM-DD')
    );
  });

  test('click back on a month goes to previous month', async function (assert) {
    const today = moment().hour(8);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      name: 'today',
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
    });
    await visit('/dashboard/calendar?view=month');
    await click('.calendar-time-picker li:nth-of-type(1) a');
    assert.strictEqual(
      currentURL(),
      '/dashboard/calendar?date=' + today.subtract(1, 'month').format('YYYY-MM-DD') + '&view=month'
    );
  });

  test('show user events', async function (assert) {
    const today = moment().hour(8);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
      offering: 1,
    });
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
      offering: 2,
    });
    await page.visit({ show: 'calendar' });
    assert.strictEqual(page.calendar.weeklyCalendar.events.length, 2);
  });

  const chooseSchoolEvents = async function () {
    return await click(find(findAll('.togglemyschedule label')[1]));
  };
  test('show school events', async function (assert) {
    const today = moment().hour(8);
    this.server.create('schoolevent', {
      school: 1,
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
      offering: 1,
    });
    this.server.create('schoolevent', {
      school: 1,
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
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
    const today = moment().hour(8);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
      sessionTypeId: 1,
    });
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
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
    const today = moment().hour(8);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
      courseLevel: 1,
    });
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
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
    const today = moment().hour(8);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
      cohorts: [{ id: 1 }],
    });
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
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
    const today = moment().hour(8);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
      course: 1,
    });
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
      course: 2,
    });
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
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
    const today = moment().hour(8);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
      course: 1,
      sessionTypeId: 1,
    });
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
      course: 2,
      sessionTypeId: 2,
    });
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
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
    const startOfTheWeek = moment().day(0).hour(0).minute(2);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: startOfTheWeek.format(),
      endDate: startOfTheWeek.clone().add(1, 'hour').format(),
      offering: 1,
      isPublished: true,
    });
    const endOfTheWeek = moment().day(6).hour(22).minute(5);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: endOfTheWeek.format(),
      endDate: endOfTheWeek.clone().add(1, 'hour').format(),
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
      .hasText('event 0 ' + startOfTheWeek.toDate().toLocaleString([], options));
    assert
      .dom(eventBLocks[1])
      .hasText('event 1 ' + endOfTheWeek.toDate().toLocaleString([], options));
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
    const today = moment().hour(8);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
      sessionTerms: [{ id: 1 }],
    });
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
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
    const today = moment().hour(8);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
      sessionTerms: [{ id: 1 }],
    });
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
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
    const today = moment().hour(8);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
      offering: 1,
    });
    await page.visit({ show: 'calendar', view: 'week' });
    await triggerEvent('[data-test-weekly-calendar-event]', 'mouseover');
    assert.dom('[data-test-ilios-calendar-event-tooltip]').exists();
  });

  test('visit with course filters open #5098', async function (assert) {
    const today = moment().hour(8);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
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
    const today = moment().hour(8);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
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
