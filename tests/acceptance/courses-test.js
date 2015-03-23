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
    click('#yearsfilter button');
    var yearOptions = find('#yearsfilter ul.dropdown-menu li');
    click(yearOptions.eq(0));
    andThen(function(){
      assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText(firstCourse.title));
    });
  });
  andThen(function() {
    click('#yearsfilter button');
    var yearOptions = find('#yearsfilter ul.dropdown-menu li');
    click(yearOptions.eq(1));
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
    var yearOptions = find('#yearsfilter ul.dropdown-menu li');
    assert.equal(yearOptions.length, fixtures.educationalYears.length);
    for(let i = 0; i < fixtures.educationalYears.length; i++){
      assert.equal(getElementText(yearOptions.eq(i)).substring(0,4), fixtures.educationalYears[i].title);
    }
  });
});
