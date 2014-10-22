import Ember from 'ember';
import startApp from '../../helpers/start-app';

var App;

module('Acceptance: InstructorGroupsIndex', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test('visiting', function() {
  expect(1);
  visit('/instructorgroups/index');

  andThen(function() {
    equal(currentPath(), 'instructorgroups.index');
  });
});

test('breadcrumbs', function() {
  visit('/instructorgroups/index');

  andThen(function() {
    var expectedCrumbs = ['Home', 'Instructor Groups'];
    checkBreadcrumbs(expectedCrumbs);
  });
});

test('list groups', function() {
  expect(3);
  visit('/instructorgroups/index');

  andThen(function() {
    var row = find('.container table:first tbody tr:first');
    equal(find('td:eq(0)', row).text().trim(), 'First Instructor Group');
    equal(find('td:eq(1)', row).text().trim(), '1');
    equal(find('td:eq(2)', row).text().trim(), '0');
  });
});

test('group link', function() {
  expect(1);
  visit('/instructorgroups/index');
  click('a:contains("First Instructor Group")');

  andThen(function() {
    equal(currentPath(), 'instructorgroups.group');
  });
});

test('creategroup', function() {
  expect(5);
  visit('/instructorgroups/index');

  andThen(function() {
    click('button:contains("New Instructor Group")');
    equal(find('.container table:first tbody tr').length, 4);
    equal(find('.container table:first tbody tr:first td:first').text().trim(), 'First Instructor Group');
    equal(find('.container table:first tbody tr:eq(1) td:first').text().trim(), 'Second Instructor Group');
    fillIn('.container table:first tbody tr:eq(3) td:first input', 'A New Group');
    click('button:contains("Save")').then(function(){
      equal(find('.container table:first tbody tr:first td:first').text().trim(), 'A New Group');
      equal(find('.container table:first tbody tr:eq(1) td:first').text().trim(), 'First Instructor Group');
    });
  });
});

test('remove new group', function() {
  expect(5);
  visit('/instructorgroups/index');

  andThen(function() {
    click('button:contains("New Instructor Group")');
    equal(find('.container table:first tbody tr').length, 4);
    click('button:contains("Remove")').then(function(){
      equal(find('.container table:first tbody tr').length, 3);
      equal(find('.container table:first tbody tr:eq(0) td:first').text().trim(), 'First Instructor Group');
      equal(find('.container table:first tbody tr:eq(1) td:first').text().trim(), 'Second Instructor Group');
      equal(find('.container table:first tbody tr:eq(2) td:first').text().trim(), 'Third Instructor Group');
    });
  });
});

test('dont sort new group', function() {
  expect(4);
  visit('/instructorgroups/index');

  andThen(function() {
    click('button:contains("New Instructor Group")');
    equal(find('.container table:first tbody tr').length, 4);
    fillIn('.container table:first tbody tr:eq(3) td:first input', 'aaaNew Group');
    andThen(function(){
      equal(find('.container table:first tbody tr:eq(0) td:first').text().trim(), 'First Instructor Group');
      equal(find('.container table:first tbody tr:eq(1) td:first').text().trim(), 'Second Instructor Group');
      equal(find('.container table:first tbody tr:eq(2) td:first').text().trim(), 'Third Instructor Group');
    });

  });
});

test('filtergroups', function() {
  expect(3);
  visit('/instructorgroups/index');

  andThen(function() {
    equal(find('.container table:first tbody tr').length, 3);
    fillIn('.container input:first', 'Second');
    equal(find('.container table:first tbody tr').length, 1);
    equal(find('.container table:first tbody tr:eq(0) td:first').text().trim(), 'Second Instructor Group');
  });
});

test('change school', function() {
  expect(6);
  visit('/instructorgroups/index');
  andThen(function() {
    equal(find('header .user').text().trim(), 'Test User First School');
    var selector = '.school-picker select';
    equal(find(selector).length, 1);
    find(selector).find('option').filter(function() {
      return this.text === "Second School";
    }).prop('selected', true);
    triggerEvent(selector, 'change').then(function(){
      equal(find('.container table:first tbody tr').length, 0);
      equal(find('header .user').text().trim(), 'Test User Second School');
    });
    find(selector).find('option').filter(function() {
      return this.text === "First School";
    }).prop('selected', true);
    triggerEvent(selector, 'change').then(function(){
      equal(find('.container table:first tbody tr').length, 3);
      equal(find('header .user').text().trim(), 'Test User First School');
    });
  });
});
