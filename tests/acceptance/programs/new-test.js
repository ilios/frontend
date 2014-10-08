import Ember from 'ember';
import startApp from '../../helpers/start-app';

var App;

module('Acceptance: ProgramsNew', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test('visiting /programs.new', function() {
  visit('/programs/new');

  andThen(function() {
    equal(currentPath(), 'programs.new');
  });
});

test('breadcrumbs /programs.new', function() {
  visit('/programs/new');

  andThen(function() {
    var expectedCrumbs = ['Home', 'All Programs'];
    checkBreadcrumbs(expectedCrumbs);
  });
});

test('add new program /programs.new', function() {
  visit('/programs/new');
  fillIn('input:eq(0)', 'Created Program');
  fillIn('input:eq(1)', 'crprg');
  click('button:contains("Save")');

  andThen(function() {
    equal(currentPath(), 'programs.index');
    var firstProgramRow = find('.container table:first tbody tr:first');
    equal(find('td:first', firstProgramRow).text().trim(), 'Created Program');
    equal(find('td:eq(1)', firstProgramRow).text().trim(), 'crprg');
    equal(find('td:eq(2)', firstProgramRow).text().trim(), '1 year');
  });
});
