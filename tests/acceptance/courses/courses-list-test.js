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
  console.log(courseTitle, find('td:first a', getCourse(position-1)).text().trim());
  return title.indexOf(courseTitle) !== -1;
};

var isCountCourses = function(num){
  console.log(find('#courses table tbody tr').length);
  return num === find('#courses table tbody tr').length;
};

test('visiting /courses-list', function() {
  visit('/courses');
  andThen(function() {
    equal(currentPath(), 'courses');
  });
});

test('filters options', function() {
  expect(7);
  visit('/courses');
  andThen(function() {
    var filters = find('#courses .filter');
    equal(filters.length, 4);

    var schoolOptions = find('#courses .filter-tools select:eq(0) > option');
    equal(schoolOptions.length, 2);
    equal(schoolOptions.eq(0).text().trim(), 'First School');
    equal(schoolOptions.eq(1).text().trim(), 'Second School');

    var yearOptions = find('#courses .filter-tools select:eq(1) > option');
    equal(yearOptions.length, 2);
    equal(yearOptions.eq(0).text().trim(), '2013');
    equal(yearOptions.eq(1).text().trim(), '2014');
  });

});

test('filter by mycourses', function() {
  expect(1);
  visit('/courses?school=0&year=0');

  andThen(function() {
    var filter = find('#courses .filter-tools input[type="checkbox"]');
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
    var filter = find('#courses .filter-tools select:eq(0)');
    filter.val(1);
    filter.trigger('change');
    andThen(function() {
      ok(isCountCourses(1));
      ok(isCourseAtPosition('Third Test Course', 1));
    });
  });
});

test('filter by year', function() {
  expect(3);
  visit('/courses?school=1');

  andThen(function() {
    var filter = find('#courses .filter-tools select:eq(1)');
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
  visit('/courses?school=0&year=0');

  andThen(function() {
    fillIn('#courses .filter-tools input[type="text"]', 'Second');
    andThen(function() {
      ok(isCountCourses(1));
      ok(isCourseAtPosition('Second Test Course', 1));
    });
  });
});
