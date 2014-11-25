import Ember from 'ember';
import startApp from 'ilios/tests/helpers/start-app';

var App;

module('Acceptance: ProgramsProgramProgramyearManagedirectors', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test('visiting', function() {
  visit('/programs/school/0/program/0/years/0/managedirectors');

  andThen(function() {
    equal(currentPath(), 'programs.programsschool.program.programyear.managedirectors');
    equal(find('#program-year-title').text().trim(), 'First Test Program 2014 - 2015 Class of 2018');
  });
});

test('breadcrumbs', function() {
  visit('/programs/school/0/program/0/years/0/managedirectors');

  andThen(function() {
    var expectedCrumbs = [
      'Home',
      'All Programs',
      'First School',
      'First Test Program',
      '2014 - 2015',
      'Directors'
    ];
    checkBreadcrumbs(expectedCrumbs);
  });
});

test('badge value', function() {
  expect(2);
  visit('/programs/school/0/program/0/years/0/managedirectors');

  andThen(function() {
    equal(find('.accordion-tabs-minimal a.active .badge').text().trim(), '1');
    fillIn('.container .search-and-submit input', 'test.person@example.com');

    click('#available-directors .search-and-submit button').then(function(){
      click('#available-directors li .add:first').then(function(){
        equal(find('.accordion-tabs-minimal a.active .badge').text().trim(), '2');
      });
    });
  });
});

test('test add single', function() {
  expect(5);
  visit('/programs/school/0/program/0/years/0/managedirectors');
  fillIn('.container .search-and-submit input', 'test');
  click('#available-directors .search-and-submit button');

  andThen(function() {
    equal(find('#selected-directors li').length, 1);
    equal(find('#available-directors li.enabled').length, 2);
    equal(find('#available-directors li.disabled').length, 1);
    click('#available-directors li.enabled:eq(0) .add').then(function() {
      equal(find('#selected-directors li').length, 2);
      equal(find('#available-directors li.enabled').length, 1);
    });
  });
});

test('test remove single', function() {
  expect(1);
  visit('/programs/school/0/program/0/years/0/managedirectors');
  click('#selected-directors li:first .remove');
  andThen(function() {
      equal(find('#selected-directors li.visible').length, 0);
  });
});
