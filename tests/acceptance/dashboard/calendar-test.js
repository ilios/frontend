import destroyApp from '../../helpers/destroy-app';
import moment from 'moment';
import {
  module,
  test,
  skip
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import Ember from 'ember';

const { isEmpty } = Ember;

var application;

module('Acceptance: Dashboard Calendar', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);
    server.create('school', {
      sessionTypes: [1,2,3],
      programs: [1],
      courses: [1]
    });
    server.create('program', {
      programYears: [1,2],
      school: 1,
    });
    server.create('programYear', {
      cohort: 1,
      program: 1,
      startYear: 2015,
    });
    server.create('programYear', {
      cohort: 2,
      program: 1,
      startYear: 2015,
    });
    server.create('cohort', {
      courses: [1],
      programYear: 1,
    });
    server.create('cohort', {
      programYear: 2,
    });
    server.create('sessionType', {
      sessions: [1],
      school: 1,
    });
    server.create('sessionType', {
      sessions: [2],
      school: 1,
    });
    server.create('sessionType', {
      school: 1,
    });
    server.create('session', {
      offerings: [1],
      course: 1,
      sessionType: 1,
    });
    server.create('session', {
      offerings: [2],
      course: 1,
      sessionType: 2,
    });
    server.create('session', {
      offerings: [3],
      course: 2,
    });
    server.create('academicYear', {
      id: 2015,
      title: 2015
    });
    server.create('course', {
      sessions: [1,2],
      level: 1,
      school: 1,
      year: 2015
    });
    server.create('course', {
      sessions: [3],
      year: 2015
    });
    server.create('offering', {
      session: 1
    });
    server.create('offering', {
      session: 2
    });
    server.create('offering', {
      session: 3
    });
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('load month calendar', function(assert) {
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
  visit('/dashboard?show=calendar&view=month');
  andThen(function() {
    assert.equal(currentPath(), 'dashboard');
    let events = find('div.event');
    assert.equal(events.length, 2);
    let eventInfo = '';
    eventInfo += startOfMonth.format('h:mma') + '-' + startOfMonth.clone().add(1, 'hour').format('h:mma') + ': start of month';
    eventInfo += endOfMonth.format('h:mma') + '-' + endOfMonth.clone().add(1, 'hour').format('h:mma') + ': end of month';
    assert.equal(getElementText(events), getText(eventInfo));

  });
});

skip('load week calendar', function(assert) {
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
  visit('/dashboard?show=calendar');
  andThen(function() {
    assert.equal(currentPath(), 'dashboard');
    let events = find('div.event');
    assert.equal(events.length, 2);
    let eventInfo = '';
    eventInfo += startOfWeek.format('h:mma') + '-' + startOfWeek.clone().add(1, 'hour').format('h:mma') + ' start of week';
    eventInfo += endOfWeek.format('h:mma') + '-' + endOfWeek.clone().add(1, 'hour').format('h:mma') + ' end of week';
    assert.equal(getElementText(events), getText(eventInfo));

  });
});

skip('load day calendar', function(assert) {
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
  visit('/dashboard?show=calendar&view=day');
  andThen(function() {
    assert.equal(currentPath(), 'dashboard');
    let events = find('div.event');
    assert.equal(events.length, 1);
    let eventInfo = '';
    eventInfo += today.format('h:mma') + '-' + today.clone().add(1, 'hour').format('h:mma') + ' today';
    assert.equal(getElementText(events), getText(eventInfo));

  });
});

skip('click month day number and go to day', function(assert) {
  let aDayInTheMonth = moment().startOf('month').add(12, 'days').hour(8);
  server.create('userevent', {
    user: 4136,
    name: 'start of month',
    startDate: aDayInTheMonth.format(),
    endDate: aDayInTheMonth.clone().add(1, 'hour').format()
  });
  visit('/dashboard?show=calendar&view=month');
  andThen(function() {
    let dayOfMonth = aDayInTheMonth.date();
    let link = find('.day .clickable').filter(function(){
      return parseInt($(this).text()) === dayOfMonth;
    }).eq(0);
    click(link).then(()=>{
      assert.equal(currentURL(), '/dashboard?date=' + aDayInTheMonth.format('YYYY-MM-DD') + '&show=calendar&view=day');
    });
  });
});

skip('click week day title and go to day', function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    user: 4136,
    name: 'today',
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format()
  });
  visit('/dashboard?show=calendar&view=week');
  andThen(function() {
    let dayOfWeek = today.day();
    click(find('.week-titles .clickable').eq(dayOfWeek)).then(()=>{
      assert.equal(currentURL(), '/dashboard?date=' + today.format('YYYY-MM-DD') + '&show=calendar&view=day');
    });
  });
});

skip('click forward on a day goes to next day', function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    user: 4136,
    name: 'today',
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format()
  });
  visit('/dashboard?show=calendar&view=day');
  andThen(function() {
    click('.calendar-time-picker li:eq(2)').then(()=>{
      assert.equal(currentURL(), '/dashboard?date=' + today.add(1, 'day').format('YYYY-MM-DD') + '&show=calendar&view=day');
    });
  });
});

skip('click forward on a week goes to next week', function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    user: 4136,
    name: 'today',
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format()
  });
  visit('/dashboard?show=calendar&view=week');
  andThen(function() {
    click('.calendar-time-picker li:eq(2)').then(()=>{
      assert.equal(currentURL(), '/dashboard?date=' + today.add(1, 'week').format('YYYY-MM-DD') + '&show=calendar');
    });
  });
});

skip('click forward on a month goes to next month', function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    user: 4136,
    name: 'today',
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format()
  });
  visit('/dashboard?show=calendar&view=month');
  andThen(function() {
    click('.calendar-time-picker li:eq(2)').then(()=>{
      assert.equal(currentURL(), '/dashboard?date=' + today.add(1, 'month').format('YYYY-MM-DD') + '&show=calendar&view=month');
    });
  });
});

skip('click back on a day goes to previous day', function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    user: 4136,
    name: 'today',
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format()
  });
  visit('/dashboard?show=calendar&view=day');
  andThen(function() {
    click('.calendar-time-picker li:eq(0)').then(()=>{
      assert.equal(currentURL(), '/dashboard?date=' + today.subtract(1, 'day').format('YYYY-MM-DD') + '&show=calendar&view=day');
    });
  });
});

skip('click back on a week goes to previous week', function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    user: 4136,
    name: 'today',
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format()
  });
  visit('/dashboard?show=calendar&view=week');
  andThen(function() {
    click('.calendar-time-picker li:eq(0)').then(()=>{
      assert.equal(currentURL(), '/dashboard?date=' + today.subtract(1, 'week').format('YYYY-MM-DD') + '&show=calendar');
    });
  });
});

skip('click back on a month goes to previous month', function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    user: 4136,
    name: 'today',
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format()
  });
  visit('/dashboard?show=calendar&view=month');
  andThen(function() {
    click('.calendar-time-picker li:eq(0)').then(()=>{
      assert.equal(currentURL(), '/dashboard?date=' + today.subtract(1, 'month').format('YYYY-MM-DD') + '&show=calendar&view=month');
    });
  });
});

skip('show user events', function(assert) {
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
  visit('/dashboard?show=calendar');
  andThen(function() {
    let events = find('div.event');
    assert.equal(events.length, 2);
  });
});

let chooseSchoolEvents = function(){
  andThen(function(){
    return click(find('.togglemyschedule span'));
  });
};
skip('show school events', function(assert) {
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
  visit('/dashboard?show=calendar');
  chooseSchoolEvents();
  andThen(function() {
    let events = find('div.event');
    assert.equal(events.length, 2);
  });
});

let showFilters = function(){
  return andThen(function(){
    return click(find('.showfilters span'));
  });
};

let pickSessionType = function(i) {
  let types = find('.sessiontypefilter');
  return click(find('li>span', types).eq(i));
};

skip('test session type filter', function(assert) {
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
  visit('/dashboard?show=calendar');
  showFilters();
  andThen(function() {
    let events = find('div.event');
    assert.equal(events.length, 2);
    pickSessionType(0).then(() => {
      events = find('div.event');
      assert.equal(events.length, 1);
    });

  });
  andThen(function() {
    pickSessionType(1).then(() => {
      let events = find('div.event');
      assert.equal(events.length, 2);
    });
  });
  andThen(function() {
    pickSessionType(0).then(() => {
      pickSessionType(1).then(() => {
        pickSessionType(2).then(() => {
          let events = find('div.event');
          assert.equal(events.length, 0);
        });
      });
    });
  });
});

let pickCourseLevel = function(i) {
  let levels = find('.courselevelfilter');
  return click(find('li>span', levels).eq(i));
};
let clearCourseLevels = function() {
  let levels = find('.courselevelfilter');
  return click(find('.checkbox:first', levels));
};

skip('test course level filter', function(assert) {
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
  visit('/dashboard?show=calendar');
  showFilters();
  chooseDetailFilter();
  andThen(function() {
    let events = find('div.event');
    assert.equal(events.length, 2);
    pickCourseLevel(0).then(() => {
      events = find('div.event');
      assert.equal(events.length, 2);
    });
  });
  andThen(function() {
    clearCourseLevels().then(() => {
      pickCourseLevel(2).then(() => {
        let events = find('div.event');
        assert.equal(events.length, 0);
      });
    });
  });
});

let pickCohort = function(i) {
  let cohorts = find('.cohortfilter');
  return click(find('li>span', cohorts).eq(i));
};
let clearCohorts = function() {
  let cohorts = find('.cohortfilter');
  return click(find('.checkbox:first', cohorts));
};

skip('test cohort filter', function(assert) {
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
  visit('/dashboard?show=calendar');
  showFilters();
  chooseDetailFilter();
  andThen(function() {
    let events = find('div.event');
    assert.equal(events.length, 2);
    pickCohort(0).then(() => {
      events = find('div.event');
      assert.equal(events.length, 2);
    });
  });
  andThen(function() {
    clearCohorts().then(() => {
      pickCohort(1).then(() => {
        let events = find('div.event');
        assert.equal(events.length, 0);
      });
    });
  });
});

let chooseDetailFilter = function(){
  andThen(function(){
    return click(find('.togglecoursefilters span'));
  });
};

let pickCourse = function(i) {
  let courses = find('.coursefilter');
  return click(find('li>span', courses).eq(i));
};
let clearCourses = function() {
  let courses = find('.coursefilter');
  return click(find('.checkbox:first', courses));
};

skip('test course filter', function(assert) {
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
  visit('/dashboard?show=calendar');
  showFilters();
  andThen(function() {
    let events = find('div.event');
    assert.equal(events.length, 3);
    pickCourse(0).then(() => {
      events = find('div.event');
      assert.equal(events.length, 2);
    });
  });
  andThen(function() {
    clearCourses().then(() => {
      pickCourse(1).then(() => {
        let events = find('div.event');
        assert.equal(events.length, 1);
      });
    });
  });
});

skip('test course and session type filter together', function(assert) {
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
  visit('/dashboard?show=calendar');
  showFilters();
  andThen(function() {
    let events = find('div.event');
    assert.equal(events.length, 3);
    pickCourse(0).then(() => {
      events = find('div.event');
      assert.equal(events.length, 2);
    });
  });
  andThen(function() {
    clearCourses().then(() => {
      pickCourse(0).then(() => {
        pickSessionType(0).then(() => {
          let events = find('div.event');
          assert.equal(events.length, 1);
        });
      });
    });
  });
});

skip('agenda show next seven days of events', function(assert) {
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
  visit('/dashboard?show=agenda');
  andThen(function() {
    let events = find('tr');
    assert.equal(events.length, 2);
    assert.equal(getElementText(events.eq(0)), getText(today.format('dddd, MMMM Do, YYYY h:mma') + 'event 0'));
    assert.equal(getElementText(events.eq(1)), getText(endOfTheWeek.format('dddd, MMMM Do, YYYY h:mma') + 'event 1'));
  });
});

test('academic year filters cohort', function(assert) {
  server.create('academicYear', {
    id: 2014,
    title: 2014
  });
  server.db.schools.update({programs: [1,2]});
  server.create('program', {
    programYears: [3],
    school: 1,
  });
  server.create('programYear', {
    startYear: 2014,
    program: 2,
    cohort: 3
  });
  server.create('cohort', {
    programYear: 3
  });
  visit('/dashboard?show=calendar');
  showFilters();
  chooseDetailFilter();
  andThen(() => {
    pickOption('.calendar-year-picker select', '2015 - 2016', assert);
    andThen(()=> {
      let cohortFilter = find('.cohortfilter li');
      assert.equal(cohortFilter.length, 3);
    });
    pickOption('.calendar-year-picker select', '2014 - 2015', assert);
    andThen(()=> {
      let cohortFilter = find('.cohortfilter li');
      assert.equal(cohortFilter.length, 1);
    });
  });
});

test('academic year filters courses', function(assert) {
  server.create('academicYear', {
    id: 2014,
    title: 2014
  });
  server.create('course', {
    year: 2014
  });
  visit('/dashboard?show=calendar');
  showFilters();
  andThen(() => {
    pickOption('.calendar-year-picker select', '2015 - 2016', assert);
    andThen(()=> {
      let courseFilters = find('.coursefilter li');
      assert.equal(courseFilters.length, 2);
    });
    pickOption('.calendar-year-picker select', '2014 - 2015', assert);
    andThen(()=> {
      let courseFilters = find('.coursefilter li');
      assert.equal(courseFilters.length, 1);
    });
  });
});

test('clear all filters', function(assert) {
  const clearFilter = '.calendar-clear-filters';
  const sessiontype = '.sessiontypefilter li:first input';
  const courselevel = '.courselevelfilter li:first input';
  const cohort = '.cohortfilter li:first input';

  visit('/dashboard?show=calendar');
  showFilters();
  chooseDetailFilter();
  andThen(() => {
    assert.ok(isEmpty(find(clearFilter)), 'clear filter button is inactive');
  });

  click(sessiontype);
  click(courselevel);
  click(cohort);
  andThen(() => {
    assert.ok(find(clearFilter).text(), 'Clear Filters', 'clear filter button is active');
    assert.ok(find(sessiontype).prop('checked'), 'filter is checked');
    assert.ok(find(courselevel).prop('checked'), 'filter is checked');
    assert.ok(find(cohort).prop('checked'), 'filter is checked');
  });

  click(clearFilter);
  andThen(() => {
    assert.ok(isEmpty(find(clearFilter)), 'clear filter button is inactive');
    assert.ok(!find(sessiontype).prop('checked'), 'filter is unchecked');
    assert.ok(!find(courselevel).prop('checked'), 'filter is unchecked');
    assert.ok(!find(cohort).prop('checked'), 'filter is unchecked');
  });
});

test('filter tags work properly', function(assert) {
  const sessiontype = '.sessiontypefilter li:first input';
  const courselevel = '.courselevelfilter li:first input';
  const cohort = '.cohortfilter li:first input';

  const filtersList = '.filters-list';
  const clearFilter = '.filters-clear-filters';

  function getTagText(n) {
    return find(`.filter-tag:eq(${n})`).text().trim();
  }

  function clickTag(n) {
    click(`.filter-tag:eq(${n})`);
  }

  visit('/dashboard?show=calendar');
  showFilters();
  chooseDetailFilter();
  andThen(() => {
    assert.ok(isEmpty(find(filtersList)), 'filter tags list is inactive');
  });

  click(sessiontype);
  click(courselevel);
  click(cohort);
  andThen(() => {
    assert.equal(getTagText(0), 'session type 0', 'filter tag is active');
    assert.equal(getTagText(1), 'Course Level 1', 'filter tag is active');
    assert.equal(getTagText(2), 'cohort 0 program 0', 'filter tag is active');
  });


  clickTag(1);
  andThen(() => {
    assert.ok(!find(courselevel).prop('checked'), 'filter is unchecked');
    assert.equal(getTagText(0), 'session type 0', 'filter tag is active');
    assert.equal(getTagText(1), 'cohort 0 program 0', 'filter tag is active');
  });

  clickTag(0);
  andThen(() => {
    assert.equal(getTagText(0), 'cohort 0 program 0', 'filter tag is active');
  });

  click(clearFilter);
  andThen(() => {
    assert.ok(isEmpty(find(filtersList)), 'filter tags list is inactive');
    assert.ok(!find(sessiontype).prop('checked'), 'filter is unchecked');
    assert.ok(!find(cohort).prop('checked'), 'filter is unchecked');
  });
});

test('query params work', function(assert) {
  const calendarPicker = '.calendar-view-picker button:eq(3)';
  const scheduleSlider = '.switch-label:eq(0)';
  const filterSlider = '.switch-label:eq(1)';
  const academicYearDropdown = '.calendar-year-picker select';

  visit('/dashboard');
  click(calendarPicker);
  andThen(() => {
    assert.equal(currentURL(), '/dashboard?show=calendar');
  });

  click(scheduleSlider);
  andThen(() => {
    assert.equal(currentURL(), '/dashboard?mySchedule=false&show=calendar');
  });

  click(filterSlider);
  andThen(() => {
    assert.equal(currentURL(), '/dashboard?mySchedule=false&show=calendar&showFilters=true');
  });

  chooseDetailFilter();
  andThen(() => {
    assert.equal(currentURL(), '/dashboard?courseFilters=false&mySchedule=false&show=calendar&showFilters=true');
  });

  pickOption(academicYearDropdown, '2015 - 2016', assert);
  andThen(() => {
    assert.equal(currentURL(), '/dashboard?academicYear=2015&courseFilters=false&mySchedule=false&show=calendar&showFilters=true');
  });

  click(filterSlider);
  andThen(() => {
    assert.equal(currentURL(), '/dashboard?mySchedule=false&show=calendar');
  });
});

test('week summary dispalys the whole week', async function(assert) {
  let startOfTheWeek = moment().day(1).hour(0).minute(2);
  server.create('userevent', {
    user: 4136,
    startDate: startOfTheWeek.format(),
    endDate: startOfTheWeek.clone().add(1, 'hour').format(),
    offering: 1,
    isPublished: true,
  });
  let endOfTheWeek = moment().day(7).hour(22).minute(5);
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
