import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';

var application;

var schools;
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

    fixtures.correctCourses = [];
    fixtures.correctCourses.pushObjects(server.createList('course', 5, {
      year: 2014,
      owningSchool: 1,
    }));

    server.createList('course', 5, {
      year: 2013,
      owningSchool: 1,
    });
    server.createList('course', 5, {
      year: 2014,
      owningSchool: 2,
    });
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

test('courses in list', function(assert) {
  assert.expect(fixtures.correctCourses.length + 1);
  visit('/courses');
  andThen(function() {
    let courseRows = find('.resultslist-list tbody tr');
    assert.equal(courseRows.length, fixtures.correctCourses.length);
    for (let i = 0; i < fixtures.correctCourses.length; i++){
      assert.equal(getElementText(find('td:eq(0)', courseRows.eq(i))),getText(fixtures.correctCourses[i].title));
    }
  });
});
