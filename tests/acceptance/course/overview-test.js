import destroyApp from '../../helpers/destroy-app';
import moment from 'moment';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import { openDatepicker } from 'ember-pikaday/helpers/pikaday';

let application;
let url = '/courses/1';
module('Acceptance: Course - Overview', {
  beforeEach: function () {
    application = startApp();
    setupAuthentication(application);
    server.create('school');
    server.createList('courseClerkshipType', 2);
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('check fields', async function (assert) {
  let director = server.create('userRole', {
    title: 'course director'
  });
  server.db.users.update(4136, {roles: [director]});
  let clerkshipType = server.create('courseClerkshipType');
  let course = server.create('course', {
    year: 2013,
    schoolId: 1,
    clerkshipTypeId: 3,
    externalId: 123,
    level: 3,
  });
  server.create('user', {
    firstName: 'A',
    lastName: 'Director',
    roles: [director],
    directedCourses: [course]
  });

  await visit(url);

  assert.equal(currentPath(), 'course.index');
  let container = find('.course-overview');
  let startDate = moment.utc(course.startDate).format('L');
  assert.equal(getElementText(find('.coursestartdate', container)), 'Start:' + startDate);
  assert.equal(getElementText(find('.courseexternalid', container)), 'CourseID:123');
  assert.equal(getElementText(find('.courselevel', container)), 'Level:3');
  let endDate = moment.utc(course.endDate).format('L');
  assert.equal(getElementText(find('.courseenddate', container)), 'End:' + endDate);
  assert.equal(getElementText(find('.universallocator', container)), 'ILIOS' + course.id);
  assert.equal(getElementText(find('.clerkshiptype', container)), getText('Clerkship Type:' + clerkshipType.title));
  assert.equal(getElementText(find('.coursedirectors', container)), getText('Directors: A M. Director'));
  assert.ok(find('a.rollover', container).prop('href').search(/courses\/1\/rollover/) > -1);
});

test('check detail fields', async function(assert) {
  let clerkshipType = server.create('courseClerkshipType');
  let course = server.create('course', {
    year: 2013,
    schoolId: 1,
    clerkshipTypeId: 3,
    externalId: 123,
    level: 3
  });
  await visit(url + '?details=true');

  assert.equal(currentPath(), 'course.index');
  let container = find('.course-overview');
  let startDate = moment.utc(course.startDate).format('L');
  assert.equal(getElementText(find('.coursestartdate .editable', container)), startDate);
  assert.equal(getElementText(find('.courseexternalid .editable', container)), 123);
  assert.equal(getElementText(find('.courselevel .editable', container)), 3);
  let endDate = moment.utc(course.endDate).format('L');
  assert.equal(getElementText(find('.courseenddate .editable', container)), endDate);
  assert.equal(getElementText(find('.clerkshiptype .editable', container)), getText(clerkshipType.title));
});

test('pick clerkship type', async function(assert) {
  server.create('course', {
    year: 2013,
    schoolId: 1,
  });
  await visit(url);
  assert.equal(getElementText(find('.course-overview .clerkshiptype')), getText('Clerkship Type: Not a Clerkship'));
  await visit(url + '?details=true');
  let container = find('.course-overview');
  assert.equal(getElementText(find('.clerkshiptype .editable', container)), getText('Not a Clerkship'));
  await click(find('.clerkshiptype .editable', container));
  let options = find('.clerkshiptype select option', container);
  //add one for the blank option
  assert.equal(options.length, 3);
  for(let i = 0; i < 3; i++){
    let title = i===0?'Not a Clerkship':`clerkship type ${i - 1}`;
    assert.equal(getElementText(options.eq(i)), getText(title));
  }
  await pickOption(find('.clerkshiptype select', container), 'clerkship type 1', assert);
  await click(find('.clerkshiptype .actions .done', container));
  assert.equal(getElementText(find('.clerkshiptype .editable', container)), getText('clerkship type 1'));
});

test('remove clerkship type', async function(assert) {
  server.create('courseClerkshipType');
  server.create('course', {
    year: 2013,
    schoolId: 1,
    clerkshipTypeId: 3,
  });
  await visit(url + '?details=true');

  let container = find('.course-overview');
  await click(find('.clerkshiptype .editable', container));
  await pickOption(find('.clerkshiptype select', container), 'Not a Clerkship', assert);
  await click(find('.clerkshiptype .actions .done', container));
  assert.equal(getElementText(find('.clerkshiptype .editable', container)), getText('Not a Clerkship'));
});

test('open and close details', async function(assert) {
  server.create('course', {
    year: 2013,
    schoolId: 1
  });

  await visit(url);
  assert.equal(currentPath(), 'course.index');
  assert.equal(find('.course-details .title').length, 3);
  await click('.detail-collapsed-control');
  assert.ok(find('.title').length > 2);
  assert.equal(currentURL(), '/courses/1?details=true');
  assert.ok(find('.course-details .title').length > 2);
  await click('.detail-collapsed-control');
  assert.equal(find('.course-details .title').length, 3);
  assert.equal(currentURL(), '/courses/1');
});

test('change title', async function(assert) {
  server.create('course', {
    year: 2013,
    schoolId: 1,
  });
  await visit(url);
  assert.equal(getElementText(find('.course-header .title')), getText('course 0 2013-2014'));
  await visit(url + '?details=true');
  let container = find('.course-header .title');
  assert.equal(getElementText(find('.editable', container)), getText('course 0'));
  await click(find('.editable', container));
  let input = find('input', container);
  assert.equal(getText(input.val()), getText('course 0'));
  await fillIn(input, 'test new title');
  await click(find('.done', container));
  assert.equal(getElementText(container), getText('test new title 2013-2014'));
});

test('change start date', async function(assert) {
  let course = server.create('course', {
    year: 2013,
    startDate: new Date('2013-04-23'),
    endDate: new Date('2015-05-22'),
    schoolId: 1,
  });
  let startDate = moment.utc(course.startDate).format('L');
  await visit(url);
  assert.equal(getElementText(find('.course-overview .coursestartdate')), getText('Start:' + startDate));
  await visit(url + '?details=true');
  let container = find('.course-overview');
  assert.equal(getElementText(find('.coursestartdate', container)), getText('Start:' + startDate));
  await click(find('.coursestartdate .editable', container));
  let input = find('.coursestartdate .editinplace input', container);
  assert.equal(getText(input.val()), getText(startDate));
  let interactor = openDatepicker(find('.coursestartdate input', container));
  assert.equal(interactor.selectedYear(), moment(course.startDate).format('YYYY'));
  let newDate = moment(course.startDate).add(1, 'year').add(1, 'month');
  interactor.selectDate(newDate.toDate());
  await click(find('.coursestartdate .editinplace .actions .done', container));
  assert.equal(getElementText(find('.coursestartdate', container)), getText('Start:' + newDate.format('L')));
});

test('start date validation', async function(assert) {
  assert.expect(2);
  const course = server.create('course', {
    year: 2013,
    startDate: new Date('2013-04-23'),
    endDate: new Date('2013-05-22'),
    schoolId: 1,
  });
  await visit(url + '?details=true');
  const container = find('.course-overview');
  await click(find('.coursestartdate .editable', container));
  assert.notOk(find('.coursestartdate .validation-error-message', container).length, 'no validation error shown.');
  const interactor = openDatepicker(find('.coursestartdate input', container));
  const newDate = moment(course.startDate).add(1, 'year');
  interactor.selectDate(newDate.toDate());
  await click(find('.coursestartdate .editinplace .actions .done', container));
  assert.ok(find('.coursestartdate .validation-error-message', container).length, 'validation error shows.');
});

test('change end date', async function(assert) {
  let course = server.create('course', {
    year: 2013,
    schoolId: 1,
    startDate: new Date('2013-04-23'),
    endDate: new Date('2015-05-22'),
  });
  let endDate = moment.utc(course.endDate).format('L');
  await visit(url);
  assert.equal(getElementText(find('.course-overview .courseenddate')), getText('End:' + endDate));
  await visit(url + '?details=true');
  let container = find('.course-overview');
  assert.equal(getElementText(find('.courseenddate', container)), getText('End:' + endDate));
  await click(find('.courseenddate .editable', container));
  let input = find('.courseenddate .editinplace input', container);
  assert.equal(getText(input.val()), getText(endDate));
  let interactor = openDatepicker(find('.courseenddate input', container));
  assert.equal(interactor.selectedYear(), moment(course.endDate).format('YYYY'));
  let newDate = moment(course.endDate).add(1, 'year').add(1, 'month');
  interactor.selectDate(newDate.toDate());
  await click(find('.courseenddate .editinplace .actions .done', container));
  assert.equal(getElementText(find('.courseenddate', container)), getText('End:' + newDate.format('L')));
});

test('end date validation', async function(assert) {
  assert.expect(2);
  const course = server.create('course', {
    year: 2013,
    startDate: new Date('2013-04-23'),
    endDate: new Date('2013-05-22'),
    schoolId: 1,
  });
  await visit(url + '?details=true');
  const container = find('.course-overview');
  await click(find('.courseenddate .editable', container));
  assert.notOk(find('.courseenddate .validation-error-message', container).length, 'no validation error shown.');
  const interactor = openDatepicker(find('.courseenddate input', container));
  const newDate = moment(course.endDate).subtract(1, 'year');
  interactor.selectDate(newDate.toDate());
  await click(find('.courseenddate .editinplace .actions .done', container));
  assert.ok(find('.courseenddate .validation-error-message', container).length, 'validation error shows.');
});

test('change externalId', async function(assert) {
  server.create('course', {
    year: 2013,
    schoolId: 1,
    externalId: 'abc123'
  });
  await visit(url);
  assert.equal(getElementText(find('.course-overview .courseexternalid')), getText('CourseID: abc123'));
  await visit(url + '?details=true');
  let container = find('.course-overview');
  assert.equal(getElementText(find('.courseexternalid', container)), getText('CourseID: abc123'));
  await click(find('.courseexternalid .editable', container));
  let input = find('.courseexternalid .editinplace input', container);
  assert.equal(getText(input.val()), getText('abc123'));
  await fillIn(input, 'testnewid');
  await click(find('.courseexternalid .editinplace .actions .done', container));
  assert.equal(getElementText(find('.courseexternalid', container)), getText('CourseID: testnewid'));
});

test('change level', async function(assert) {
  server.create('course', {
    year: 2013,
    schoolId: 1,
    level: 3
  });
  await visit(url);
  assert.equal(getElementText(find('.course-overview .courselevel')), getText('Level: 3'));
  await visit(url + '?details=true');
  let container = find('.course-overview');
  assert.equal(getElementText(find('.courselevel .editable', container)), 3);
  await click(find('.courselevel .editable', container));
  let options = find('.courselevel select option', container);
  for(let i = 0; i < 5; i++){
    assert.equal(getElementText(options.eq(i)), i+1);
  }
  await pickOption(find('.courselevel select', container), '1', assert);
  await click(find('.courselevel .actions .done', container));
  assert.equal(getElementText(find('.course-overview .courselevel')), getText('Level: 1'));
});

test('remove director', async function(assert) {
  server.create('user', {
    firstName: 'A',
    lastName: 'Director'
  });
  server.create('course', {
    year: 2013,
    schoolId: 1,
    externalId: 123,
    level: 3,
    directorIds: [2]
  });
  visit(url);
  await click('.coursedirectors .clickable');
  await click('.coursedirectors li:eq(0)');
  await click('.coursedirectors .bigadd');
  assert.equal(getElementText(find('.coursedirectors')), getText('Directors: None'));
});


test('manage directors', async function(assert) {
  let directorRole = server.create('userRole', {
    title: 'Course Director'
  });
  let addedGuy = server.create('user', {
    firstName: 'Added',
    lastName: 'Guy',
    roles: [directorRole]
  });
  server.create('user', {
    firstName: 'Disabled',
    lastName: 'Guy',
    enabled: false,
    roles: [directorRole]
  });
  server.db.users.update(4136, {roles: [directorRole]});

  let secondRole = server.create('userRole');
  server.create('user', {
    firstName: 'Not a director',
    lastName: 'Guy',
    roles: [secondRole]
  });

  server.create('course', {
    year: 2013,
    schoolId: 1,
    externalId: 123,
    level: 3,
    directors: [addedGuy]
  });
  await visit(url);
  await click('.coursedirectors .clickable');

  let directors = find('.coursedirectors');
  let searchBox = find('.search-box', directors);
  assert.equal(searchBox.length, 1);
  searchBox = searchBox.eq(0);
  let searchBoxInput = find('input', searchBox);
  await fillIn(searchBoxInput, 'guy');
  await click('span.search-icon', searchBox);
  let searchResults = find('.live-search li', directors);
  assert.equal(searchResults.length, 4);
  assert.equal(getElementText(searchResults.eq(0)), getText('3 Results'));
  assert.equal(getElementText(searchResults.eq(1)), getText('0 guy M. Mc0son user@example.edu'));
  assert.notOk(find(searchResults.eq(1)).hasClass('inactive'));
  assert.equal(getElementText(searchResults.eq(2)), getText('Added M. Guy user@example.edu'));
  assert.ok(find(searchResults.eq(2)).hasClass('inactive'));
  assert.equal(getElementText(searchResults.eq(3)), getText('Disabled M. Guy user@example.edu'));
  assert.ok(find(searchResults.eq(3)).hasClass('inactive'));

  await click('li:eq(0)', directors);
  assert.ok(!find('.live-search li:eq(2)', directors).hasClass('inactive'));
  await click(searchResults.eq(1));
  await click('.coursedirectors .bigadd');
  assert.equal(getElementText(find('.coursedirectors')), getText('Directors: 0 guy M. Mc0son'));
});

//test for a bug where the search results were not cleared between searches
test('search twice and list should be correct', async function(assert) {
  const directorRole = server.create('userRole');
  let user = server.create('user', {
    firstName: 'Added',
    lastName: 'Guy',
    roles: [directorRole]
  });
  server.create('course', {
    year: 2013,
    schoolId: 1,
    externalId: 123,
    level: 3,
    directors: [user]
  });
  server.db.users.update(4136, {roles: [directorRole]});
  await visit(url);
  await click('.coursedirectors .clickable');
  let directors = find('.coursedirectors');
  let searchBox = find('.search-box', directors);
  assert.equal(searchBox.length, 1);
  searchBox = searchBox.eq(0);
  let searchBoxInput = find('input', searchBox);
  await fillIn(searchBoxInput, 'guy');
  await click('span.search-icon', searchBox);
  let searchResults = find('.live-search li', directors);
  assert.equal(searchResults.length, 3);
  assert.equal(getElementText(searchResults.eq(0)), getText('2 Results'));
  assert.equal(getElementText(searchResults.eq(1)), getText('0 guy M. Mc0son user@example.edu'));
  assert.equal(getElementText(searchResults.eq(2)), getText('Added M. Guy user@example.edu'));
  await click(searchResults.eq(1));
  searchBoxInput = find('input', searchBox);
  await fillIn(searchBoxInput, 'guy');
  await click('span.search-icon', searchBox);
  searchResults = find('.live-search li', directors);
  assert.equal(searchResults.length, 3);
  assert.equal(getElementText(searchResults.eq(0)), getText('2 Results'));
  assert.equal(getElementText(searchResults.eq(1)), getText('0 guy M. Mc0son user@example.edu'));
  assert.equal(getElementText(searchResults.eq(2)), getText('Added M. Guy user@example.edu'));
});

test('click rollover', async function(assert) {
  const directorRole = server.create('userRole', {
    title: 'course director'
  });
  server.create('course', {
    year: 2013,
    schoolId: 1,
  });
  server.db.users.update(4136, {roles: [directorRole]});
  const rollover = '.course-overview a.rollover';
  await visit(url);
  await click(rollover);

  assert.equal(currentPath(), 'course.rollover');
});

test('rollover hidden from instructors', async function(assert) {
  const role = server.create('userRole', {
    title: 'instructor'
  });
  server.create('course', {
    year: 2013,
    schoolId: 1,
  });
  server.db.users.update(4136, {roles: [role]});
  await visit(url);
  const container = '.course-overview';
  const rollover = `${container} a.rollover`;

  assert.equal(currentPath(), 'course.index');
  assert.equal(find(rollover).length, 0);
});

test('rollover visible to developers', async function(assert) {
  const role = server.create('userRole', {
    title: 'developer'
  });
  server.create('course', {
    year: 2013,
    schoolId: 1,
  });
  server.db.users.update(4136, {roles: [role]});
  await visit(url);
  const container = '.course-overview';
  const rollover = `${container} a.rollover`;

  assert.equal(currentPath(), 'course.index');
  assert.equal(find(rollover).length, 1);
});

test('rollover visible to course directors', async function(assert) {
  const role = server.create('userRole', {
    title: 'course director'
  });
  server.create('course', {
    year: 2013,
    schoolId: 1,
  });
  server.db.users.update(4136, {roles: [role]});
  await visit(url);
  const container = '.course-overview';
  const rollover = `${container} a.rollover`;

  assert.equal(currentPath(), 'course.index');
  assert.equal(find(rollover).length, 1);
});

test('rollover hidden on rollover route', async function(assert) {
  const role = server.create('userRole', {
    title: 'course director'
  });
  server.create('course', {
    year: 2013,
    schoolId: 1,
  });
  server.db.users.update(4136, {roles: [role]});
  await visit(`${url}/rollover`);
  const container = '.course-overview';
  const rollover = `${container} a.rollover`;

  assert.equal(currentPath(), 'course.rollover');
  assert.equal(find(rollover).length, 0);
});
