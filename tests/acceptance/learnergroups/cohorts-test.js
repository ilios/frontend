import Ember from 'ember';
import startApp from '../../helpers/start-app';

var App;

module('Acceptance: LearnerGroupsListCohorts', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test('visiting', function() {
  expect(1);
  visit('/learnergroups/school/0/index');

  andThen(function() {
    // pauseTest(2000);
    equal(currentPath(), 'learnergroups.learnergroupsschool.index');
  });
});

test('breadcrumbs', function() {
  visit('/learnergroups/school/0/index');

  andThen(function() {
    var expectedCrumbs = ['Home', 'Learner Groups', 'First School', 'Select Cohort'];
    checkBreadcrumbs(expectedCrumbs);
  });
});

test('list cohorts', function() {
  expect(4);
  visit('/learnergroups/school/0/index');

  var cohorts = [
    'Class of 2013',
    'Class of 2017',
    'Class of 2018',
    'Overridden Title'
  ];

  andThen(function() {
    var row;
    for(var i =0; i < 4; i++){
        row = find('#learnergroups-cohorts table:first tbody tr:eq(' + i + ')');
        equal(find('td:eq(0)', row).text().trim(), cohorts[i]);
        // equal(find('td:eq(1)', row).text().trim(), '2');
        // equal(find('td:eq(2)', row).text().trim(), '0');
    }
  });
});

test('cohort link', function() {
  expect(1);
  visit('/learnergroups/school/0/index');
  andThen(function() {
    click('#learnergroups-cohorts table:first tbody tr:eq(0) a');
  });
  andThen(function() {
    equal(currentPath(), 'learnergroups.learnergroupsschool.learnergroupscohort.index');
  });
});
