import { click, fillIn, findAll, find, currentURL, currentRouteName, visit } from '@ember/test-helpers';
import { isEmpty } from '@ember/utils';
import moment from 'moment';
import {
  module,
  test
} from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { getElementText, getText } from 'ilios/tests/helpers/custom-helpers';
import { map } from 'rsvp';

module('Acceptance: Dashboard Calendar', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication( { school: this.school } );
    const program = this.server.create('program', {
      school: this.school,
    });
    const programYear1 = this.server.create('programYear', {
      program,
      startYear: 2015,
    });
    const programYear2 = this.server.create('programYear', {
      program,
      startYear: 2015,
    });
    const cohort1 = this.server.create('cohort', {
      programYear: programYear1,
    });
    const cohort2 = this.server.create('cohort', {
      programYear: programYear2,
    });
    const sessionType1 = this.server.create('sessionType', {
      school: this.school,
    });
    const sessionType2 = this.server.create('sessionType', {
      school: this.school,
    });
    this.server.create('sessionType', {
      school: this.school,
    });
    const course1 = this.server.create('course', {
      school: this.school,
      year: 2015,
      cohorts: [cohort1],
    });
    const course2 = this.server.create('course', {
      year: 2015,
      school: this.school,
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
      sessionType: sessionType2
    });
    this.server.create('academicYear', {
      id: 2015,
      title: 2015
    });
    this.offering1 = this.server.create('offering', {
      session: session1
    });
    this.offering2 = this.server.create('offering', {
      session: session2
    });
    this.offering3 = this.server.create('offering', {
      session: session3
    });
  });

  test('load month calendar', async function(assert) {
    let today = moment().hour(8);
    let startOfMonth = today.clone().startOf('month');
    let endOfMonth = today.clone().endOf('month').hour(22).minute(59);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      name: 'start of month',
      startDate: startOfMonth.format(),
      endDate: startOfMonth.clone().add(1, 'hour').format()
    });
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      name: 'end of month',
      startDate: endOfMonth.format(),
      endDate: endOfMonth.clone().add(1, 'hour').format()
    });
    await visit('/dashboard?show=calendar&view=month');
    assert.equal(currentRouteName(), 'dashboard');
    let events = findAll('div.event');
    assert.equal(events.length, 2);
    let eventInfo = '';
    eventInfo += startOfMonth.format('h:mma') + '-' + startOfMonth.clone().add(1, 'hour').format('h:mma') + ': start of month';
    eventInfo += endOfMonth.format('h:mma') + '-' + endOfMonth.clone().add(1, 'hour').format('h:mma') + ': end of month';
    assert.equal(await getElementText(events), getText(eventInfo));
  });

  test('load week calendar', async function(assert) {
    let today = moment().hour(8);
    let startOfWeek = today.clone().startOf('week');
    let endOfWeek = today.clone().endOf('week').hour(22).minute(59);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      name: 'start of week',
      startDate: startOfWeek.format(),
      endDate: startOfWeek.clone().add(1, 'hour').format()
    });
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      name: 'end of week',
      startDate: endOfWeek.format(),
      endDate: endOfWeek.clone().add(1, 'hour').format()
    });
    await visit('/dashboard?show=calendar');
    assert.equal(currentRouteName(), 'dashboard');
    let events = findAll('div.event');
    assert.equal(events.length, 2);
    let eventInfo = '';
    eventInfo += startOfWeek.format('h:mma') + '-' + startOfWeek.clone().add(1, 'hour').format('h:mma') + ' start of week';
    eventInfo += endOfWeek.format('h:mma') + '-' + endOfWeek.clone().add(1, 'hour').format('h:mma') + ' end of week';
    assert.equal(await getElementText(events), getText(eventInfo));
  });

  test('load day calendar', async function(assert) {
    let today = moment().hour(8);
    let tomorow = today.clone().add(1, 'day');
    let yesterday = today.clone().subtract(1, 'day');
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      name: 'today',
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format()
    });
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      name: 'tomorow',
      startDate: tomorow.format(),
      endDate: tomorow.clone().add(1, 'hour').format()
    });
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      name: 'yesterday',
      startDate: yesterday.format(),
      endDate: yesterday.clone().add(1, 'hour').format()
    });
    await visit('/dashboard?show=calendar&view=day');
    assert.equal(currentRouteName(), 'dashboard');
    let events = findAll('div.event');
    assert.equal(events.length, 1);
    let eventInfo = '';
    eventInfo += today.format('h:mma') + '-' + today.clone().add(1, 'hour').format('h:mma') + ' today';
    assert.equal(await getElementText(events), getText(eventInfo));
  });

  test('click month day number and go to day', async function(assert) {
    let aDayInTheMonth = moment().startOf('month').add(12, 'days').hour(8);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      name: 'start of month',
      startDate: aDayInTheMonth.format(),
      endDate: aDayInTheMonth.clone().add(1, 'hour').format()
    });
    await visit('/dashboard?show=calendar&view=month');
    let dayOfMonth = aDayInTheMonth.date();
    let link = findAll('.day .clickable').find(e => parseInt(find(e).textContent, 10) === dayOfMonth);
    await click(link);
    assert.equal(currentURL(), '/dashboard?date=' + aDayInTheMonth.format('YYYY-MM-DD') + '&show=calendar&view=day');
  });

  test('click week day title and go to day', async function(assert) {
    let today = moment().hour(8);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      name: 'today',
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format()
    });
    await visit('/dashboard?show=calendar&view=week');
    let dayOfWeek = today.day();
    await click(findAll('.week-titles .clickable')[dayOfWeek]);
    assert.equal(currentURL(), '/dashboard?date=' + today.format('YYYY-MM-DD') + '&show=calendar&view=day');
  });

  test('click forward on a day goes to next day', async function(assert) {
    let today = moment().hour(8);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      name: 'today',
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format()
    });
    await visit('/dashboard?show=calendar&view=day');
    await click(findAll('.calendar-time-picker li')[2]);
    assert.equal(currentURL(), '/dashboard?date=' + today.add(1, 'day').format('YYYY-MM-DD') + '&show=calendar&view=day');
  });

  test('click forward on a week goes to next week', async function(assert) {
    let today = moment().hour(8);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      name: 'today',
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format()
    });
    await visit('/dashboard?show=calendar&view=week');
    await click(findAll('.calendar-time-picker li')[2]);
    assert.equal(currentURL(), '/dashboard?date=' + today.add(1, 'week').format('YYYY-MM-DD') + '&show=calendar');
  });

  test('click forward on a month goes to next month', async function(assert) {
    let today = moment().hour(8);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      name: 'today',
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format()
    });
    await visit('/dashboard?show=calendar&view=month');
    await click(findAll('.calendar-time-picker li')[2]);
    assert.equal(currentURL(), '/dashboard?date=' + today.add(1, 'month').format('YYYY-MM-DD') + '&show=calendar&view=month');
  });

  test('click back on a day goes to previous day', async function(assert) {
    let today = moment().hour(8);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      name: 'today',
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format()
    });
    await visit('/dashboard?show=calendar&view=day');
    await click(find('.calendar-time-picker li'));
    assert.equal(currentURL(), '/dashboard?date=' + today.subtract(1, 'day').format('YYYY-MM-DD') + '&show=calendar&view=day');
  });

  test('click back on a week goes to previous week', async function(assert) {
    let today = moment().hour(8);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      name: 'today',
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format()
    });
    await visit('/dashboard?show=calendar&view=week');
    await click(find('.calendar-time-picker li'));
    assert.equal(currentURL(), '/dashboard?date=' + today.subtract(1, 'week').format('YYYY-MM-DD') + '&show=calendar');
  });

  test('click back on a month goes to previous month', async function(assert) {
    let today = moment().hour(8);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      name: 'today',
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format()
    });
    await visit('/dashboard?show=calendar&view=month');
    await click(find('.calendar-time-picker li'));
    assert.equal(currentURL(), '/dashboard?date=' + today.subtract(1, 'month').format('YYYY-MM-DD') + '&show=calendar&view=month');
  });

  test('show user events', async function(assert) {
    let today = moment().hour(8);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
      offering: this.offering1.id,
    });
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
      offering: this.offering2.id,
    });
    await visit('/dashboard?show=calendar');
    let events = findAll('div.event');
    assert.equal(events.length, 2);
  });

  let chooseSchoolEvents = async function(){
    return await click(find(findAll('.togglemyschedule label')[1]));
  };
  test('show school events', async function(assert) {
    let today = moment().hour(8);
    this.server.create('schoolevent', {
      school: 1,
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
      offering: this.offering1.id,
    });
    this.server.create('schoolevent', {
      school: 1,
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
      offering: this.offering2.id,
    });
    await visit('/dashboard?show=calendar');
    await chooseSchoolEvents();
    let events = findAll('div.event');
    assert.equal(events.length, 2);
  });

  let showFilters = async function(){
    return await click('.showfilters label:nth-of-type(2)');
  };

  let pickSessionType = async function(i) {
    return await click(find(`.sessiontypefilter li:nth-of-type(${i})>span`));
  };

  test('test session type filter', async function(assert) {
    let today = moment().hour(8);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
      offering: this.offering1.id,
    });
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
      offering: this.offering2.id,
    });
    await visit('/dashboard?show=calendar');
    await showFilters();
    let events = findAll('div.event');
    assert.equal(events.length, 2);
    await pickSessionType(1);
    events = findAll('div.event');
    assert.equal(events.length, 1);
    await pickSessionType(2);
    events = findAll('div.event');
    assert.equal(events.length, 2);

    await pickSessionType(1);
    await pickSessionType(2);
    await pickSessionType(3);
    events = findAll('div.event');
    assert.equal(events.length, 0);
  });

  let pickCourseLevel = async function(i) {
    return await click(find(`.courselevelfilter li:nth-of-type(${i})>span`));
  };
  let clearCourseLevels = async function () {
    const selected = findAll('.courselevelfilter .checkbox:checked');
    await map(selected, e => click(e));
  };

  test('test course level filter', async function(assert) {
    let today = moment().hour(8);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
      offering: this.offering1.id,
    });
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
      offering: this.offering2.id,
    });
    await visit('/dashboard?show=calendar');
    await showFilters();
    await chooseDetailFilter();
    let events = findAll('div.event');
    assert.equal(events.length, 2);
    await pickCourseLevel(1);
    events = findAll('div.event');
    assert.equal(events.length, 2);
    await clearCourseLevels();
    await pickCourseLevel(3);
    events = findAll('div.event');
    assert.equal(events.length, 0);
  });

  let pickCohort = async function(i) {
    return await click(find(`.cohortfilter li:nth-of-type(${i})>span`));
  };

  test('test cohort filter', async function(assert) {
    let today = moment().hour(8);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
      offering: this.offering1.id,
    });
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
      offering: this.offering2.id,
    });
    await visit('/dashboard?show=calendar');
    await showFilters();
    await chooseDetailFilter();
    let events = findAll('div.event');
    assert.equal(events.length, 2);
    await pickCohort(1);
    events = findAll('div.event');
    assert.equal(events.length, 2);

    await pickCohort(1);
    await pickCohort(2);
    events = findAll('div.event');
    assert.equal(events.length, 0);
  });

  let chooseDetailFilter = async function(){
    return await click(find(findAll('.togglecoursefilters label')[1]));
  };

  let pickCourse = async function(i) {
    return await click(find(`.coursefilter li:nth-of-type(${i})>span`));
  };
  let clearCourses = async function () {
    const selected = findAll('.coursefilter .checkbox:checked');
    await map(selected, e => click(e));
  };

  test('test course filter', async function(assert) {
    let today = moment().hour(8);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
      offering: this.offering1.id,
    });
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
      offering: this.offering3.id,
    });
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
      offering: this.offering2.id,
    });
    await visit('/dashboard?show=calendar');
    await showFilters();
    let events = findAll('div.event');
    assert.equal(events.length, 3);
    await pickCourse(1);
    events = findAll('div.event');
    assert.equal(events.length, 2);
    await clearCourses();
    await pickCourse(2);
    events = findAll('div.event');
    assert.equal(events.length, 1);
  });

  test('test course and session type filter together', async function(assert) {
    let today = moment().hour(8);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
      offering: this.offering1.id,
    });
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
      offering: this.offering3.id,
    });
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
      offering: this.offering2.id,
    });
    await visit('/dashboard?show=calendar');
    await showFilters();

    let events = findAll('div.event');
    assert.equal(events.length, 3);
    await pickCourse(1);
    events = findAll('div.event');
    assert.equal(events.length, 2);
    await clearCourses();
    await pickCourse(1);
    await pickSessionType(1);
    events = findAll('div.event');
    assert.equal(events.length, 1);
  });

  test('agenda show next seven days of events', async function(assert) {
    let today = moment().hour(0).minute(2);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
      offering: this.offering1.id,
    });
    let endOfTheWeek = moment().add(6, 'days');
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: endOfTheWeek.format(),
      endDate: endOfTheWeek.clone().add(1, 'hour').format(),
      offering: this.offering2.id,
    });
    let yesterday = moment().subtract(25, 'hours');
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: yesterday.format(),
      endDate: yesterday.clone().add(1, 'hour').format(),
      offering: this.offering3.id,
    });
    await visit('/dashboard?show=agenda');
    let events = findAll('tr');
    assert.equal(events.length, 2);
    assert.equal(await getElementText(events[0]), getText(today.format('dddd, MMMM Do, YYYY h:mma') + 'event 0'));
    assert.equal(await getElementText(events[1]), getText(endOfTheWeek.format('dddd, MMMM Do, YYYY h:mma') + 'event 1'));
  });

  test('academic year filters cohort', async function(assert) {
    this.server.create('academicYear', {
      id: 2014,
      title: 2014
    });
    this.server.create('program', {
      school: this.school,
    });
    this.server.create('programYear', {
      startYear: 2014,
      programId: 2,
    });
    this.server.create('cohort', {
      programYearId: 3
    });
    await visit('/dashboard?show=calendar');
    await showFilters();
    await chooseDetailFilter();
    await fillIn('.calendar-year-picker select', '2015');
    let cohortFilter = findAll('.cohortfilter li');
    assert.equal(cohortFilter.length, 3);
    await fillIn('.calendar-year-picker select', '2014');
    cohortFilter = findAll('.cohortfilter li');
    assert.equal(cohortFilter.length, 1);
  });

  test('academic year filters courses', async function(assert) {
    this.server.create('academicYear', {
      id: 2014,
      title: 2014
    });
    this.server.create('course', {
      year: 2014,
      school: this.school
    });
    await visit('/dashboard?show=calendar');
    await showFilters();
    await fillIn('.calendar-year-picker select', '2015');
    let courseFilters = findAll('.coursefilter li');
    assert.equal(courseFilters.length, 2);
    await fillIn('.calendar-year-picker select', '2014');
    courseFilters = findAll('.coursefilter li');
    assert.equal(courseFilters.length, 1);
  });

  test('clear all filters', async function (assert) {
    const vocabulary = this.server.create('vocabulary', {
      school: this.school
    });
    this.server.createList('term', 2, {
      vocabulary
    });

    const clearFilter = '.filters-clear-filters';
    const sessiontype = '.sessiontypefilter li:nth-of-type(1) input';
    const course = '.coursefilter li:nth-of-type(1) input';
    const term = '.vocabularyfilter li:nth-of-type(1) input';

    await visit('/dashboard?show=calendar');
    await showFilters();
    assert.ok(isEmpty(find(clearFilter)), 'clear filter button is inactive');

    await click(sessiontype);
    await click(course);
    await click(term);

    assert.equal(find(clearFilter).textContent, 'Clear Filters', 'clear filter button is active');
    assert.ok(find(sessiontype).checked, 'filter is checked');
    assert.ok(find(course).checked, 'filter is checked');
    assert.ok(find(term).checked, 'filter is checked');

    await click(clearFilter);
    assert.ok(isEmpty(find(clearFilter)), 'clear filter button is inactive');
    assert.ok(!find(sessiontype).checked, 'filter is unchecked');
    assert.ok(!find(course).checked, 'filter is unchecked');
    assert.ok(!find(term).checked, 'filter is unchecked');
  });

  test('clear all detail filters', async function(assert) {
    const clearFilter = '.filters-clear-filters';
    const sessiontype = '.sessiontypefilter li:nth-of-type(1) input';
    const courselevel = '.courselevelfilter li:nth-of-type(1) input';
    const cohort = '.cohortfilter li:nth-of-type(1) input';

    await visit('/dashboard?show=calendar');
    await showFilters();
    await chooseDetailFilter();
    assert.ok(isEmpty(find(clearFilter)), 'clear filter button is inactive');

    await click(sessiontype);
    await click(courselevel);
    await click(cohort);

    assert.equal(find(clearFilter).textContent, 'Clear Filters', 'clear filter button is active');
    assert.ok(find(sessiontype).checked, 'filter is checked');
    assert.ok(find(courselevel).checked, 'filter is checked');
    assert.ok(find(cohort).checked, 'filter is checked');

    await click(clearFilter);
    assert.ok(isEmpty(find(clearFilter)), 'clear filter button is inactive');
    assert.ok(!find(sessiontype).checked, 'filter is unchecked');
    assert.ok(!find(courselevel).checked, 'filter is unchecked');
    assert.ok(!find(cohort).checked, 'filter is unchecked');
  });

  test('filter tags work properly', async function(assert) {
    const sessiontype = '.sessiontypefilter li:nth-of-type(1) input';
    const courselevel = '.courselevelfilter li:nth-of-type(1) input';
    const cohort = '.cohortfilter li:nth-of-type(1) input';

    const filtersList = '.filters-list';
    const clearFilter = '.filters-clear-filters';

    function getTagText(n) {
      return find(`.filter-tag:nth-of-type(${n + 1})`).textContent.trim();
    }

    async function clickTag(n) {
      return await click(`.filter-tag:nth-of-type(${n + 1})`);
    }

    await visit('/dashboard?show=calendar');
    await showFilters();
    await chooseDetailFilter();
    assert.ok(isEmpty(find(filtersList)), 'filter tags list is inactive');

    await click(sessiontype);
    await click(courselevel);
    await click(cohort);
    assert.equal(getTagText(0), 'session type 0', 'filter tag is active');
    assert.equal(getTagText(1), 'Course Level 1', 'filter tag is active');
    assert.equal(getTagText(2), 'cohort 0 program 0', 'filter tag is active');

    await clickTag(1);
    assert.ok(!find(courselevel).checked, 'filter is unchecked');
    assert.equal(getTagText(0), 'session type 0', 'filter tag is active');
    assert.equal(getTagText(1), 'cohort 0 program 0', 'filter tag is active');

    await clickTag(0);
    assert.equal(getTagText(0), 'cohort 0 program 0', 'filter tag is active');

    await click(clearFilter);
    assert.ok(isEmpty(find(filtersList)), 'filter tags list is inactive');
    assert.ok(!find(sessiontype).checked, 'filter is unchecked');
    assert.ok(!find(cohort).checked, 'filter is unchecked');
  });

  test('query params work', async function(assert) {
    const calendarPicker = '.dashboard-view-picker li:nth-of-type(4) button';
    const schoolEvents = '.togglemyschedule label:nth-of-type(2)';
    const showFiltersButton = '.showfilters label:nth-of-type(2)';
    const hideFiltersButton = '.showfilters label:nth-of-type(1)';
    const academicYearDropdown = '.calendar-year-picker select';

    await visit('/dashboard');
    await click(calendarPicker);
    assert.equal(currentURL(), '/dashboard?show=calendar');

    await click(find(schoolEvents));
    assert.equal(currentURL(), '/dashboard?mySchedule=false&show=calendar');

    await click(find(showFiltersButton));
    assert.equal(currentURL(), '/dashboard?mySchedule=false&show=calendar&showFilters=true');

    await chooseDetailFilter();
    assert.equal(currentURL(), '/dashboard?courseFilters=false&mySchedule=false&show=calendar&showFilters=true');

    await fillIn(academicYearDropdown, '2015');
    assert.equal(currentURL(), '/dashboard?academicYear=2015&courseFilters=false&mySchedule=false&show=calendar&showFilters=true');

    await click(find(hideFiltersButton));
    assert.equal(currentURL(), '/dashboard?mySchedule=false&show=calendar');
  });

  test('week summary displays the whole week', async function(assert) {
    const startOfTheWeek = moment().day(0).hour(0).minute(2);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: startOfTheWeek.format(),
      endDate: startOfTheWeek.clone().add(1, 'hour').format(),
      offering: this.offering1.id,
      isPublished: true,
    });
    const endOfTheWeek = moment().day(6).hour(22).minute(5);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: endOfTheWeek.format(),
      endDate: endOfTheWeek.clone().add(1, 'hour').format(),
      offering: this.offering2.id,
      isPublished: true,
    });
    const dashboard = '.dashboard-week';
    const events = `${dashboard} .event`;

    await visit('/dashboard?show=week');

    let eventBLocks = findAll(events);
    assert.equal(eventBLocks.length, 2);
    assert.equal(await getElementText(eventBLocks[0]), getText('event 0' + startOfTheWeek.format('dddd h:mma')));
    assert.equal(await getElementText(eventBLocks[1]), getText('event 1' + endOfTheWeek.format('dddd h:mma')));
  });

  let pickTerm = async function(i) {
    return await click(find(`.vocabularyfilter li:nth-of-type(${i})>span`));
  };

  test('test term filter', async function(assert) {
    const vocabulary = this.server.create('vocabulary', {
      school: this.school
    });
    this.server.create('term', {
      vocabulary,
      sessionIds: [1, 2]
    });
    this.server.create('term', {
      vocabulary
    });
    let today = moment().hour(8);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
      offering: this.offering1.id,
    });
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
      offering: this.offering2.id,
    });
    await visit('/dashboard?show=calendar');
    await showFilters();
    let events = findAll('div.event');
    assert.equal(events.length, 2);
    await pickTerm(1);
    events = findAll('div.event');
    assert.equal(events.length, 2);

    await pickTerm(1);
    await pickTerm(2);
    events = findAll('div.event');
    assert.equal(events.length, 0);
  });

  test('clear vocab filter #3450', async function(assert) {
    const vocabulary = this.server.create('vocabulary', {
      school: this.school
    });
    this.server.create('term', {
      vocabulary,
      sessionIds: [1]
    });
    let today = moment().hour(8);
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
      offering: this.offering1.id,
    });
    this.server.create('userevent', {
      user: parseInt(this.user.id, 10),
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format(),
      offering: this.offering2.id,
    });
    const filters = '.filter-tags .filter-tag';
    const filter = `${filters}:nth-of-type(1)`;

    await visit('/dashboard?show=calendar');
    await showFilters();
    assert.equal(findAll('div.event').length, 2);
    await pickTerm(1);
    assert.equal(findAll('div.event').length, 1);

    assert.equal(findAll(filters).length, 1);
    await click(filter);
    assert.equal(findAll(filters).length, 0);
    assert.equal(findAll('div.event').length, 2);
  });
});
