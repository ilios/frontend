import Ember from 'ember';
import startApp from 'ilios/tests/helpers/start-app';

var App;

module('Acceptance: ProgramsProgramProgramyearManagecompetencies', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test('visiting', function() {
  visit('/programs/school/0/program/0/years/0/managecompetencies');

  andThen(function() {
    equal(currentPath(), 'programs.programsschool.program.programyear.managecompetencies');
    equal(find('#program-year-title').text().trim(), 'First Test Program 2014 - 2015 Class of 2018');
    equal(find('#selected-competencies li:visible').length, 3);
    equal(find('#available-competencies li').length, 7);
  });
});

test('breadcrumbs', function() {
  visit('/programs/school/0/program/0/years/0/managecompetencies');

  andThen(function() {
    var expectedCrumbs = [
      'Home',
      'All Programs',
      'First School',
      'First Test Program',
      '2014 - 2015',
      'Competencies'
    ];
    checkBreadcrumbs(expectedCrumbs);
  });
});

test('badge value', function() {
  expect(3);
  visit('/programs/school/0/program/0/years/0/managecompetencies');

  andThen(function() {
    equal(find('.accordion-tabs-minimal a.active .badge').text().trim(), '2');
    click('#selected-competencies li:visible:eq(0) .remove').then(function(){
      equal(find('.accordion-tabs-minimal a.active .badge').text().trim(), '1');
    });
    click('#available-competencies li:visible:eq(0) .add').then(function(){
      equal(find('.accordion-tabs-minimal a.active .badge').text().trim(), '5');
    });
  });
});

test('test add single', function() {
  expect(5);
  visit('/programs/school/0/program/0/years/0/managecompetencies');

  andThen(function() {
    equal(find('#selected-competencies li.visible').length, 3);
    click('#available-competencies li.enabled:eq(2) .add').then(function() {
      equal(find('#selected-competencies li.visible').length, 4);
      equal(find('#available-competencies li.enabled').length, 4);
    });
    click('#available-competencies li.enabled:eq(3) .add').then(function() {
      equal(find('#selected-competencies li.visible').length, 5);
      equal(find('#available-competencies li.enabled').length, 3);
    });
  });
});

test('test add group', function() {
  expect(4);
  visit('/programs/school/0/program/0/years/0/managecompetencies');
  click('#selected-competencies .remove');

  andThen(function() {
    equal(find('#selected-competencies li.visible').length, 0);
    equal(find('#available-competencies li.enabled').length, 7);
    click('#available-competencies li.enabled:eq(0) .add').then(function() {
      equal(find('#selected-competencies li.visible').length, 4);
      equal(find('#available-competencies li.enabled').length, 3);
    });
  });
});

test('test remove group', function() {
  expect(2);
  visit('/programs/school/0/program/0/years/0/managecompetencies');
  click('#selected-competencies .remove').then(function(){
    click('#available-competencies li.enabled:eq(0) .add').then(function(){
      click('#selected-competencies .remove:first');
    });
  });

  andThen(function() {
      equal(find('#selected-competencies li.visible').length, 0);
      equal(find('#available-competencies li.enabled').length, 7);
  });
});

test('test group item', function() {
  expect(2);
  visit('/programs/school/0/program/0/years/0/managecompetencies');
  click('#selected-competencies .remove').then(function(){
    click('#available-competencies li.enabled:eq(0) .add').then(function(){
      click('#selected-competencies .remove:eq(1)');
    });
  });

  andThen(function() {
      equal(find('#selected-competencies li.visible').length, 3);
      equal(find('#available-competencies li.enabled').length, 4);
  });
});
