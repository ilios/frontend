import Ember from 'ember';
import startApp from '../../helpers/start-app';

var App;

module('Acceptance: InstructorGroupsGroup', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test('visiting', function() {
  expect(1);
  visit('/instructorgroups/0');

  andThen(function() {
    equal(currentPath(), 'instructorgroups.group');
  });
});

test('breadcrumbs', function() {
  visit('/instructorgroups/0');

  andThen(function() {
    var expectedCrumbs = ['Home', 'Instructor Groups', 'First Instructor Group'];
    checkBreadcrumbs(expectedCrumbs);
  });
});

test('edit title', function() {
  expect(4);
  visit('/instructorgroups/0').then(function(){
    var input = find('.container input:eq(0)');

    equal(input.length, 1);
    equal(input.val(), 'First Instructor Group');
    var newTitle = 'Title Changed';
    input.val(newTitle);
    input.trigger('change');
    click('button:contains("Save")');
    andThen(function() {
      equal(input.val(), newTitle);
      equal(find('.container h3:first').text().trim(), 'Editing ' + newTitle);
    });
  });

});

test('list instructors', function() {
  expect(6);
  visit('/instructorgroups/1');

  andThen(function() {
    var row = find('.container table:first tbody tr:eq(0)');
    equal(find('td:eq(0)', row).text().trim(), 'Test Person');
    equal(find('td:eq(1)', row).text().trim(), 'test.person@example.com');
    equal(find('td:eq(2)', row).text().trim(), 'Remove');


    row = find('.container table:first tbody tr:eq(1)');
    equal(find('td:eq(0)', row).text().trim(), 'Test User');
    equal(find('td:eq(1)', row).text().trim(), 'test.user@example.com');
    equal(find('td:eq(2)', row).text().trim(), 'Remove');
  });
});

test('add instructor', function() {
  expect(5);
  visit('/instructorgroups/0');

  andThen(function() {
    equal(find('.container table:first tbody tr').length, 1);
    click('button:contains("Add Instructor")');
    fillIn('.search-bar:first .search-and-submit input', 'test');
    click('.search-bar:first .search-and-submit button').then(function(){
      equal(find('.modal-dialog li.enabled').length, 2);
      equal(find('.modal-dialog li.disabled').length, 1);
      click('.modal-dialog li.enabled:eq(0) .add').then(function() {
        equal(find('.container table:first tbody tr').length, 2);
        equal(find('.modal-dialog li.enabled').length, 1);
      });
    });


  });
});

test('filterinstructors', function() {
  expect(3);
  visit('/instructorgroups/1');

  andThen(function() {
    equal(find('.container table:first tbody tr').length, 2);
    fillIn('.container fieldset:eq(0) input:eq(0)', 'Person');
    equal(find('.container table:first tbody tr').length, 1);
    equal(find('.container table:first tbody tr:eq(0) td:first').text().trim(), 'Test Person');
  });
});

test('list courses', function() {
  expect(3);
  visit('/instructorgroups/2');

  andThen(function() {
    var list = find('.container fieldset:eq(1) ul');
    equal(find('li', list).length, 2);
    equal(find('li:eq(0)', list).text().trim(), 'First Test Course');
    equal(find('li:eq(1)', list).text().trim(), 'Second Test Course');
  });
});

test('filter courses', function() {
  expect(3);
  visit('/instructorgroups/2');

  andThen(function() {
    equal(find('.container fieldset:eq(1) li').length, 2);
    fillIn('.container fieldset:eq(1) input:eq(0)', 'Second');
    equal(find('.container fieldset:eq(1) li').length, 1);
    equal(find('.container fieldset:eq(1) li:eq(0)').text().trim(), 'Second Test Course');
  });
});


/**
 * This test is for a bug discovered that when changing a title and then navigating to another group
 * the title for the first group would be in the second grouped edit input
 */
test('non sticky title edit', function() {
  expect(4);
  visit('/instructorgroups/0').then(function(){
    var input = find('.container input:eq(0)');

    equal(input.length, 1);
    equal(input.val(), 'First Instructor Group');
    var newTitle = 'Title Changed';
    input.val(newTitle);
    input.trigger('change');
    click('button:contains("Save")');
    click('.breadcrumbs a:contains("Instructor Groups")');
    click('.container table:first tbody tr:first td:eq(0) a');
    andThen(function() {
      equal(find('.container input:eq(0)').val(), 'Second Instructor Group');
      equal(find('.container h3:first').text().trim(), 'Editing Second Instructor Group');
    });
  });
});
