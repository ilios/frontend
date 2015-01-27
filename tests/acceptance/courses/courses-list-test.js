import Ember from 'ember';
import startApp from '../../helpers/start-app';

var App;

module('Acceptance: CoursesList', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

var getCourse = function(rowNumber){
  return find('#courses table tbody tr:eq(' + rowNumber + ')');
};

var isCourseAtPosition = function(courseTitle, position){
  var title = find('td:first a', getCourse(position-1)).text().trim();
  return title.indexOf(courseTitle) !== -1;
};

var isCountCourses = function(num){
  return num === find('#courses table tbody tr').length;
};

test('visiting /courses-list', function() {
  visit('/courses');
  andThen(function() {
    equal(currentPath(), 'courses');
  });
});

test('filters options', function() {
  expect(9);
  visit('/courses');
  andThen(function() {
    var filters = find('#courses .filter');
    equal(filters.length, 4);

    var schoolOptions = find('#schoolsfilter label');
    equal(schoolOptions.length, 3);
    equal(schoolOptions.eq(0).text().trim(), 'First School');
    equal(schoolOptions.eq(1).text().trim(), 'Third Test School');
    equal(schoolOptions.eq(2).text().trim(), 'Second School');

    var yearOptions = find('#yearsfilter option');
    equal(yearOptions.length, 3);
    equal(yearOptions.eq(0).text().trim(), '2013 - 2014');
    equal(yearOptions.eq(1).text().trim(), '2014 - 2015');
    equal(yearOptions.eq(2).text().trim(), '2010 - 2011');
  });

});

test('filter by mycourses', function() {
  expect(1);
  visit('/courses?schools=%5B"0"%5D&year=0');

  andThen(function() {
    var filter = find('#mycoursesfilter input[type="checkbox"]');
    filter.prop('checked', true);
    filter.trigger('change');
    andThen(function() {
      ok(isCountCourses(0));
    });
  });
});

test('initial courses', function() {
  expect(3);
  visit('/courses');

  andThen(function() {
    ok(isCountCourses(2));
    ok(isCourseAtPosition('First Test Course', 1));
    ok(isCourseAtPosition('Second Test Course', 2));
  });
});

test('filter by school', function() {
  expect(2);
  visit('/courses');

  andThen(function() {
    click('#schoolsfilter label:contains("Second School") > input');
    click('#schoolsfilter label:contains("First School") > input');
    andThen(function() {
      ok(isCountCourses(1));
      ok(isCourseAtPosition('Third Test Course', 1));
    });
  });
});

test('filter by year', function() {
  expect(3);
  visit('/courses?schools=%5B"1"%5D');

  andThen(function() {
    var filter = find('#yearsfilter select');
    filter.val(1);
    filter.trigger('change');
    andThen(function() {
      ok(isCountCourses(2));
      ok(isCourseAtPosition('Fifth Test Course', 1));
      ok(isCourseAtPosition('Fourth Test Course', 2));
    });
  });
});

test('filter by title', function() {
  expect(2);
  visit('/courses?schools=%5B"0"%5D&year=0');

  andThen(function() {
    fillIn('#titlefilter input', 'Second');
    andThen(function() {
      ok(isCountCourses(1));
      ok(isCourseAtPosition('Second Test Course', 1));
    });
  });
});

test('visit specific school', function() {
  expect(2);
  visit('/courses?schools=%5B"1"%5D');

  andThen(function() {
    ok(isCountCourses(1));
    ok(isCourseAtPosition('Third Test Course', 1));
  });
});
