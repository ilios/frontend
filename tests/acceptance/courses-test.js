import destroyApp from '../helpers/destroy-app';
import { module, test } from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import {b as testgroup} from 'ilios/tests/helpers/test-groups';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import moment from 'moment';

import Ember from 'ember';

var application;

module('Acceptance: Courses' + testgroup, {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);
    server.createList('school', 2)
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('visiting /courses', function(assert) {
  visit('/courses');
  andThen(function() {
    assert.equal(currentPath(), 'courses');
  });
});

test('filters by title', function(assert) {
  server.create('academicYear', {id: 2014});
  assert.expect(22);
  var firstCourse = server.create('course', {
    title: 'specialfirstcourse',
    year: 2014,
    school: 1,
  });
  var secondCourse = server.create('course', {
    title: 'specialsecondcourse',
    year: 2014,
    school: 1
  });
  var regularCourse = server.create('course', {
    title: 'regularcourse',
    year: 2014,
    school: 1
  });
  var lastCourse = server.create('course', {
    title: 'aaLastcourse',
    year: 2014,
    school: 1
  });
  visit('/courses');
  andThen(function() {
    assert.equal(4, find('.resultslist-list tbody tr').length);
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText(lastCourse.title));
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(1) td:eq(0)')),getText(regularCourse.title));
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(2) td:eq(0)')),getText(firstCourse.title));
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(3) td:eq(0)')),getText(secondCourse.title));

    //put these in nested later blocks because there is a 500ms debounce on the title filter
    fillIn('#titlefilter input', 'first');
    Ember.run.later(function(){
      assert.equal(1, find('.resultslist-list tbody tr').length);
      assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText(firstCourse.title));
      fillIn('#titlefilter input', 'second');
      andThen(function(){
        Ember.run.later(function(){
          assert.equal(1, find('.resultslist-list tbody tr').length);
          assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText(secondCourse.title));
          fillIn('#titlefilter input', 'special');
          andThen(function(){
            Ember.run.later(function(){
              assert.equal(2, find('.resultslist-list tbody tr').length);
              assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText(firstCourse.title));
              assert.equal(getElementText(find('.resultslist-list tbody tr:eq(1) td:eq(0)')),getText(secondCourse.title));

              fillIn('#titlefilter input', 'course');
              andThen(function(){
                Ember.run.later(function(){
                  assert.equal(4, find('.resultslist-list tbody tr').length);
                  assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText(lastCourse.title));
                  assert.equal(getElementText(find('.resultslist-list tbody tr:eq(1) td:eq(0)')),getText(regularCourse.title));
                  assert.equal(getElementText(find('.resultslist-list tbody tr:eq(2) td:eq(0)')),getText(firstCourse.title));
                  assert.equal(getElementText(find('.resultslist-list tbody tr:eq(3) td:eq(0)')),getText(secondCourse.title));

                  fillIn('#titlefilter input', '');
                  andThen(function(){
                    Ember.run.later(function(){
                      assert.equal(4, find('.resultslist-list tbody tr').length);
                      assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText(lastCourse.title));
                      assert.equal(getElementText(find('.resultslist-list tbody tr:eq(1) td:eq(0)')),getText(regularCourse.title));
                      assert.equal(getElementText(find('.resultslist-list tbody tr:eq(2) td:eq(0)')),getText(firstCourse.title));
                      assert.equal(getElementText(find('.resultslist-list tbody tr:eq(3) td:eq(0)')),getText(secondCourse.title));
                    }, 750);
                  });
                }, 750);
              });
            }, 750);
          });
        }, 750);
      });
    }, 750);
  });
});

test('filters by year', function(assert) {
  server.create('academicYear', {id: 2013});
  server.create('academicYear', {id: 2014});
  assert.expect(4);
  var firstCourse = server.create('course', {
    year: 2013,
    school: 1,
  });
  var secondCourse = server.create('course', {
    year: 2014,
    school: 1
  });
  visit('/courses');
  andThen(function() {
    pickOption('#yearsfilter select', '2013 - 2014', assert);
    andThen(function(){
      assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText(firstCourse.title));
    });
  });
  andThen(function() {
    pickOption('#yearsfilter select', '2014 - 2015', assert);
    andThen(function(){
      assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText(secondCourse.title));
    });
  });
});

test('initial filter by year', function(assert) {
  server.create('academicYear', {id: 2013});
  server.create('academicYear', {id: 2014});
  assert.expect(4);
  var firstCourse = server.create('course', {
    year: 2013,
    school: 1,
  });
  var secondCourse = server.create('course', {
    year: 2014,
    school: 1
  });
  visit('/courses?year=2014');
  andThen(function() {
    assert.equal(find('.resultslist-list tbody tr').length, 1);
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText(secondCourse.title));
  });

  visit('/courses?year=2013');
  andThen(function() {
    assert.equal(find('.resultslist-list tbody tr').length, 1);
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText(firstCourse.title));
  });
});

test('action links are present', function(assert) {
  assert.expect(2);
  server.create('academicYear', {id: 2013});
  server.create('course', {
    year: 2013,
    school: 1,
    directors: [4136]
  });

  visit('/courses');
  andThen(function() {
    assert.equal(find('.resultslist-list tbody tr:eq(0) td:eq(7) .edit').length, 1, 'Edit link is present in course list.');
    assert.equal(find('.resultslist-list tbody tr:eq(0) td:eq(7) .remove').length, 1, 'Remove link is present in course list.');
  });
});

test('filters by mycourses', function(assert) {
  server.create('academicYear', {id: 2014});
  assert.expect(7);
  var firstCourse = server.create('course', {
    year: 2014,
    school: 1,
  });
  var secondCourse = server.create('course', {
    year: 2014,
    school: 1,
    directors: [4136]
  });
  visit('/courses');
  andThen(function() {
    assert.equal(find('.resultslist-list tbody tr').length, 2);
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText(firstCourse.title));
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(1) td:eq(0)')),getText(secondCourse.title));
    click('#mycoursesfilter label');

    andThen(function(){
      assert.equal(find('.resultslist-list tbody tr').length, 1);
      assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText(secondCourse.title));
      assert.equal(find('.resultslist-list tbody tr:eq(0) td:eq(7) .edit').length, 1, 'Edit link is present in mycourses list.');
      assert.equal(find('.resultslist-list tbody tr:eq(0) td:eq(7) .remove').length, 0, 'Remove link is not present in mycourses list.');
    });
  });
});

test('filters options', function(assert) {
  server.createList('school', 2);
  server.create('academicYear', {id: 2013});
  server.create('academicYear', {id: 2014});
  assert.expect(5);
  visit('/courses');
  andThen(function() {
    var filters = find('#courses .filter');
    assert.equal(filters.length, 4);
    assert.equal(find('#school-selection').eq(0).text().trim(), 'school 0');
    var yearOptions = find('#yearsfilter select option');
    assert.equal(yearOptions.length, 2);
    assert.equal(getElementText(yearOptions.eq(0)).substring(0,4), 2014);
    assert.equal(getElementText(yearOptions.eq(1)).substring(0,4), 2013);

  });
});

test('new course', function(assert) {
  server.create('academicYear', {id: 2014});
  assert.expect(5);

  const url = '/courses?year=2014';
  const expandButton = '.expand-button';
  const input = '.new-course input';
  const selectField = '.new-course select';
  const saveButton = '.done';
  const savedLink = '.saved-result a';

  visit(url);
  click(expandButton);
  fillIn(input, 'Course 1');
  pickOption(selectField, '2014 - 2015', assert);
  click(saveButton);
  andThen(() => {
    function getContent(i) {
      return find(`tbody tr td:eq(${i})`).text().trim();
    }

    assert.equal(find(savedLink).text().trim(), 'Course 1', 'link is visisble');
    assert.equal(getContent(0), 'Course 1', 'course is correct');
    assert.equal(getContent(1), 'school 0', 'school is correct');
    assert.equal(getContent(2), '2014 - 2015', 'year is correct');
  });
});

test('new course in another year does not display in list', function(assert) {
  server.create('academicYear', {id: 2012});
  server.create('academicYear', {id: 2013});
  assert.expect(1);
  visit('/courses');
  let newTitle = 'new course title, woohoo';
  andThen(function() {
    let container = find('.resultslist');
    click('.resultslist-actions button', container);
    andThen(function(){
      fillIn('.new-course input:eq(0)', newTitle);

      click('.new-course .done', container).then(function(){
        var rows = find('tbody tr', container);
        assert.equal(rows.length, 0);
      });
    });
  });
});

test('new course does not appear twice when navigating back', function(assert) {
  server.create('academicYear', {id: 2014});
  assert.expect(5);

  const url = '/courses?year=2014';
  const expandButton = '.expand-button';
  const input = '.new-course input';
  const selectField = '.new-course select';
  const saveButton = '.done';
  const savedLink = '.saved-result a';
  const courseTitle = "Course 1";
  const course1InList = `tbody tr:contains("${courseTitle}")`;

  visit(url);
  click(expandButton);
  fillIn(input, courseTitle);
  pickOption(selectField, '2014 - 2015', assert);
  click(saveButton);
  andThen(() => {
    assert.equal(find(savedLink).length, 1, 'one copy of the save link');
    assert.equal(find(course1InList).length, 1, 'one copy of the course in the list');
  });
  click(savedLink);
  visit(url);
  andThen(() => {
    assert.equal(find(savedLink).length, 1, 'one copy of the save link');
    assert.equal(find(course1InList).length, 1, 'one copy of the course in the list');
  });
});

test('locked courses', function(assert) {
  server.create('academicYear', {id: 2014});
  assert.expect(6);
  server.create('course', {
    year: 2014,
    school: 1
  });
  server.create('course', {
    year: 2014,
    school: 1,
    locked: true
  });

  const url = '/courses?year=2014';

  visit(url);
  andThen(() => {
    function getContent(row, column) {
      return find(`tbody tr:eq(${row}) td:eq(${column})`).text().trim();
    }

    assert.equal(getContent(0, 0), 'course 0', 'course name is correct');
    assert.equal(getContent(0, 6), 'Not Published', 'status');
    assert.ok(find(`tbody tr:eq(0) td:eq(6) i.fa-lock`).length === 0);

    assert.equal(getContent(1, 0), 'course 1', 'course name is correct');
    assert.equal(getContent(1, 6), 'Not Published', 'status');
    assert.ok(find(`tbody tr:eq(1) td:eq(6) i.fa-lock`).length === 1);

  });
});

test('no academic years exist', function(assert) {
  assert.expect(6);
  const expandButton = '.expand-button';
  const newAcademicYearsOptions = '.new-course option';
  const url = '/courses';

  visit(url);
  click(expandButton);
  andThen(() => {
    let thisYear = parseInt(moment().format('YYYY'));
    let years = [
      thisYear-2,
      thisYear-1,
      thisYear,
      thisYear+1,
      thisYear+2
    ];

    var yearOptions = find(newAcademicYearsOptions);
    assert.equal(yearOptions.length, years.length);
    for (let i = 0; i < years.length; i++){
      assert.equal(getElementText(yearOptions.eq(i)).substring(0,4), years[i]);
    }
  });
});
