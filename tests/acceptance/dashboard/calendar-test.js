import { isEmpty } from '@ember/utils';
import destroyApp from '../../helpers/destroy-app';
import moment from 'moment';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;

module('Acceptance: Dashboard Calendar', {
  beforeEach: function() {
    application = startApp();
    server.create('school');
    setupAuthentication(application, {id: 4136, schoolId: 1});
    server.create('program', {
      schoolId: 1,
    });
    server.create('programYear', {
      programId: 1,
      startYear: 2015,
    });
    server.create('programYear', {
      programId: 1,
      startYear: 2015,
    });
    server.create('cohort', {
      programYearId: 1,
    });
    server.create('cohort', {
      programYearId: 2,
    });
    server.create('sessionType', {
      schoolId: 1,
    });
    server.create('sessionType', {
      schoolId: 1,
    });
    server.create('sessionType', {
      schoolId: 1,
    });
    server.create('course', {
      schoolId: 1,
      year: 2015,
      cohortIds: [1],
    });
    server.create('course', {
      year: 2015,
      schoolId: 1,
      cohortIds: [1],
    });
    server.create('session', {
      courseId: 1,
      sessionTypeId: 1,
    });
    server.create('session', {
      courseId: 1,
      sessionTypeId: 2,
    });
    server.create('session', {
      courseId: 2,
    });
    server.create('academicYear', {
      id: 2015,
      title: 2015
    });
    server.create('offering', {
      sessionId: 1
    });
    server.create('offering', {
      sessionId: 2
    });
    server.create('offering', {
      sessionId: 3
    });
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('load month calendar', async function(assert) {
  let today = moment().hour(8);
  let startOfMonth = today.clone().startOf('month');
  let endOfMonth = today.clone().endOf('month').hour(22).minute(59);
  server.create('userevent', {
    user: 4136,
    name: 'start of month',
    startDate: startOfMonth.format(),
    endDate: startOfMonth.clone().add(1, 'hour').format()
  });
  server.create('userevent', {
    user: 4136,
    name: 'end of month',
    startDate: endOfMonth.format(),
    endDate: endOfMonth.clone().add(1, 'hour').format()
  });
  await visit('/dashboard?show=calendar&view=month');
  assert.equal(currentPath(), 'dashboard');
  let events = find('div.event');
  assert.equal(events.length, 2);
  let eventInfo = '';
  eventInfo += startOfMonth.format('h:mma') + '-' + startOfMonth.clone().add(1, 'hour').format('h:mma') + ': start of month';
  eventInfo += endOfMonth.format('h:mma') + '-' + endOfMonth.clone().add(1, 'hour').format('h:mma') + ': end of month';
  assert.equal(getElementText(events), getText(eventInfo));
});

test('load week calendar', async function(assert) {
  let today = moment().hour(8);
  let startOfWeek = today.clone().startOf('week');
  let endOfWeek = today.clone().endOf('week').hour(22).minute(59);
  server.create('userevent', {
    user: 4136,
    name: 'start of week',
    startDate: startOfWeek.format(),
    endDate: startOfWeek.clone().add(1, 'hour').format()
  });
  server.create('userevent', {
    user: 4136,
    name: 'end of week',
    startDate: endOfWeek.format(),
    endDate: endOfWeek.clone().add(1, 'hour').format()
  });
  await visit('/dashboard?show=calendar');
  assert.equal(currentPath(), 'dashboard');
  let events = find('div.event');
  assert.equal(events.length, 2);
  let eventInfo = '';
  eventInfo += startOfWeek.format('h:mma') + '-' + startOfWeek.clone().add(1, 'hour').format('h:mma') + ' start of week';
  eventInfo += endOfWeek.format('h:mma') + '-' + endOfWeek.clone().add(1, 'hour').format('h:mma') + ' end of week';
  assert.equal(getElementText(events), getText(eventInfo));
});

test('load day calendar', async function(assert) {
  let today = moment().hour(8);
  let tomorow = today.clone().add(1, 'day');
  let yesterday = today.clone().subtract(1, 'day');
  server.create('userevent', {
    user: 4136,
    name: 'today',
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format()
  });
  server.create('userevent', {
    user: 4136,
    name: 'tomorow',
    startDate: tomorow.format(),
    endDate: tomorow.clone().add(1, 'hour').format()
  });
  server.create('userevent', {
    user: 4136,
    name: 'yesterday',
    startDate: yesterday.format(),
    endDate: yesterday.clone().add(1, 'hour').format()
  });
  await visit('/dashboard?show=calendar&view=day');
  assert.equal(currentPath(), 'dashboard');
  let events = find('div.event');
  assert.equal(events.length, 1);
  let eventInfo = '';
  eventInfo += today.format('h:mma') + '-' + today.clone().add(1, 'hour').format('h:mma') + ' today';
  assert.equal(getElementText(events), getText(eventInfo));
});

test('click month day number and go to day', async function(assert) {
  let aDayInTheMonth = moment().startOf('month').add(12, 'days').hour(8);
  server.create('userevent', {
    user: 4136,
    name: 'start of month',
    startDate: aDayInTheMonth.format(),
    endDate: aDayInTheMonth.clone().add(1, 'hour').format()
  });
  await visit('/dashboard?show=calendar&view=month');
  let dayOfMonth = aDayInTheMonth.date();
  let link = find('.day .clickable').filter(function(){
    return parseInt(find(this).text(), 10) === dayOfMonth;
  }).eq(0);
  await click(link);
  assert.equal(currentURL(), '/dashboard?date=' + aDayInTheMonth.format('YYYY-MM-DD') + '&show=calendar&view=day');
});

test('click week day title and go to day', async function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    user: 4136,
    name: 'today',
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format()
  });
  await visit('/dashboard?show=calendar&view=week');
  let dayOfWeek = today.day();
  await click(find('.week-titles .clickable').eq(dayOfWeek));
  assert.equal(currentURL(), '/dashboard?date=' + today.format('YYYY-MM-DD') + '&show=calendar&view=day');
});

test('click forward on a day goes to next day', async function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    user: 4136,
    name: 'today',
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format()
  });
  await visit('/dashboard?show=calendar&view=day');
  await click('.calendar-time-picker li:eq(2)');
  assert.equal(currentURL(), '/dashboard?date=' + today.add(1, 'day').format('YYYY-MM-DD') + '&show=calendar&view=day');
});

test('click forward on a week goes to next week', async function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    user: 4136,
    name: 'today',
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format()
  });
  await visit('/dashboard?show=calendar&view=week');
  await click('.calendar-time-picker li:eq(2)');
  assert.equal(currentURL(), '/dashboard?date=' + today.add(1, 'week').format('YYYY-MM-DD') + '&show=calendar');
});

test('click forward on a month goes to next month', async function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    user: 4136,
    name: 'today',
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format()
  });
  await visit('/dashboard?show=calendar&view=month');
  await click('.calendar-time-picker li:eq(2)');
  assert.equal(currentURL(), '/dashboard?date=' + today.add(1, 'month').format('YYYY-MM-DD') + '&show=calendar&view=month');
});

test('click back on a day goes to previous day', async function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    user: 4136,
    name: 'today',
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format()
  });
  await visit('/dashboard?show=calendar&view=day');
  await click('.calendar-time-picker li:eq(0)');
  assert.equal(currentURL(), '/dashboard?date=' + today.subtract(1, 'day').format('YYYY-MM-DD') + '&show=calendar&view=day');
});

test('click back on a week goes to previous week', async function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    user: 4136,
    name: 'today',
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format()
  });
  await visit('/dashboard?show=calendar&view=week');
  await click('.calendar-time-picker li:eq(0)');
  assert.equal(currentURL(), '/dashboard?date=' + today.subtract(1, 'week').format('YYYY-MM-DD') + '&show=calendar');
});

test('click back on a month goes to previous month', async function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    user: 4136,
    name: 'today',
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format()
  });
  await visit('/dashboard?show=calendar&view=month');
  await click('.calendar-time-picker li:eq(0)');
  assert.equal(currentURL(), '/dashboard?date=' + today.subtract(1, 'month').format('YYYY-MM-DD') + '&show=calendar&view=month');
});

test('show user events', async function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    user: 4136,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 1
  });
  server.create('userevent', {
    user: 4136,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 2
  });
  await visit('/dashboard?show=calendar');
  let events = find('div.event');
  assert.equal(events.length, 2);
});

let chooseSchoolEvents = async function(){
  return await click(find('.togglemyschedule label:eq(1)'));
};
test('show school events', async function(assert) {
  let today = moment().hour(8);
  server.create('schoolevent', {
    school: 1,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 1
  });
  server.create('schoolevent', {
    school: 1,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 2
  });
  await visit('/dashboard?show=calendar');
  await chooseSchoolEvents();
  let events = find('div.event');
  assert.equal(events.length, 2);
});

let showFilters = async function(){
  return click(find('.showfilters label:eq(1)'));
};

let pickSessionType = async function(i) {
  let types = find('.sessiontypefilter');
  return await click(find('li>span', types).eq(i));
};

test('test session type filter', async function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    user: 4136,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 1
  });
  server.create('userevent', {
    user: 4136,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 2
  });
  await visit('/dashboard?show=calendar');
  await showFilters();
  let events = find('div.event');
  assert.equal(events.length, 2);
  await pickSessionType(0);
  events = find('div.event');
  assert.equal(events.length, 1);
  await pickSessionType(1);
  events = find('div.event');
  assert.equal(events.length, 2);

  await pickSessionType(0);
  await pickSessionType(1);
  await pickSessionType(2);
  events = find('div.event');
  assert.equal(events.length, 0);
});

let pickCourseLevel = async function(i) {
  let levels = find('.courselevelfilter');
  return await click(find('li>span', levels).eq(i));
};
let clearCourseLevels = async function() {
  let levels = find('.courselevelfilter');
  return await click(find('.checkbox:first', levels));
};

test('test course level filter', async function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    user: 4136,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 1
  });
  server.create('userevent', {
    user: 4136,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 2
  });
  await visit('/dashboard?show=calendar');
  await showFilters();
  await chooseDetailFilter();
  let events = find('div.event');
  assert.equal(events.length, 2);
  await pickCourseLevel(0);
  events = find('div.event');
  assert.equal(events.length, 2);
  await clearCourseLevels();
  await pickCourseLevel(2);
  events = find('div.event');
  assert.equal(events.length, 0);
});

let pickCohort = async function(i) {
  let cohorts = find('.cohortfilter');
  return await click(find('li>span', cohorts).eq(i));
};

test('test cohort filter', async function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    user: 4136,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 1
  });
  server.create('userevent', {
    user: 4136,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 2
  });
  await visit('/dashboard?show=calendar');
  await showFilters();
  await chooseDetailFilter();
  let events = find('div.event');
  assert.equal(events.length, 2);
  await pickCohort(0);
  events = find('div.event');
  assert.equal(events.length, 2);

  await pickCohort(0);
  await pickCohort(1);
  events = find('div.event');
  assert.equal(events.length, 0);
});

let chooseDetailFilter = async function(){
  return await click(find('.togglecoursefilters label:eq(1)'));
};

let pickCourse = async function(i) {
  let courses = find('.coursefilter');
  return await click(find('li>span', courses).eq(i));
};
let clearCourses = async function() {
  let courses = find('.coursefilter');
  return await click(find('.checkbox:first', courses));
};

test('test course filter', async function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    user: 4136,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 1
  });
  server.create('userevent', {
    user: 4136,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 3
  });
  server.create('userevent', {
    user: 4136,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 2
  });
  await visit('/dashboard?show=calendar');
  await showFilters();
  let events = find('div.event');
  assert.equal(events.length, 3);
  await pickCourse(0);
  events = find('div.event');
  assert.equal(events.length, 2);
  await clearCourses();
  await pickCourse(1);
  events = find('div.event');
  assert.equal(events.length, 1);
});

test('test course and session type filter together', async function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    user: 4136,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 1
  });
  server.create('userevent', {
    user: 4136,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 3
  });
  server.create('userevent', {
    user: 4136,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 2
  });
  await visit('/dashboard?show=calendar');
  await showFilters();

  let events = find('div.event');
  assert.equal(events.length, 3);
  await pickCourse(0);
  events = find('div.event');
  assert.equal(events.length, 2);
  await clearCourses();
  await pickCourse(0);
  await pickSessionType(0);
  events = find('div.event');
  assert.equal(events.length, 1);
});

test('agenda show next seven days of events', async function(assert) {
  let today = moment().hour(0).minute(2);
  server.create('userevent', {
    user: 4136,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 1
  });
  let endOfTheWeek = moment().add(6, 'days');
  server.create('userevent', {
    user: 4136,
    startDate: endOfTheWeek.format(),
    endDate: endOfTheWeek.clone().add(1, 'hour').format(),
    offering: 2
  });
  let yesterday = moment().subtract(25, 'hours');
  server.create('userevent', {
    user: 4136,
    startDate: yesterday.format(),
    endDate: yesterday.clone().add(1, 'hour').format(),
    offering: 3
  });
  await visit('/dashboard?show=agenda');
  let events = find('tr');
  assert.equal(events.length, 2);
  assert.equal(getElementText(events.eq(0)), getText(today.format('dddd, MMMM Do, YYYY h:mma') + 'event 0'));
  assert.equal(getElementText(events.eq(1)), getText(endOfTheWeek.format('dddd, MMMM Do, YYYY h:mma') + 'event 1'));
});

test('academic year filters cohort', async function(assert) {
  server.create('academicYear', {
    id: 2014,
    title: 2014
  });
  server.create('program', {
    schoolId: 1,
  });
  server.create('programYear', {
    startYear: 2014,
    programId: 2,
  });
  server.create('cohort', {
    programYearId: 3
  });
  await visit('/dashboard?show=calendar');
  await showFilters();
  await chooseDetailFilter();
  await pickOption('.calendar-year-picker select', '2015 - 2016', assert);
  let cohortFilter = find('.cohortfilter li');
  assert.equal(cohortFilter.length, 3);
  await pickOption('.calendar-year-picker select', '2014 - 2015', assert);
  cohortFilter = find('.cohortfilter li');
  assert.equal(cohortFilter.length, 1);
});

test('academic year filters courses', async function(assert) {
  server.create('academicYear', {
    id: 2014,
    title: 2014
  });
  server.create('course', {
    year: 2014,
    schoolId: 1
  });
  await visit('/dashboard?show=calendar');
  await showFilters();
  await pickOption('.calendar-year-picker select', '2015 - 2016', assert);
  let courseFilters = find('.coursefilter li');
  assert.equal(courseFilters.length, 2);
  await pickOption('.calendar-year-picker select', '2014 - 2015', assert);
  courseFilters = find('.coursefilter li');
  assert.equal(courseFilters.length, 1);
});



test('clear all filters', async function (assert) {
  const vocabulary = server.create('vocabulary', {
    schoolId: 1
  });
  server.createList('term', 2, {
    vocabulary
  });

  const clearFilter = '.filters-clear-filters';
  const sessiontype = '.sessiontypefilter li:first input';
  const course = '.coursefilter li:first input';
  const term = '.vocabularyfilter li:first input';

  await visit('/dashboard?show=calendar');
  await showFilters();
  assert.ok(isEmpty(find(clearFilter)), 'clear filter button is inactive');

  await click(sessiontype);
  await click(course);
  await click(term);

  assert.equal(find(clearFilter).text(), 'Clear Filters', 'clear filter button is active');
  assert.ok(find(sessiontype).prop('checked'), 'filter is checked');
  assert.ok(find(course).prop('checked'), 'filter is checked');
  assert.ok(find(term).prop('checked'), 'filter is checked');

  await click(clearFilter);
  assert.ok(isEmpty(find(clearFilter)), 'clear filter button is inactive');
  assert.ok(!find(sessiontype).prop('checked'), 'filter is unchecked');
  assert.ok(!find(course).prop('checked'), 'filter is unchecked');
  assert.ok(!find(term).prop('checked'), 'filter is unchecked');
});

test('clear all detail filters', async function(assert) {
  const clearFilter = '.filters-clear-filters';
  const sessiontype = '.sessiontypefilter li:first input';
  const courselevel = '.courselevelfilter li:first input';
  const cohort = '.cohortfilter li:first input';

  await visit('/dashboard?show=calendar');
  await showFilters();
  await chooseDetailFilter();
  assert.ok(isEmpty(find(clearFilter)), 'clear filter button is inactive');

  await click(sessiontype);
  await click(courselevel);
  await click(cohort);

  assert.equal(find(clearFilter).text(), 'Clear Filters', 'clear filter button is active');
  assert.ok(find(sessiontype).prop('checked'), 'filter is checked');
  assert.ok(find(courselevel).prop('checked'), 'filter is checked');
  assert.ok(find(cohort).prop('checked'), 'filter is checked');

  await click(clearFilter);
  assert.ok(isEmpty(find(clearFilter)), 'clear filter button is inactive');
  assert.ok(!find(sessiontype).prop('checked'), 'filter is unchecked');
  assert.ok(!find(courselevel).prop('checked'), 'filter is unchecked');
  assert.ok(!find(cohort).prop('checked'), 'filter is unchecked');
});

test('filter tags work properly', async function(assert) {
  const sessiontype = '.sessiontypefilter li:first input';
  const courselevel = '.courselevelfilter li:first input';
  const cohort = '.cohortfilter li:first input';

  const filtersList = '.filters-list';
  const clearFilter = '.filters-clear-filters';

  function getTagText(n) {
    return find(`.filter-tag:eq(${n})`).text().trim();
  }

  function clickTag(n) {
    return click(`.filter-tag:eq(${n})`);
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
  assert.ok(!find(courselevel).prop('checked'), 'filter is unchecked');
  assert.equal(getTagText(0), 'session type 0', 'filter tag is active');
  assert.equal(getTagText(1), 'cohort 0 program 0', 'filter tag is active');

  await clickTag(0);
  assert.equal(getTagText(0), 'cohort 0 program 0', 'filter tag is active');

  await click(clearFilter);
  assert.ok(isEmpty(find(filtersList)), 'filter tags list is inactive');
  assert.ok(!find(sessiontype).prop('checked'), 'filter is unchecked');
  assert.ok(!find(cohort).prop('checked'), 'filter is unchecked');
});

test('query params work', async function(assert) {
  const calendarPicker = '.dashboard-view-picker button:eq(3)';
  const schoolEvents = '.togglemyschedule label:eq(1)';
  const showFiltersButton = '.showfilters label:eq(1)';
  const hideFiltersButton = '.showfilters label:eq(0)';
  const academicYearDropdown = '.calendar-year-picker select';

  await visit('/dashboard');
  await click(calendarPicker);
  assert.equal(currentURL(), '/dashboard?show=calendar');

  await click(schoolEvents);
  assert.equal(currentURL(), '/dashboard?mySchedule=false&show=calendar');

  await click(showFiltersButton);
  assert.equal(currentURL(), '/dashboard?mySchedule=false&show=calendar&showFilters=true');

  await chooseDetailFilter();
  assert.equal(currentURL(), '/dashboard?courseFilters=false&mySchedule=false&show=calendar&showFilters=true');

  await pickOption(academicYearDropdown, '2015 - 2016', assert);
  assert.equal(currentURL(), '/dashboard?academicYear=2015&courseFilters=false&mySchedule=false&show=calendar&showFilters=true');

  await click(hideFiltersButton);
  assert.equal(currentURL(), '/dashboard?mySchedule=false&show=calendar');
});

test('week summary displays the whole week', async function(assert) {
  const startOfTheWeek = moment().day(0).hour(0).minute(2);
  server.create('userevent', {
    user: 4136,
    startDate: startOfTheWeek.format(),
    endDate: startOfTheWeek.clone().add(1, 'hour').format(),
    offering: 1,
    isPublished: true,
  });
  const endOfTheWeek = moment().day(6).hour(22).minute(5);
  server.create('userevent', {
    user: 4136,
    startDate: endOfTheWeek.format(),
    endDate: endOfTheWeek.clone().add(1, 'hour').format(),
    offering: 2,
    isPublished: true,
  });
  const dashboard = '.dashboard-week';
  const events = `${dashboard} .event`;

  await visit('/dashboard?show=week');

  let eventBLocks = find(events);
  assert.equal(eventBLocks.length, 2);
  assert.equal(getElementText(eventBLocks.eq(0)), getText('event 0' + startOfTheWeek.format('dddd h:mma')));
  assert.equal(getElementText(eventBLocks.eq(1)), getText('event 1' + endOfTheWeek.format('dddd h:mma')));
});

let pickTerm = async function(i) {
  let terms = find('.vocabularyfilter');
  return await click(find('li>span', terms).eq(i));
};

test('test term filter', async function(assert) {
  const vocabulary = server.create('vocabulary', {
    schoolId: 1
  });
  server.create('term', {
    vocabulary,
    sessionIds: [1, 2]
  });
  server.create('term', {
    vocabulary
  });
  let today = moment().hour(8);
  server.create('userevent', {
    user: 4136,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 1
  });
  server.create('userevent', {
    user: 4136,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 2
  });
  await visit('/dashboard?show=calendar');
  await showFilters();
  let events = find('div.event');
  assert.equal(events.length, 2);
  await pickTerm(0);
  events = find('div.event');
  assert.equal(events.length, 2);

  await pickTerm(0);
  await pickTerm(1);
  events = find('div.event');
  assert.equal(events.length, 0);
});

test('clear vocab filter #3450', async function(assert) {
  const vocabulary = server.create('vocabulary', {
    schoolId: 1
  });
  server.create('term', {
    vocabulary,
    sessionIds: [1]
  });
  let today = moment().hour(8);
  server.create('userevent', {
    user: 4136,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 1
  });
  server.create('userevent', {
    user: 4136,
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format(),
    offering: 2
  });
  const filters = '.filter-tags .filter-tag';
  const filter = `${filters}:eq(0)`;

  await visit('/dashboard?show=calendar');
  await showFilters();
  assert.equal(find('div.event').length, 2);
  await pickTerm(0);
  assert.equal(find('div.event').length, 1);

  assert.equal(find(filters).length, 1);
  await click(filter);
  assert.equal(find(filters).length, 0);
  assert.equal(find('div.event').length, 2);
});
