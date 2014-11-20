import Ember from 'ember';
import startApp from 'ilios/tests/helpers/start-app';

var App;

module('Acceptance: ProgramsProgramschoolProgramProgramyearIndex', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test('visiting programyear index', function() {
  visit('/programs/school/0/program/0/years/0/index');

  andThen(function() {
    equal(currentPath(), 'programs.programsschool.program.programyear.managecompetencies');
  });
});
