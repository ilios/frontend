import Ember from 'ember';
import startApp from 'ilios/tests/helpers/start-app';

var App;

module('Acceptance: ProgramsschoolNew', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test('visiting', function() {
  visit('/programs/school/0/new');

  andThen(function() {
    equal(currentPath(), 'programs.programsschool.new');
  });
});

test('breadcrumbs', function() {
  visit('/programs/school/0/new');

  andThen(function() {
    var expectedCrumbs = ['Home', 'All Programs', 'First School'];
    checkBreadcrumbs(expectedCrumbs);
  });
});

test('add new program', function() {
  visit('/programs/school/1/new');
  fillIn('input:eq(0)', 'Created Program');
  fillIn('input:eq(1)', 'crprg');
  click('button:contains("Save")');

  andThen(function() {
    equal(currentPath(), 'programs.programsschool.index');
    var firstProgramRow = find('.container table:first tbody tr:first');
    equal(find('td:first', firstProgramRow).text().trim(), 'Created Program');
    equal(find('td:eq(1)', firstProgramRow).text().trim(), 'crprg');
    equal(find('td:eq(2)', firstProgramRow).text().trim(), '1 year');
  });
});
