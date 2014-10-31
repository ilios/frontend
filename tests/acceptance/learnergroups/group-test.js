import Ember from 'ember';
import startApp from '../../helpers/start-app';

var App;

module('Acceptance: LearnerGroupsGroup', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test('visiting', function() {
  expect(1);
  visit('/learnergroups/0');

  andThen(function() {
    equal(currentPath(), 'learnergroups.group');
  });
});

test('breadcrumbs', function() {
  visit('/learnergroups/0');

  andThen(function() {
    var expectedCrumbs = ['Home', 'Class of 2017 Learner Groups', 'First Test Group'];
    checkBreadcrumbs(expectedCrumbs);
  });
});

test('edit title', function() {
  expect(4);
  visit('/learnergroups/0').then(function(){
    var input = find('#learner-group-title input:eq(0)');

    equal(input.length, 1);
    equal(input.val(), 'First Test Group');
    var newTitle = 'Title Changed';
    input.val(newTitle);
    input.trigger('change');
    click('button:contains("Save")');
    andThen(function() {
      equal(input.val(), newTitle);
      equal(find('h3:first').text().trim(), 'Editing ' + newTitle);
    });
  });

});

test('list learners', function() {
  expect(6);
  visit('/learnergroups/0');

  andThen(function() {
    var row = find('#learner-group-learners table:first tbody tr:eq(0)');
    equal(find('td:eq(0)', row).text().trim(), 'Test Person');
    equal(find('td:eq(1)', row).text().trim(), 'test.person@example.com');
    equal(find('td:eq(2)', row).text().trim(), 'Remove');


    row = find('#learner-group-learners table:first tbody tr:eq(1)');
    equal(find('td:eq(0)', row).text().trim(), 'Test User');
    equal(find('td:eq(1)', row).text().trim(), 'test.user@example.com');
    equal(find('td:eq(2)', row).text().trim(), 'Remove');
  });
});

test('add learner', function() {
  expect(11);
  visit('/learnergroups/1');

  andThen(function() {
    equal(find('#learner-group-learners table:first tbody tr').length, 1);
    click('button:contains("Add Learner")');
    fillIn('.search-bar:first .search-and-submit input', 'test');
    click('.search-bar:first .search-and-submit button').then(function(){
      equal(find('.modal-dialog li.enabled').length, 2);
      equal(find('.modal-dialog li.disabled').length, 1);
      click('.modal-dialog li.enabled:eq(0) .add').then(function() {
        equal(find('#learner-group-learners table:first tbody tr').length, 2);
        equal(find('.modal-dialog li.enabled').length, 1);
      });
    });
  });
  andThen(function() {
    var row = find('#learner-group-learners table:first tbody tr:eq(0)');
    equal(find('td:eq(0)', row).text().trim(), 'Cool Guy');
    equal(find('td:eq(1)', row).text().trim(), 'coolguy@example.com');
    equal(find('td:eq(2)', row).text().trim(), 'Remove');


    row = find('.container table:first tbody tr:eq(1)');
    equal(find('td:eq(0)', row).text().trim(), 'Test User');
    equal(find('td:eq(1)', row).text().trim(), 'test.user@example.com');
    equal(find('td:eq(2)', row).text().trim(), 'Remove');
  });
});


test('filterlearners', function() {
  expect(3);
  visit('/learnergroups/0');

  andThen(function() {
    equal(find('#learner-group-learners table:first tbody tr').length, 2);
    fillIn('#learner-group-learners input:eq(0)', 'Person');
    equal(find('#learner-group-learners table:first tbody tr').length, 1);
    equal(find('#learner-group-learners table:first tbody tr:eq(0) td:first').text().trim(), 'Test Person');
  });
});

/**
 * When returning from a group following the breadcrumbs the current cohort should be selected and displayed
 */
test('list link', function() {
  expect(9);
  visit('/learnergroups/0');
  andThen(function() {
    click('a:contains("Class of 2017 Learner Groups")');
  });
  andThen(function() {
    equal(currentPath(), 'learnergroups.index');
    equal(find('#cohort-picker select option').length, 5);
    equal(find('#cohort-picker select option').text().trim(), 'Please Select a CohortClass of 2014Class of 2017Class of 2018Overridden Title');
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
