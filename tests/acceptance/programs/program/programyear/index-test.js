import Ember from 'ember';
import startApp from '../../../../helpers/start-app';

var App;

module('Acceptance: ProgramsProgramProgramyearIndex', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test('visiting programyear index', function() {
  visit('/programs/0/years/0/index');

  andThen(function() {
    equal(currentPath(), 'programs.program.programyear.managecompetencies');
  });
});
