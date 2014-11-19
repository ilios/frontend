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

var getGroup = function(groupNumber){
  return find('#learner-groups .expander:not(.expander .expander):eq(' + groupNumber + ')');
};

var getGroupContent = function(groupNumber){
  return find('.expander-content:first > .learnergroup', getGroup(groupNumber));
};

var getGroupTitle = function(groupNumber){
  return find('.expander-toggle:first a', getGroup(groupNumber)).text().trim();
};

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
    var expectedCrumbs = ['Home', 'Learner Groups', 'First School', 'Class of 2017'];
    checkBreadcrumbs(expectedCrumbs);
  });
});

test('list groups', function() {
  expect(2);
  visit('/learnergroups/school/0/cohort/0/index');

  andThen(function() {
    equal(getGroupTitle(0), 'First Test Group');
    equal(getGroupTitle(1), 'Second Test Group');

  });
});

test('creategroup', function() {
  expect(6);
  visit('/learnergroups/school/0/cohort/0/index');

  andThen(function() {
    click('button:contains("New Learner Group")');
    equal(find('#learner-groups .expander:not(.expander .expander)').length, 3);
    equal(getGroupTitle(0), 'First Test Group');
    equal(getGroupTitle(1), 'Second Test Group');
    fillIn('.title input', getGroupContent(2), 'A New Group');
    click('button:contains("Save")').then(function(){
      equal(getGroupTitle(0), 'A New Group');
      equal(getGroupTitle(1), 'First Test Group');
      equal(getGroupTitle(2), 'Second Test Group');
    });
  });
});

test('remove new group', function() {
  expect(4);
  visit('/learnergroups/school/0/cohort/0/index');
  andThen(function() {
    click('button:contains("New Learner Group")');
    equal(find('#learner-groups .expander:not(.expander .expander)').length, 3);
    click('button:contains("Remove")', getGroup(2)).then(function(){
    equal(find('#learner-groups .expander:not(.expander .expander)').length, 2);
      equal(getGroupTitle(0), 'First Test Group');
      equal(getGroupTitle(1), 'Second Test Group');
    });
  });
});

test('remove group', function() {
  expect(3);
  visit('/learnergroups/school/0/cohort/0/index');
  andThen(function() {
    equal(find('#learner-groups .expander:not(.expander .expander)').length, 2);
    click('button:contains("Remove")', getGroup(0)).then(function(){
    equal(find('#learner-groups .expander:not(.expander .expander)').length, 1);
      equal(getGroupTitle(0), 'Second Test Group');
    });
  });
});

test('dont sort new group', function() {
  expect(3);
  visit('/learnergroups/school/0/cohort/0/index');

  andThen(function() {
    click('button:contains("New Learner Group")');
    equal(find('#learner-groups .expander:not(.expander .expander)').length, 3);
    fillIn('.title input', getGroupContent(2), 'A New Group');
    andThen(function(){
      equal(getGroupTitle(0), 'First Test Group');
      equal(getGroupTitle(1), 'Second Test Group');
    });
  });
});

test('filtergroups', function() {
  expect(3);
  visit('/learnergroups/school/0/cohort/0/index');

  andThen(function() {
    equal(find('#learner-groups .expander:not(.expander .expander)').length, 2);
    fillIn('#learner-groups input:first', 'Second');
    equal(find('#learner-groups .expander:not(.expander .expander)').length, 1);
    equal(getGroupTitle(0), 'Second Test Group');
  });
});

test('edit title', function() {
  expect(5);
  visit('/learnergroups/school/0/cohort/0/index').then(function(){
    var input = find('.title input:first', getGroupContent(0));

    equal(input.length, 1);
    equal(input.val(), 'First Test Group');
    var newTitle = 'Title Changed';
    input.val(newTitle);
    input.trigger('change');
    click('button:contains("Save")', getGroup(0));
    andThen(function() {
      equal(input.val(), newTitle);
      equal(getGroupTitle(0), 'Second Test Group');
      equal(getGroupTitle(1), newTitle);
    });
  });

});

test('list learners', function() {
  expect(6);
  visit('/learnergroups/school/0/cohort/0/index');

  andThen(function() {
    var row = find('.members:first table:first tbody tr:eq(0)', getGroupContent(0));
    equal(find('td:eq(0)', row).text().trim(), 'Test Person');
    equal(find('td:eq(1)', row).text().trim(), 'test.person@example.com');
    equal(find('td:eq(2)', row).text().trim(), 'Remove');


    row = find('.members:first table:first tbody tr:eq(1)', getGroupContent(0));
    equal(find('td:eq(0)', row).text().trim(), 'Test User');
    equal(find('td:eq(1)', row).text().trim(), 'test.user@example.com');
    equal(find('td:eq(2)', row).text().trim(), 'Remove');
  });
});

test('add learner', function() {
  expect(12);
  visit('/learnergroups/school/0/cohort/0/index');

  andThen(function() {
    var table = find('.members:first table:first tbody', getGroupContent(1));
    equal(find('tr', table).length, 1);
    fillIn('.search-bar:first .search-and-submit input', getGroupContent(1), 'example');
    click('.search-bar:first .search-and-submit button', getGroupContent(1)).then(function(){
      equal(find('.search-results li.enabled', getGroupContent(1)).length, 2);
      equal(find('.search-results li.disabled', getGroupContent(1)).length, 1);
      click('.search-results li.enabled:eq(0) .add', getGroupContent(1)).then(function() {
        equal(find('tr', table).length, 2);
        equal(find('.search-results li.enabled', getGroupContent(1)).length, 1);
        equal(find('.search-results li.disabled', getGroupContent(1)).length, 2);
      });
    });
  });
  andThen(function() {
    var table = find('.members:first table:first tbody', getGroupContent(1));
    var row = find('tr:eq(0)', table);
    equal(find('td:eq(0)', row).text().trim(), 'Cool Guy');
    equal(find('td:eq(1)', row).text().trim(), 'coolguy@example.com');
    equal(find('td:eq(2)', row).text().trim(), 'Remove');


    row = find('tr:eq(1)', table);
    equal(find('td:eq(0)', row).text().trim(), 'Test User');
    equal(find('td:eq(1)', row).text().trim(), 'test.user@example.com');
    equal(find('td:eq(2)', row).text().trim(), 'Remove');
  });
});


test('filterlearners', function() {
  expect(3);
  visit('/learnergroups/school/0/cohort/0/index');

  andThen(function() {
    var table = find('.members:first table:first tbody', getGroupContent(0));
    equal(find('tr', table).length, 2);
    fillIn('.members input:eq(0)', getGroupContent(0), 'Person');
    equal(find('tr', table).length, 1);
    equal(find('td:first', table).text().trim(), 'Test Person');
  });
});
