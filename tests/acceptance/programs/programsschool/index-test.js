import Ember from 'ember';
import startApp from 'ilios/tests/helpers/start-app';

var App;

module('Acceptance: ProgramsSchoolIndex', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test('visit', function() {
  expect(1);
  visit('/programs/school/0/index');

  andThen(function() {
    equal(currentPath(), 'programs.programsschool.index');
  });
});

test('breadcrumbs', function() {
  visit('/programs/school/0/index');

  andThen(function() {
    var expectedCrumbs = ['Home', 'All Programs', 'First School'];
    checkBreadcrumbs(expectedCrumbs);
  });
});

test('program list', function() {
  expect(6);
  visit('/programs/school/0/index');

  andThen(function() {
    var firstProgramRow = find('#programs-school table:first tbody tr:first');
    equal(find('td:first', firstProgramRow).text().trim(), 'First Test Program');
    equal(find('td:eq(1)', firstProgramRow).text().trim(), 'ftp');
    equal(find('td:eq(2)', firstProgramRow).text().trim(), '4 years');

    var secondProgramRow = find('#programs-school table:first tbody tr:eq(1)');
    equal(find('td:first', secondProgramRow).text().trim(), 'Second Test Program');
    equal(find('td:eq(1)', secondProgramRow).text().trim(), 'stp');
    equal(find('td:eq(2)', secondProgramRow).text().trim(), '1 year');
  });
});

test('program link', function() {
  expect(1);
  visit('/programs/school/0/index');
  click('a:contains("First Test Program")');

  andThen(function() {
    equal(currentPath(), 'programs.programsschool.program.index');
  });
});

test('create program link', function() {
  expect(1);
  visit('/programs/school/0/index');
  click('button:contains("Create a New Program")');

  andThen(function() {
    equal(currentPath(), 'programs.programsschool.new');
  });
});
