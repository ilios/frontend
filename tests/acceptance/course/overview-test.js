import destroyApp from '../../helpers/destroy-app';
import moment from 'moment';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import { openDatepicker } from 'ember-pikaday/helpers/pikaday';

var application;
var fixtures = {};
var url = '/courses/1';
module('Acceptance: Course - Overview', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application, false);
    server.create('school');
    fixtures.clerkshipTypes = [];
    fixtures.clerkshipTypes.pushObjects(server.createList('courseClerkshipType', 2));
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('check fields', function(assert) {
  server.create('user', {
    id: 4136,
    roles: [1],
  });

  server.create('userRole', {
    users: [4136],
    title: 'course director'
  });
  server.create('user', {
    id: 2,
    directedCourses: [1],
    firstName: 'A',
    lastName: 'Director'
  });
  var course = server.create('course', {
    year: 2013,
    school: 1,
    clerkshipType: 3,
    externalId: 123,
    level: 3,
    directors: [2]
  });
  var clerkshipType = server.create('courseClerkshipType', {
    courses: [1]
  });
  visit(url);

  pauseTest();

  andThen(function() {
    assert.equal(currentPath(), 'course.index');
    var container = find('.course-overview');
    var startDate = moment.utc(course.startDate).format('L');
    assert.equal(getElementText(find('.coursestartdate', container)), 'Start:' + startDate);
    assert.equal(getElementText(find('.courseexternalid', container)), 'CourseID:123');
    assert.equal(getElementText(find('.courselevel', container)), 'Level:3');
    var endDate = moment.utc(course.endDate).format('L');
    assert.equal(getElementText(find('.courseenddate', container)), 'End:' + endDate);
    assert.equal(getElementText(find('.universallocator', container)), 'ILIOS' + course.id);
    assert.equal(getElementText(find('.clerkshiptype', container)), getText('Clerkship Type:' + clerkshipType.title));
    assert.equal(getElementText(find('.coursedirectors', container)), getText('Directors: A M. Director'));
    assert.ok(find('a.rollover', container).prop('href').search(/courses\/1\/rollover/) > -1);

  });
});

test('check detail fields', function(assert) {
  server.create('user', {
    id: 4136
  });
  var course = server.create('course', {
    year: 2013,
    school: 1,
    clerkshipType: 3,
    externalId: 123,
    level: 3
  });
  var clerkshipType = server.create('courseClerkshipType', {
    courses: [1]
  });
  visit(url + '?details=true');

  andThen(function() {
    assert.equal(currentPath(), 'course.index');
    var container = find('.course-overview');
    var startDate = moment.utc(course.startDate).format('L');
    assert.equal(getElementText(find('.coursestartdate .editable', container)), startDate);
    assert.equal(getElementText(find('.courseexternalid .editable', container)), 123);
    assert.equal(getElementText(find('.courselevel .editable', container)), 3);
    var endDate = moment.utc(course.endDate).format('L');
    assert.equal(getElementText(find('.courseenddate .editable', container)), endDate);
    assert.equal(getElementText(find('.clerkshiptype .editable', container)), getText(clerkshipType.title));
  });
});

test('pick clerkship type', function(assert) {
  server.create('user', {
    id: 4136
  });
  server.create('course', {
    year: 2013,
    school: 1,
  });
  visit(url);
  andThen(function() {
    assert.equal(getElementText(find('.course-overview .clerkshiptype')), getText('Clerkship Type: Not a Clerkship'));
  });
  visit(url + '?details=true');
  andThen(function() {
    var container = find('.course-overview');
    assert.equal(getElementText(find('.clerkshiptype .editable', container)), getText('Not a Clerkship'));
    click(find('.clerkshiptype .editable', container));
    andThen(function(){
      let options = find('.clerkshiptype select option', container);
      //add one for the blank option
      assert.equal(options.length, fixtures.clerkshipTypes.length + 1);
      for(let i = 0; i < fixtures.clerkshipTypes.length + 1; i++){
        let title = i===0?'Not a Clerkship':fixtures.clerkshipTypes[i-1].title;
        assert.equal(getElementText(options.eq(i)), getText(title));
      }
      pickOption(find('.clerkshiptype select', container), fixtures.clerkshipTypes[1].title, assert);
      click(find('.clerkshiptype .actions .done', container));
      andThen(function(){
        assert.equal(getElementText(find('.clerkshiptype .editable', container)), getText(fixtures.clerkshipTypes[1].title));
      });
    });
  });
});

test('remove clerkship type', function(assert) {
  server.create('user', {
    id: 4136
  });
  server.create('course', {
    year: 2013,
    school: 1,
    clerkshipType: 3,
  });
  server.create('courseClerkshipType', {
    courses: [1]
  });
  visit(url + '?details=true');

  andThen(function() {
    var container = find('.course-overview');
    click(find('.clerkshiptype .editable', container));
    andThen(function(){
      pickOption(find('.clerkshiptype select', container), 'Not a Clerkship', assert);
      click(find('.clerkshiptype .actions .done', container));
      andThen(function(){
        assert.equal(getElementText(find('.clerkshiptype .editable', container)), getText('Not a Clerkship'));
      });
    });
  });
});

test('open and close details', function(assert) {
  server.create('user', {
    id: 4136
  });
  server.create('course', {
    year: 2013,
    school: 1
  });

  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.index');
    assert.equal(find('.course-details .title').length, 3);
    click('.detail-collapsed-control').then(function(){
      assert.ok(find('.title').length > 2);
      assert.equal(currentURL(), '/courses/1?details=true');
    });
  });

  andThen(function() {
    assert.ok(find('.course-details .title').length > 2);
    click('.detail-collapsed-control').then(function(){
      assert.equal(find('.course-details .title').length, 3);
      assert.equal(currentURL(), '/courses/1');
    });
  });
});

test('change title', function(assert) {
  server.create('user', {
    id: 4136
  });
  server.create('course', {
    year: 2013,
    school: 1,
  });
  visit(url);
  andThen(function() {
    assert.equal(getElementText(find('.course-header .title')), getText('course 0 2013-2014'));
  });
  visit(url + '?details=true');
  andThen(function() {
    let container = find('.course-header .title');
    assert.equal(getElementText(find('.editable', container)), getText('course 0'));
    click(find('.editable', container));
    andThen(function(){
      let input = find('input', container);
      assert.equal(getText(input.val()), getText('course 0'));
      fillIn(input, 'test new title');
      click(find('.done', container));
      andThen(function(){
        assert.equal(getElementText(container), getText('test new title 2013-2014'));
      });
    });
  });
});

test('change start date', function(assert) {
  server.create('user', {
    id: 4136
  });
  var course = server.create('course', {
    year: 2013,
    startDate: new Date('2013-04-23'),
    endDate: new Date('2015-05-22'),
    school: 1,
  });
  var startDate = moment.utc(course.startDate).format('L');
  visit(url);
  andThen(function() {
    assert.equal(getElementText(find('.course-overview .coursestartdate')), getText('Start:' + startDate));
  });
  visit(url + '?details=true');
  andThen(function() {
    var container = find('.course-overview');
    assert.equal(getElementText(find('.coursestartdate', container)), getText('Start:' + startDate));
    click(find('.coursestartdate .editable', container));
    andThen(function(){
      var input = find('.coursestartdate .editinplace input', container);
      assert.equal(getText(input.val()), getText(startDate));
      var interactor = openDatepicker(find('.coursestartdate input', container));
      assert.equal(interactor.selectedYear(), moment(course.startDate).format('YYYY'));
      var newDate = moment(course.startDate).add(1, 'year').add(1, 'month');
      interactor.selectDate(newDate.toDate());
      click(find('.coursestartdate .editinplace .actions .done', container));
      andThen(function(){
        assert.equal(getElementText(find('.coursestartdate', container)), getText('Start:' + newDate.format('L')));
      });

    });
  });
});

test('start date validation', function(assert) {
  assert.expect(2);
  server.create('user', {
    id: 4136
  });
  const course = server.create('course', {
    year: 2013,
    startDate: new Date('2013-04-23'),
    endDate: new Date('2013-05-22'),
    school: 1,
  });
  visit(url + '?details=true');
  andThen(function() {
    const container = find('.course-overview');
    click(find('.coursestartdate .editable', container));
    andThen(function(){
      assert.notOk(find('.coursestartdate .validation-error-message', container).length, 'no validation error shown.');
      const interactor = openDatepicker(find('.coursestartdate input', container));
      const newDate = moment(course.startDate).add(1, 'year');
      interactor.selectDate(newDate.toDate());
      click(find('.coursestartdate .editinplace .actions .done', container));
      andThen(function(){
        assert.ok(find('.coursestartdate .validation-error-message', container).length, 'validation error shows.');
      });
    });
  });
});

test('change end date', function(assert) {
  server.create('user', {
    id: 4136
  });
  var course = server.create('course', {
    year: 2013,
    school: 1,
    startDate: new Date('2013-04-23'),
    endDate: new Date('2015-05-22'),
  });
  var endDate = moment.utc(course.endDate).format('L');
  visit(url);
  andThen(function() {
    assert.equal(getElementText(find('.course-overview .courseenddate')), getText('End:' + endDate));
  });
  visit(url + '?details=true');
  andThen(function() {
    var container = find('.course-overview');
    assert.equal(getElementText(find('.courseenddate', container)), getText('End:' + endDate));
    click(find('.courseenddate .editable', container));
    andThen(function(){
      var input = find('.courseenddate .editinplace input', container);
      assert.equal(getText(input.val()), getText(endDate));
      var interactor = openDatepicker(find('.courseenddate input', container));
      assert.equal(interactor.selectedYear(), moment(course.endDate).format('YYYY'));
      var newDate = moment(course.endDate).add(1, 'year').add(1, 'month');
      interactor.selectDate(newDate.toDate());
      click(find('.courseenddate .editinplace .actions .done', container));
      andThen(function(){
        assert.equal(getElementText(find('.courseenddate', container)), getText('End:' + newDate.format('L')));
      });

    });
  });
});

test('end date validation', function(assert) {
  assert.expect(2);
  server.create('user', {
    id: 4136
  });
  const course = server.create('course', {
    year: 2013,
    startDate: new Date('2013-04-23'),
    endDate: new Date('2013-05-22'),
    school: 1,
  });
  visit(url + '?details=true');
  andThen(function() {
    const container = find('.course-overview');
    click(find('.courseenddate .editable', container));
    andThen(function(){
      assert.notOk(find('.courseenddate .validation-error-message', container).length, 'no validation error shown.');
      const interactor = openDatepicker(find('.courseenddate input', container));
      const newDate = moment(course.endDate).subtract(1, 'year');
      interactor.selectDate(newDate.toDate());
      click(find('.courseenddate .editinplace .actions .done', container));
      andThen(function(){
        assert.ok(find('.courseenddate .validation-error-message', container).length, 'validation error shows.');
      });
    });
  });
});

test('change externalId', function(assert) {
  server.create('user', {
    id: 4136
  });
  server.create('course', {
    year: 2013,
    school: 1,
    externalId: 'abc123'
  });
  visit(url);
  andThen(function() {
    assert.equal(getElementText(find('.course-overview .courseexternalid')), getText('CourseID: abc123'));
  });
  visit(url + '?details=true');
  andThen(function() {
    var container = find('.course-overview');
    assert.equal(getElementText(find('.courseexternalid', container)), getText('CourseID: abc123'));
    click(find('.courseexternalid .editable', container));
    andThen(function(){
      var input = find('.courseexternalid .editinplace input', container);
      assert.equal(getText(input.val()), getText('abc123'));
      fillIn(input, 'testnewid');
      click(find('.courseexternalid .editinplace .actions .done', container));
      andThen(function(){
        assert.equal(getElementText(find('.courseexternalid', container)), getText('CourseID: testnewid'));
      });
    });
  });
});

test('change level', function(assert) {
  server.create('user', {
    id: 4136
  });
  server.create('course', {
    year: 2013,
    school: 1,
    level: 3
  });
  visit(url);
  andThen(function() {
    assert.equal(getElementText(find('.course-overview .courselevel')), getText('Level: 3'));
  });
  visit(url + '?details=true');
  andThen(function() {
    var container = find('.course-overview');
    assert.equal(getElementText(find('.courselevel .editable', container)), 3);
    click(find('.courselevel .editable', container));
    andThen(function(){
      let options = find('.courselevel select option', container);
      for(let i = 0; i < 5; i++){
        assert.equal(getElementText(options.eq(i)), i+1);
      }
      pickOption(find('.courselevel select', container), '1', assert);
      click(find('.courselevel .actions .done', container));
      andThen(function(){
        assert.equal(getElementText(find('.course-overview .courselevel')), getText('Level: 1'));
      });
    });
  });
});

test('remove director', function(assert) {
  server.create('user', {
    id: 4136
  });
  server.create('user', {
    id: 2,
    directedCourses: [1],
    firstName: 'A',
    lastName: 'Director'
  });
  server.create('course', {
    year: 2013,
    school: 1,
    externalId: 123,
    level: 3,
    directors: [2]
  });
  visit(url);
  click('.coursedirectors .clickable');
  click('.coursedirectors li:eq(0)');
  return click('.coursedirectors .bigadd').then(()=> {
    assert.equal(getElementText(find('.coursedirectors')), getText('Directors: None'));
  });
});


test('manage directors', function(assert) {
  server.create('user', {
    id: 4136,
    roles: [1],
  });
  server.create('userRole', {
    users: [1, 2, 4136]
  });
  server.create('user', {
    id: 1,
    directedCourses: [1],
    firstName: 'Added',
    lastName: 'Guy',
    roles: [1]
  });
  server.create('user', {
    id: 2,
    firstName: 'Disabled',
    lastName: 'Guy',
    enabled: false,
    roles: [1]
  });

  server.create('userRole', {
    users: [3]
  });
  server.create('user', {
    firstName: 'Not a director',
    lastName: 'Guy',
    roles: [3]
  });

  server.create('course', {
    year: 2013,
    school: 1,
    externalId: 123,
    level: 3,
    directors: [2]
  });
  visit(url);
  click('.coursedirectors .clickable');

  andThen(function() {
    let directors = find('.coursedirectors');
    let searchBox = find('.search-box', directors);
    assert.equal(searchBox.length, 1);
    searchBox = searchBox.eq(0);
    let searchBoxInput = find('input', searchBox);
    fillIn(searchBoxInput, 'guy');
    click('span.search-icon', searchBox);
    andThen(function(){
      let searchResults = find('.live-search li', directors);
      assert.equal(searchResults.length, 4);
      assert.equal(getElementText($(searchResults[0])), getText('3 Results'), '3 results');
      assert.equal(getElementText($(searchResults[1])), getText('0 guy M. Mc0son'), '0 guy M. Mc0son');
      assert.ok(!$(searchResults[1]).hasClass('inactive'), 'result 1 inactive');
      assert.equal(getElementText($(searchResults[2])), getText('Added M. Guy'), 'Added M. Guy');
      assert.ok($(searchResults[2]).hasClass('inactive'));
      assert.equal(getElementText($(searchResults[3])), getText('Disabled M. Guy'), 'Disabled M. Guy');
      assert.ok($(searchResults[3]).hasClass('inactive'), 'result 3 inctive');

      click('li:eq(0)', directors).then(function(){
        assert.ok(!$(find('.live-search li:eq(1)', directors)).hasClass('inactive'), 'result 1 inactive after click');
        click(searchResults[1]);
        click('.coursedirectors .bigadd');
      });
      andThen(function(){
        assert.equal(getElementText(find('.coursedirectors li:eq(1)')), getText('0 guy M. Mc0son'), '0 guy M. Mc0son');
      });
    });
  });
});

//test for a bug where the search results were not cleared between searches
test('search twice and list should be correct', function(assert) {
  server.create('user', {
    id: 4136,
    roles: [1],
  });
  server.create('userRole', {
    users: [1, 4136]
  });
  server.create('user', {
    id: 2,
    directedCourses: [1],
    firstName: 'Added',
    lastName: 'Guy',
    roles: [1]
  });
  server.create('course', {
    year: 2013,
    school: 1,
    externalId: 123,
    level: 3,
    directors: [2]
  });
  visit(url);
  click('.coursedirectors .clickable');
  andThen(function() {
    let directors = find('.coursedirectors');
    let searchBox = find('.search-box', directors);
    assert.equal(searchBox.length, 1);
    searchBox = searchBox.eq(0);
    let searchBoxInput = find('input', searchBox);
    fillIn(searchBoxInput, 'guy');
    click('span.search-icon', searchBox);
    andThen(function(){
      let searchResults = find('.live-search li', directors);
      assert.equal(searchResults.length, 3);
      assert.equal(getElementText($(searchResults[0])), getText('2 Results'));
      assert.equal(getElementText($(searchResults[1])), getText('0 guy M. Mc0son'));
      assert.equal(getElementText($(searchResults[2])), getText('Added M. Guy'));
      click(searchResults[1]).then(function(){
        searchBoxInput = find('input', searchBox);
        fillIn(searchBoxInput, 'guy');
        click('span.search-icon', searchBox);
        andThen(function(){
          searchResults = find('.live-search li', directors);
          assert.equal(searchResults.length, 3);
          assert.equal(getElementText($(searchResults[0])), getText('2 Results'));
          assert.equal(getElementText($(searchResults[1])), getText('0 guy M. Mc0son'));
          assert.equal(getElementText($(searchResults[2])), getText('Added M. Guy'));
        });
      });
    });
  });
});

test('click rollover', function(assert) {
  server.create('user', {
    id: 4136,
    roles: [1],
  });
  server.create('userRole', {
    users: [4136],
    title: 'course director'
  });
  server.create('course', {
    year: 2013,
    school: 1,
  });
  const rollover = '.course-overview a.rollover';
  visit(url);
  click(rollover);

  andThen(function() {
    assert.equal(currentPath(), 'course.rollover');
  });
});

test('rollover hidden from instructors', function(assert) {
  server.create('user', {
    id: 4136,
    roles: [1],
  });
  server.create('userRole', {
    users: [4136],
    title: 'instructor'
  });
  server.create('course', {
    year: 2013,
    school: 1,
  });
  visit(url);
  const container = '.course-overview';
  const rollover = `${container} a.rollover`;

  andThen(function() {
    assert.equal(currentPath(), 'course.index');
    assert.equal(find(rollover).length, 0);
  });
});

test('rollover visible to developers', function(assert) {
  server.create('user', {
    id: 4136,
    roles: [1],
  });
  server.create('userRole', {
    users: [4136],
    title: 'developer'
  });
  server.create('course', {
    year: 2013,
    school: 1,
  });
  visit(url);
  const container = '.course-overview';
  const rollover = `${container} a.rollover`;

  andThen(function() {
    assert.equal(currentPath(), 'course.index');
    assert.equal(find(rollover).length, 1);
  });
});

test('rollover visible to course directors', function(assert) {
  server.create('user', {
    id: 4136,
    roles: [1],
  });
  server.create('userRole', {
    users: [4136],
    title: 'course director'
  });
  server.create('course', {
    year: 2013,
    school: 1,
  });
  visit(url);
  const container = '.course-overview';
  const rollover = `${container} a.rollover`;

  andThen(function() {
    assert.equal(currentPath(), 'course.index');
    assert.equal(find(rollover).length, 1);
  });
});

test('rollover hidden on rollover route', function(assert) {
  server.create('user', {
    id: 4136,
    roles: [1],
  });
  server.create('userRole', {
    users: [4136],
    title: 'course director'
  });
  server.create('course', {
    year: 2013,
    school: 1,
  });
  visit(`${url}/rollover`);
  const container = '.course-overview';
  const rollover = `${container} a.rollover`;

  andThen(function() {
    assert.equal(currentPath(), 'course.rollover');
    assert.equal(find(rollover).length, 0);
  });
});
