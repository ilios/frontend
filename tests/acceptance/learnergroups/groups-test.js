import Ember from 'ember';
import startApp from '../../helpers/start-app';

var App;

module('Acceptance: LearnerGroupsGroups', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test('visiting', function() {
  expect(1);
  visit('/learnergroups/school/0/cohort/0/index');

  andThen(function() {
    equal(currentPath(), 'learnergroups.learnergroupsschool.learnergroupscohort.index');
  });
});

test('breadcrumbs', function() {
  visit('/learnergroups/school/0/cohort/0/index');

  andThen(function() {
    var expectedCrumbs = ['Home', 'Learner Groups', 'First School', 'Class of 2017', 'All Groups'];
    checkBreadcrumbs(expectedCrumbs);
  });
});

test('list groups', function() {
  expect(6);
  visit('/learnergroups/school/0/cohort/0/index');

  andThen(function() {
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

test('group link', function() {
  expect(1);
  visit('/learnergroups/school/0/cohort/0/index');
  andThen(function() {
    click('a:contains("First Test Group")');
  });
  andThen(function() {
    equal(currentPath(), 'learnergroups.learnergroupsschool.learnergroupscohort.group');
  });
});

test('creategroup', function() {
  expect(5);
  visit('/learnergroups/school/0/cohort/0/index');

  andThen(function() {
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

test('remove new group', function() {
  expect(4);
  visit('/learnergroups/school/0/cohort/0/index');
  andThen(function() {
    click('button:contains("New Learner Group")');
    equal(find('#learner-groups table:first tbody tr').length, 3);
    click('button:contains("Remove")').then(function(){
      equal(find('#learner-groups table:first tbody tr').length, 2);
      equal(find('#learner-groups table:first tbody tr:eq(0) td:first').text().trim(), 'First Test Group');
      equal(find('#learner-groups table:first tbody tr:eq(1) td:first').text().trim(), 'Second Test Group');
    });
  });
});

test('dont sort new group', function() {
  expect(3);
  visit('/learnergroups/school/0/cohort/0/index');

  andThen(function() {
    var selector = '#cohort-picker select';
    click('button:contains("New Learner Group")');
    equal(find('#learner-groups table:first tbody tr').length, 3);
    fillIn('#learner-groups table:first tbody tr:eq(2) td:first input', 'aaaNew Group');
    andThen(function(){
      equal(find('#learner-groups table:first tbody tr:eq(0) td:first').text().trim(), 'First Test Group');
      equal(find('#learner-groups table:first tbody tr:eq(1) td:first').text().trim(), 'Second Test Group');
    });
  });
});

test('filtergroups', function() {
  expect(3);
  visit('/learnergroups/school/0/cohort/0/index');

  andThen(function() {
    equal(find('#learner-groups table:first tbody tr').length, 2);
    fillIn('#learner-groups input:first', 'Second');
    equal(find('#learner-groups table:first tbody tr').length, 1);
    equal(find('#learner-groups table:first tbody tr:eq(0) td:first').text().trim(), 'Second Test Group');
  });
});
