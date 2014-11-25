import Ember from 'ember';
import startApp from '../../helpers/start-app';

var App;

module('Acceptance: InstructorGroupsSchools', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test('visiting', function() {
  expect(1);
  visit('/instructorgroups/index');

  andThen(function() {
    equal(currentPath(), 'instructorgroups.index');
  });
});

test('breadcrumbs', function() {
  visit('/instructorgroups/index');

  andThen(function() {
    var expectedCrumbs = ['Home', 'Instructor Groups', 'Select School'];
    checkBreadcrumbs(expectedCrumbs);
  });
});

test('list schools', function() {
  expect(2);
  visit('/instructorgroups/index');

  andThen(function() {
    equal(find('#select-school ul:first li:eq(0)').text().trim(), 'First School');
    equal(find('#select-school ul:first li:eq(1)').text().trim(), 'Second School');
  });
});

test('school link', function() {
  expect(1);
  visit('/instructorgroups/index');
  andThen(function() {
    click('#select-school ul:first li:eq(0) a');
  });
  andThen(function() {
    equal(currentPath(), 'instructorgroups.instructorgroupsschool.index');
  });
});
