import Ember from 'ember';
import startApp from 'ilios/tests/helpers/start-app';

var App;

module('Acceptance: ProgramsProgramProgramyearManagetopics', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test('visiting', function() {
  visit('/programs/school/0/program/0/years/0/managetopics');

  andThen(function() {
    equal(currentPath(), 'programs.programsschool.program.programyear.managetopics');
    equal(find('#program-year-title').text().trim(), 'First Test Program 2014 - 2015 Class of 2018');
  });
});

test('breadcrumbs', function() {
  visit('/programs/school/0/program/0/years/0/managetopics');

  andThen(function() {
    var expectedCrumbs = [
      'Home',
      'All Programs',
      'First School',
      'First Test Program',
      '2014 - 2015',
      'Topics'
    ];
    checkBreadcrumbs(expectedCrumbs);
  });
});

test('badge value', function() {
  expect(3);
  visit('/programs/school/0/program/0/years/0/managetopics');

  andThen(function() {
    equal(find('.accordion-tabs-minimal a.active .badge').text().trim(), '2');
    click('#selected-topics li:eq(0) .remove').then(function(){
      equal(find('.accordion-tabs-minimal a.active .badge').text().trim(), '1');
    });
    click('#available-topics li:visible:eq(0) .add').then(function(){
      equal(find('.accordion-tabs-minimal a.active .badge').text().trim(), '2');
    });
  });
});

test('test add single', function() {
  expect(5);
  visit('/programs/school/0/program/0/years/0/managetopics');

  andThen(function() {
    equal(find('#selected-topics li.visible').length, 2);
    click('#available-topics li.enabled:eq(0) .add').then(function() {
      equal(find('#selected-topics li.visible').length, 3);
      equal(find('#available-topics li.enabled').length, 1);
    });
    click('#available-topics li.enabled:eq(0) .add').then(function() {
      equal(find('#selected-topics li.visible').length, 4);
      equal(find('#available-topics li.enabled').length, 0);
    });
  });
});

test('test remove single', function() {
  expect(1);
  visit('/programs/school/0/program/0/years/0/managetopics');
  click('#selected-topics li.visible:first .remove');
  andThen(function() {
      equal(find('#selected-topics li.visible').length, 1);
  });
});
