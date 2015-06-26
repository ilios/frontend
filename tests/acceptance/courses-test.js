import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';

var application;
var fixtures = {};

module('Acceptance: Courses', {
  beforeEach: function() {
    application = startApp();
    authenticateSession();
    server.create('user', {id: 4136});
    fixtures.schools = [];
    fixtures.schools.pushObjects(server.createList('school', 2));

    fixtures.educationalYears = [];
    fixtures.educationalYears.pushObject(server.create('educationalYear', {id: 2013}));
    fixtures.educationalYears.pushObject(server.create('educationalYear', {id: 2014}));
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('visiting /courses', function(assert) {
  visit('/courses');
  andThen(function() {
    assert.equal(currentPath(), 'courses');
  });
});

test('filters by title', function(assert) {
  assert.expect(15);
  var firstCourse = server.create('course', {
    title: 'specialfirstcourse',
    year: 2014,
    owningSchool: 1,
  });
  var secondCourse = server.create('course', {
    title: 'specialsecondcourse',
    year: 2014,
    owningSchool: 1
  });
  var regularCourse = server.create('course', {
    title: 'regularcourse',
    year: 2014,
    owningSchool: 1
  });
  visit('/courses');
  andThen(function() {
    assert.equal(3, find('.resultslist-list tbody tr').length);
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText(regularCourse.title));
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(1) td:eq(0)')),getText(firstCourse.title));
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(2) td:eq(0)')),getText(secondCourse.title));

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

              fillIn('#titlefilter input', '');
              andThen(function(){
                Ember.run.later(function(){
                  assert.equal(3, find('.resultslist-list tbody tr').length);
                  assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText(regularCourse.title));
                  assert.equal(getElementText(find('.resultslist-list tbody tr:eq(1) td:eq(0)')),getText(firstCourse.title));
                  assert.equal(getElementText(find('.resultslist-list tbody tr:eq(2) td:eq(0)')),getText(secondCourse.title));
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
  assert.expect(2);
  var firstCourse = server.create('course', {
    year: 2013,
    owningSchool: 1,
  });
  var secondCourse = server.create('course', {
    year: 2014,
    owningSchool: 1
  });
  visit('/courses');
  andThen(function() {
    click('#yearsfilter button').then(function(){
      var yearOptions = find('#yearsfilter ul.dropdown-menu li');
      click(yearOptions.eq(0));
    });
    andThen(function(){
      assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText(firstCourse.title));
    });
  });
  andThen(function() {
    click('#yearsfilter button').then(function(){
      var yearOptions = find('#yearsfilter ul.dropdown-menu li');
      click(yearOptions.eq(1));
    });
    andThen(function(){
      assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText(secondCourse.title));
    });
  });
});

test('filters by mycourses', function(assert) {
  assert.expect(5);
  var firstCourse = server.create('course', {
    year: 2014,
    owningSchool: 1
  });
  var secondCourse = server.create('course', {
    year: 2014,
    owningSchool: 1,
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
    });
  });
});

test('filters options', function(assert) {
  assert.expect(5);
  visit('/courses');
  andThen(function() {
    var filters = find('#courses .filter');
    assert.equal(filters.length, 4);
    assert.equal(find('#school-selection').eq(0).text().trim(), fixtures.schools[0].title);
    click('#yearsfilter button');
    andThen(function(){
      var yearOptions = find('#yearsfilter ul.dropdown-menu li');
      assert.equal(yearOptions.length, fixtures.educationalYears.length);
      for(let i = 0; i < fixtures.educationalYears.length; i++){
        assert.equal(getElementText(yearOptions.eq(i)).substring(0,4), fixtures.educationalYears[i].title);
      }
    });
  });
});

test('new course', function(assert) {
  assert.expect(3);
  visit('/courses');
  let newTitle = 'new course title, woohoo';
  andThen(function() {
    let container = find('.resultslist');
    click('.resultslist-actions button', container);
    andThen(function(){
      fillIn('.new-course input:eq(0)', newTitle);
      click('.new-course .done', container);
      andThen(function(){
        assert.equal(getElementText(find('.savedcourse', container)), getText(newTitle + 'Saved Successfully'));

        var rows = find('tbody tr', container);
        assert.equal(rows.length, 1);
        assert.equal(getElementText(find('td:eq(0)', rows.eq(0))), getText(newTitle));
      });
    });
  });
});

test('new course in another year does not display in list', function(assert) {
  assert.expect(1);
  visit('/courses');
  let newTitle = 'new course title, woohoo';
  andThen(function() {
    let container = find('.resultslist');
    click('.resultslist-actions button', container);
    andThen(function(){
      fillIn('.new-course input:eq(0)', newTitle);
      click('.new-course-year button').then(function(){
        click(find('.new-course-year ul.dropdown-menu li:eq(0)'));
      });
      click('.new-course .done', container).then(function(){
        var rows = find('tbody tr', container);
        assert.equal(rows.length, 0);
      });
    });
  });
});
