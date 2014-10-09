import Ember from 'ember';
import startApp from '../../../../helpers/start-app';

var App;

module('Acceptance: ProgramsProgramProgramyearManagestewardingschools', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test('visiting', function() {
  visit('/programs/0/years/0/managestewardingschools');

  andThen(function() {
    equal(currentPath(), 'programs.program.programyear.managestewardingschools');
    equal(find('#program-year-title').text().trim(), 'First Test Program 2014 - 2015 Class of 2018');
  });
});

test('breadcrumbs', function() {
  visit('/programs/0/years/0/managestewardingschools');

  andThen(function() {
    var expectedCrumbs = [
      'Home',
      'All Programs',
      'First Test Program',
      '2014 - 2015',
      'Stewarding Schools'
    ];
    checkBreadcrumbs(expectedCrumbs);
  });
});

test('badge value', function() {
  expect(3);
  visit('/programs/0/years/0/managestewardingschools');

  andThen(function() {
    equal(find('.accordion-tabs-minimal a.active .badge').text().trim(), '1');
    click('#selected-schools li.visible:eq(0) .remove').then(function(){
      equal(find('.accordion-tabs-minimal a.active .badge').text().trim(), '0');
    });
    click('#available-schools li.enabled:eq(0) .add').then(function(){
      equal(find('.accordion-tabs-minimal a.active .badge').text().trim(), '1');
    });
  });
});

test('test add single', function() {
  expect(3);
  visit('/programs/0/years/0/managestewardingschools');

  andThen(function() {
    equal(find('#selected-schools li.visible').length, 1);
    click('#available-schools li.enabled:eq(0) .add').then(function() {
      equal(find('#selected-schools li.visible').length, 2);
      equal(find('#available-schools li.enabled').length, 0);
    });
  });
});

test('test remove single', function() {
  expect(1);
  visit('/programs/0/years/0/managestewardingschools');
  click('#selected-schools li.visible:first .remove');
  andThen(function() {
      equal(find('#selected-schools li.visible').length, 0);
  });
});
