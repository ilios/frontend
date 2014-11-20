import Ember from 'ember';
import startApp from '../../helpers/start-app';

var App;

module('Acceptance: ProgramsIndex', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test('visit /programs.index', function() {
  expect(1);
  visit('/programs');

  andThen(function() {
    equal(currentPath(), 'programs.index');
  });
});

test('breadcrumbs /programs.index', function() {
  visit('/programs');

  andThen(function() {
    var expectedCrumbs = ['Home', 'All Programs'];
    checkBreadcrumbs(expectedCrumbs);
  });
});

test('program list /programs.index', function() {
  expect(6);
  visit('/programs');

  andThen(function() {
    var firstProgramRow = find('.container table:first tbody tr:first');
    equal(find('td:first', firstProgramRow).text().trim(), 'First Test Program');
    equal(find('td:eq(1)', firstProgramRow).text().trim(), 'ftp');
    equal(find('td:eq(2)', firstProgramRow).text().trim(), '4 years');

    var secondProgramRow = find('.container table:first tbody tr:eq(1)');
    equal(find('td:first', secondProgramRow).text().trim(), 'Second Test Program');
    equal(find('td:eq(1)', secondProgramRow).text().trim(), 'stp');
    equal(find('td:eq(2)', secondProgramRow).text().trim(), '1 year');
  });
});

test('program link /programs.index', function() {
  expect(1);
  visit('/programs');
  click('a:contains("First Test Program")');

  andThen(function() {
    equal(currentPath(), 'programs.program.index');
  });
});

test('create program /programs.index', function() {
  expect(1);
  visit('/programs');
  click('button:contains("Create a New Program")');

  andThen(function() {
    equal(currentPath(), 'programs.new');
  });
});
