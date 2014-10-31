import Ember from 'ember';
import startApp from '../../helpers/start-app';

var App;

module('Acceptance: LearnerGroupsIndex', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test('visiting', function() {
  expect(1);
  visit('/learnergroups/index');

  andThen(function() {
    equal(currentPath(), 'learnergroups.index');
  });
});

test('breadcrumbs', function() {
  visit('/learnergroups/index');

  andThen(function() {
    var expectedCrumbs = ['Home', 'Learner Groups', 'All Groups'];
    checkBreadcrumbs(expectedCrumbs);
  });
});

test('change cohort', function() {
  expect(8);
  visit('/learnergroups/index');

  andThen(function() {
    var selector = '#cohort-picker select';
    pickOption(selector, 'Class of 2017').then(function(){
      var expectedCrumbs = ['Home', 'Class of 2017 Learner Groups', 'All Groups'];
      checkBreadcrumbs(expectedCrumbs);
      equal(find('#learner-groups table:first tbody tr').length, 2);
    });
  });

  andThen(function() {
    var selector = '#cohort-picker select';
    pickOption(selector, 'Class of 2018').then(function(){
      var expectedCrumbs = ['Home', 'Class of 2018 Learner Groups', 'All Groups'];
      checkBreadcrumbs(expectedCrumbs);
      equal(find('#learner-groups table:first tbody tr').length, 0);
    });
  });
});

test('list groups', function() {
  expect(7);
  visit('/learnergroups/index');

  andThen(function() {
    var selector = '#cohort-picker select';
    pickOption(selector, 'Class of 2017').then(function(){
      var row = find('#learner-groups table:first tbody tr:eq(0)');
      equal(find('td:eq(0)', row).text().trim(), 'First Test Group');
      equal(find('td:eq(1)', row).text().trim(), '2');
      equal(find('td:eq(2)', row).text().trim(), '0');

      row = find('#learner-groups table:first tbody tr:eq(1)');
      equal(find('td:eq(0)', row).text().trim(), 'Second Test Group');
      equal(find('td:eq(1)', row).text().trim(), '1');
      equal(find('td:eq(2)', row).text().trim(), '0');
    });


  });
});

test('group link', function() {
  expect(2);
  visit('/learnergroups/index');
  andThen(function() {
    var selector = '#cohort-picker select';
    pickOption(selector, 'Class of 2017').then(function(){
      click('a:contains("First Test Group")');
    });
  });
  andThen(function() {
    equal(currentPath(), 'learnergroups.group');
  });
});

test('cant create group with no cohort', function() {
  expect(1);
  visit('/learnergroups/index');

  andThen(function() {
    equal(find('button:contains("New Learner Group")').length, 0);
  });
});

test('creategroup', function() {
  expect(6);
  visit('/learnergroups/index');

  andThen(function() {
    var selector = '#cohort-picker select';
    pickOption(selector, 'Class of 2017').then(function(){
      click('button:contains("New Learner Group")');
      equal(find('#learner-groups table:first tbody tr').length, 3);
      equal(find('#learner-groups table:first tbody tr:first td:first').text().trim(), 'First Test Group');
      equal(find('#learner-groups table:first tbody tr:eq(1) td:first').text().trim(), 'Second Test Group');
      fillIn('#learner-groups table:first tbody tr:eq(2) td:first input', 'A New Group');
      click('button:contains("Save")').then(function(){
        equal(find('#learner-groups table:first tbody tr:first td:first').text().trim(), 'A New Group');
        equal(find('#learner-groups table:first tbody tr:eq(1) td:first').text().trim(), 'First Test Group');
      });
    });
  });
});

test('remove new group', function() {
  expect(5);
  visit('/learnergroups/index');
  andThen(function() {
    pickOption('#cohort-picker select', 'Class of 2017').then(function(){
      click('button:contains("New Learner Group")');
      equal(find('#learner-groups table:first tbody tr').length, 3);
      click('button:contains("Remove")').then(function(){
        equal(find('#learner-groups table:first tbody tr').length, 2);
        equal(find('#learner-groups table:first tbody tr:eq(0) td:first').text().trim(), 'First Test Group');
        equal(find('#learner-groups table:first tbody tr:eq(1) td:first').text().trim(), 'Second Test Group');
      });
    });
  });
});

test('dont sort new group', function() {
  expect(4);
  visit('/learnergroups/index');

  andThen(function() {
    var selector = '#cohort-picker select';
    pickOption(selector, 'Class of 2017').then(function(){
      click('button:contains("New Learner Group")');
      equal(find('#learner-groups table:first tbody tr').length, 3);
      fillIn('#learner-groups table:first tbody tr:eq(2) td:first input', 'aaaNew Group');
      andThen(function(){
        equal(find('#learner-groups table:first tbody tr:eq(0) td:first').text().trim(), 'First Test Group');
        equal(find('#learner-groups table:first tbody tr:eq(1) td:first').text().trim(), 'Second Test Group');
      });
    });
  });
});

test('filtergroups', function() {
  expect(4);
  visit('/learnergroups/index');

  andThen(function() {
    pickOption('#cohort-picker select', 'Class of 2017').then(function(){

      equal(find('#learner-groups table:first tbody tr').length, 2);
      fillIn('#learner-groups input:first', 'Second');
      equal(find('#learner-groups table:first tbody tr').length, 1);
      equal(find('#learner-groups table:first tbody tr:eq(0) td:first').text().trim(), 'Second Test Group');
    });
  });
});

test('change school', function() {
  expect(9);
  visit('/learnergroups/index');
  andThen(function() {
    equal(find('header .user').text().trim(), 'Test User First School');
    pickOption('.school-picker select', 'Second School').then(function(){
      equal(find('#cohort-picker select option').length, 1);
      equal(find('#cohort-picker select option').text().trim(), 'Please Select a Cohort');
      equal(find('header .user').text().trim(), 'Test User Second School');
    });
    pickOption('.school-picker select', 'First School').then(function(){
      equal(find('#cohort-picker select option').length, 5);
      equal(find('#cohort-picker select option').text().trim(), 'Please Select a CohortClass of 2014Class of 2017Class of 2018Overridden Title');
      equal(find('header .user').text().trim(), 'Test User First School');
    });
  });
});
