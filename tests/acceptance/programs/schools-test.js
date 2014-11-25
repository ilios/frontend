import Ember from 'ember';
import startApp from '../../helpers/start-app';

var App;

module('Acceptance: ProgramsSchools', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test('visiting', function() {
  expect(1);
  visit('/programs/index');

  andThen(function() {
    equal(currentPath(), 'programs.index');
  });
});

test('breadcrumbs', function() {
  visit('/programs/index');

  andThen(function() {
    var expectedCrumbs = ['Home', 'All Programs', 'Select School'];
    checkBreadcrumbs(expectedCrumbs);
  });
});

test('list schools', function() {
  expect(2);
  visit('/programs/index');

  andThen(function() {
    equal(find('#select-school ul:first li:eq(0)').text().trim(), 'First School');
    equal(find('#select-school ul:first li:eq(1)').text().trim(), 'Second School');
  });
});

test('school link', function() {
  expect(1);
  visit('/programs/index');
  andThen(function() {
    click('#select-school ul:first li:eq(0) a');
  });
  andThen(function() {
    equal(currentPath(), 'programs.programsschool.index');
  });
});
