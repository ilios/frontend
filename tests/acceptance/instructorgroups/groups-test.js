import Ember from 'ember';
import startApp from '../../helpers/start-app';

var App;

module('Acceptance: InstructorGroupsGroups', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

var getGroup = function(groupNumber){
  return find('#instructor-groups .expander:not(.expander .expander):eq(' + groupNumber + ')');
};

var getGroupContent = function(groupNumber){
  return find('.expander-content:first > .instructorgroup', getGroup(groupNumber));
};

var getGroupTitle = function(groupNumber){
  return find('.expander-toggle:first a', getGroup(groupNumber)).text().trim();
};

test('visiting', function() {
  expect(1);
  visit('/instructorgroups/school/0/index');

  andThen(function() {
    equal(currentPath(), 'instructorgroups.instructorgroupsschool.index');
  });
});

test('breadcrumbs', function() {
  visit('/instructorgroups/school/0/index');

  andThen(function() {
    var expectedCrumbs = ['Home', 'Instructor Groups', 'First School'];
    checkBreadcrumbs(expectedCrumbs);
  });
});

test('list groups', function() {
  expect(3);
  visit('/instructorgroups/school/0/index');

  andThen(function() {
    equal(getGroupTitle(0), 'First Instructor Group');
    equal(getGroupTitle(1), 'Second Instructor Group');
    equal(getGroupTitle(2), 'Third Instructor Group');

  });
});

test('creategroup', function() {
  expect(7);
  visit('/instructorgroups/school/0/index');

  andThen(function() {
    click('button:contains("New Instructor Group")');
    equal(find('#instructor-groups .expander:not(.expander .expander)').length, 4);
    equal(getGroupTitle(0), 'First Instructor Group');
    equal(getGroupTitle(1), 'Second Instructor Group');
    fillIn('.title input', getGroupContent(3), 'A New Group');
    click('button:contains("Save")', getGroup(3)).then(function(){
      equal(getGroupTitle(0), 'A New Group');
      equal(getGroupTitle(1), 'First Instructor Group');
      equal(getGroupTitle(2), 'Second Instructor Group');
      equal(getGroupTitle(3), 'Third Instructor Group');
    });
  });
});

test('remove new group', function() {
  expect(5);
  visit('/instructorgroups/school/0/index');
  andThen(function() {
    click('button:contains("New Instructor Group")');
    equal(find('#instructor-groups .expander:not(.expander .expander)').length, 4);
    click('button:contains("Remove")', getGroup(3)).then(function(){
    equal(find('#instructor-groups .expander:not(.expander .expander)').length, 3);
      equal(getGroupTitle(0), 'First Instructor Group');
      equal(getGroupTitle(1), 'Second Instructor Group');
      equal(getGroupTitle(2), 'Third Instructor Group');
    });
  });
});

test('remove group', function() {
  expect(3);
  visit('/instructorgroups/school/0/index');
  andThen(function() {
    equal(find('#instructor-groups .expander:not(.expander .expander)').length, 3);
    click('button:contains("Remove")', getGroup(0)).then(function(){
      equal(find('#instructor-groups .expander:not(.expander .expander)').length, 2);
      equal(getGroupTitle(0), 'Second Instructor Group');
    });
  });
});

test('dont sort new group', function() {
  expect(4);
  visit('/instructorgroups/school/0/index');

  andThen(function() {
    click('button:contains("New Instructor Group")');
    equal(find('#instructor-groups .expander:not(.expander .expander)').length, 4);
    fillIn('.title input', getGroupContent(3), 'A New Group');
    andThen(function(){
      equal(getGroupTitle(0), 'First Instructor Group');
      equal(getGroupTitle(1), 'Second Instructor Group');
      equal(getGroupTitle(2), 'Third Instructor Group');
    });
  });
});

test('filtergroups', function() {
  expect(3);
  visit('/instructorgroups/school/0/index');

  andThen(function() {
    equal(find('#instructor-groups .expander:not(.expander .expander)').length, 3);
    fillIn('#instructor-groups input:first', 'Second');
    equal(find('#instructor-groups .expander:not(.expander .expander)').length, 1);
    equal(getGroupTitle(0), 'Second Instructor Group');
  });
});

test('edit title', function() {
  expect(6);
  visit('/instructorgroups/school/0/index').then(function(){
    var input = find('.title input:first', getGroupContent(0));

    equal(input.length, 1);
    equal(input.val(), 'First Instructor Group');
    var newTitle = 'xxxTitle Changed';
    input.val(newTitle);
    input.trigger('change');
    click('button:contains("Save")', getGroup(0));
    andThen(function() {
      equal(input.val(), newTitle);
      equal(getGroupTitle(0), 'Second Instructor Group');
      equal(getGroupTitle(1), 'Third Instructor Group');
      equal(getGroupTitle(2), newTitle);
    });
  });

});

test('list instructors', function() {
  expect(6);
  visit('/instructorgroups/school/0/index');

  andThen(function() {
    var row = find('.members:first table:first tbody tr:eq(0)', getGroupContent(1));
    equal(find('td:eq(0)', row).text().trim(), 'Test Person');
    equal(find('td:eq(1)', row).text().trim(), 'test.person@example.com');
    equal(find('td:eq(2)', row).text().trim(), 'Remove');


    row = find('.members:first table:first tbody tr:eq(1)', getGroupContent(1));
    equal(find('td:eq(0)', row).text().trim(), 'Test User');
    equal(find('td:eq(1)', row).text().trim(), 'test.user@example.com');
    equal(find('td:eq(2)', row).text().trim(), 'Remove');
  });
});

test('add instructor', function() {
  expect(12);
  visit('/instructorgroups/school/0/index');

  andThen(function() {
    var table = find('.members:first table:first tbody', getGroupContent(0));
    equal(find('tr', table).length, 1);
    fillIn('.search-bar:first .search-and-submit input', getGroupContent(0), 'example');
    click('.search-bar:first .search-and-submit button', getGroupContent(0)).then(function(){
      equal(find('.search-results li.enabled', getGroupContent(0)).length, 2);
      equal(find('.search-results li.disabled', getGroupContent(0)).length, 1);
      click('.search-results li.enabled:eq(0) .add', getGroupContent(0)).then(function() {
        equal(find('tr', table).length, 2);
        equal(find('.search-results li.enabled', getGroupContent(0)).length, 1);
        equal(find('.search-results li.disabled', getGroupContent(0)).length, 2);
      });
    });
  });
  andThen(function() {
    var table = find('.members:first table:first tbody', getGroupContent(0));
    var row = find('tr:eq(0)', table);
    equal(find('td:eq(0)', row).text().trim(), 'Cool Guy');
    equal(find('td:eq(1)', row).text().trim(), 'coolguy@example.com');
    equal(find('td:eq(2)', row).text().trim(), 'Remove');


    row = find('tr:eq(1)', table);
    equal(find('td:eq(0)', row).text().trim(), 'Test Person');
    equal(find('td:eq(1)', row).text().trim(), 'test.person@example.com');
    equal(find('td:eq(2)', row).text().trim(), 'Remove');
  });
});


test('filterinstructors', function() {
  expect(3);
  visit('/instructorgroups/school/0/index');

  andThen(function() {
    var table = find('.members:first table:first tbody', getGroupContent(1));
    equal(find('tr', table).length, 2);
    fillIn('.members input:eq(0)', getGroupContent(1), 'Person');
    equal(find('tr', table).length, 1);
    equal(find('td:first', table).text().trim(), 'Test Person');
  });
});
