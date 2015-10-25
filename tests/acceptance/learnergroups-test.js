import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import {b as testgroup} from 'ilios/tests/helpers/test-groups';

var application;

module('Acceptance: Learner Groups' + testgroup, {
  beforeEach: function() {
    application = startApp();
    authenticateSession();
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('visiting /learnergroups', function(assert) {
  server.create('user', {id: 4136});
  server.create('school');
  visit('/learnergroups');
  andThen(function() {
    assert.equal(currentPath(), 'learnerGroups');
  });
});

test('single option filters', function(assert) {
  assert.expect(3);
  server.create('user', {id: 4136});
  server.create('school', {
    programs: [1]
  });
  server.create('program', {
    school: 1,
    programYears: [1]
  });
  server.create('programYear', {
    program: 1,
    cohort: 1
  });
  server.create('cohort', {
    programYear: 1,
  });
  visit('/learnergroups');
  andThen(function() {
    assert.equal(getElementText(find('#schoolsfilter')), getText('School: school 0'));
    assert.equal(getElementText(find('#programsfilter')), getText('Program: program 0'));
    assert.equal(getElementText(find('#programyearsfilter')), getText('Cohort: cohort 0'));
  });
});

test('multiple programs filter', function(assert) {
  assert.expect(6);
  server.create('user', {id: 4136});
  server.create('school', {
    programs: [1,2]
  });
  server.create('program', {
    school: 1,
    programYears: [1]
  });
  server.create('programYear', {
    program: 1,
    cohort: 1
  });
  server.create('cohort', {
    programYear: 1,
    learnerGroups: [1]
  });
  server.create('program', {
    school: 1,
    programYears: [2]
  });
  server.create('programYear', {
    program: 2,
    cohort: 2
  });
  server.create('cohort', {
    programYear: 2,
    learnerGroups: [2]
  });
  var firstLearnergroup = server.create('learnerGroup', {
    cohort: 1,
  });
  var secondLearnergroup = server.create('learnerGroup', {
    cohort: 2
  });
  visit('/learnergroups');
  andThen(function() {
    var container = find('#programsfilter');
    assert.equal(getElementText(find('button', container)), getText('program 1'));
    assert.equal(getElementText(find('.resultslist-list tbody tr td:eq(0)')),getText(secondLearnergroup.title));
    click('button', container).then(function(){
      var options = find('li', container);
      assert.equal(options.length, 2);
      assert.equal(getElementText(options.eq(0)), getText('program 0'));
      assert.equal(getElementText(options.eq(1)), getText('program 1'));
      click(options.eq(0)).then(function(){
        assert.equal(getElementText(find('.resultslist-list tbody tr td:eq(0)')),getText(firstLearnergroup.title));
      });
    });
  });
});

test('multiple program years filter', function(assert) {
  assert.expect(6);
  server.create('user', {id: 4136});
  server.create('school', {
    programs: [1]
  });
  server.create('program', {
    school: 1,
    programYears: [1,2]
  });
  server.create('programYear', {
    program: 1,
    cohort: 1
  });
  server.create('cohort', {
    programYear: 1,
    learnerGroups: [1]
  });
  server.create('programYear', {
    program: 1,
    cohort: 2
  });
  server.create('cohort', {
    programYear: 2,
    learnerGroups: [2]
  });
  var firstLearnergroup = server.create('learnerGroup', {
    cohort: 1,
  });
  var secondLearnergroup = server.create('learnerGroup', {
    cohort: 2
  });
  visit('/learnergroups');
  andThen(function() {
    var container = find('#programyearsfilter');
    assert.equal(getElementText(find('button', container)), getText('cohort 1'));
    assert.equal(getElementText(find('.resultslist-list tbody tr td:eq(0)')),getText(secondLearnergroup.title));
    click('button', container).then(function(){
      var options = find('li', container);
      assert.equal(options.length, 2);
      assert.equal(getElementText(options.eq(0)), getText('cohort 0'));
      assert.equal(getElementText(options.eq(1)), getText('cohort 1'));
      click(options.eq(0)).then(function(){
        assert.equal(getElementText(find('.resultslist-list tbody tr td:eq(0)')),getText(firstLearnergroup.title));
      });
    });
  });
});

test('list groups', function(assert) {
  server.create('user', {id: 4136});
  server.createList('user', 5, {
    learnerGroups: [1]
  });
  server.createList('user', 2, {
    learnerGroups: [3]
  });
  server.createList('user', 2, {
    learnerGroups: [4]
  });
  server.createList('user', 2, {
    learnerGroups: [5]
  });
  server.create('school', {
    programs: [1]
  });
  server.create('program', {
    school: 1,
    programYears: [1]
  });
  server.create('programYear', {
    program: 1,
    cohort: 1
  });
  server.create('cohort', {
    programYear: 1,
    learnerGroups: [1,2]
  });
  var firstLearnergroup = server.create('learnerGroup', {
    cohort: 1,
    users: [2,3,4,5,6],
    offerings: [1,2],
    children: [3,4]
  });
  var secondLearnergroup = server.create('learnerGroup', {
    cohort: 1
  });
  server.create('learnerGroup', {
    parent: 1,
    users: [7,8],
    children: [5]
  });
  server.create('learnerGroup', {
    parent: 1,
    users: [9,10]
  });
  server.create('learnerGroup', {
    parent: 3,
    users: [11,12]
  });
  assert.expect(7);
  visit('/learnergroups');
  andThen(function() {
    assert.equal(2, find('.resultslist-list tbody tr').length);
    var rows = find('.resultslist-list tbody tr');
    assert.equal(getElementText(find('td:eq(0)', rows.eq(0))),getText(firstLearnergroup.title));
    assert.equal(getElementText(find('td:eq(1)', rows.eq(0))), 11);
    assert.equal(getElementText(find('td:eq(2)', rows.eq(0))), 2);

    assert.equal(getElementText(find('td:eq(0)', rows.eq(1))),getText(secondLearnergroup.title));
    assert.equal(getElementText(find('td:eq(1)', rows.eq(1))), 0);
    assert.equal(getElementText(find('td:eq(2)', rows.eq(1))), 0);
  });
});

test('filters by title', function(assert) {
  server.create('user', {id: 4136});
  server.create('school', {
    programs: [1]
  });
  server.create('program', {
    school: 1,
    programYears: [1]
  });
  server.create('programYear', {
    program: 1,
    cohort: 1
  });
  server.create('cohort', {
    programYear: 1,
    learnerGroups: [1,2,3]
  });
  var firstLearnergroup = server.create('learnerGroup', {
    title: 'specialfirstlearnergroup',
    cohort: 1,
  });
  var secondLearnergroup = server.create('learnerGroup', {
    title: 'specialsecondlearnergroup',
    cohort: 1
  });
  var regularLearnergroup = server.create('learnerGroup', {
    title: 'regularlearnergroup',
    cohort: 1
  });
  assert.expect(15);
  visit('/learnergroups');
  andThen(function() {
    assert.equal(find('.resultslist-list tbody tr').length, 3);
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText(regularLearnergroup.title));
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(1) td:eq(0)')),getText(firstLearnergroup.title));
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(2) td:eq(0)')),getText(secondLearnergroup.title));

    //put these in nested later blocks because there is a 500ms debounce on the title filter
    fillIn('#titlefilter input', 'first');
    Ember.run.later(function(){
      assert.equal(1, find('.resultslist-list tbody tr').length);
      assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText(firstLearnergroup.title));
      fillIn('#titlefilter input', 'second');
      andThen(function(){
        Ember.run.later(function(){
          assert.equal(1, find('.resultslist-list tbody tr').length);
          assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText(secondLearnergroup.title));
          fillIn('#titlefilter input', 'special');
          andThen(function(){
            Ember.run.later(function(){
              assert.equal(2, find('.resultslist-list tbody tr').length);
              assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText(firstLearnergroup.title));
              assert.equal(getElementText(find('.resultslist-list tbody tr:eq(1) td:eq(0)')),getText(secondLearnergroup.title));

              fillIn('#titlefilter input', '');
              andThen(function(){
                Ember.run.later(function(){
                  assert.equal(3, find('.resultslist-list tbody tr').length);
                  assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText(regularLearnergroup.title));
                  assert.equal(getElementText(find('.resultslist-list tbody tr:eq(1) td:eq(0)')),getText(firstLearnergroup.title));
                  assert.equal(getElementText(find('.resultslist-list tbody tr:eq(2) td:eq(0)')),getText(secondLearnergroup.title));
                }, 750);
              });
            }, 750);
          });
        }, 750);
      });
    }, 750);
  });
});

test('add new learnergroup', function(assert) {
  server.create('user', {id: 4136});
  server.create('school');
  assert.expect(1);
  visit('/learnergroups');
  andThen(function() {
    click('.resultslist-actions button');
    fillIn('.newlearnergroup-title', 'new test tile');
    click('.newlearnergroup .done');
  });
  andThen(function(){
    assert.equal(currentPath(), 'learnerGroups');
  });
});

test('cancel adding new learnergroup', function(assert) {
  assert.expect(6);
  server.create('user', {id: 4136});

  server.create('school', {
    programs: [1]
  });
  server.create('program', {
    school: 1,
    programYears: [1]
  });
  server.create('programYear', {
    program: 1,
    cohort: 1
  });
  server.create('cohort', {
    programYear: 1,
    learnerGroups: [1]
  });
  server.create('learnerGroup', {
    cohort: 1,
  });
  visit('/learnergroups');
  andThen(function() {
    assert.equal(1, find('.resultslist-list tbody tr').length);
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText('learnergroup 0'));
    click('.resultslist-actions button').then(function(){
      assert.equal(find('.newlearnergroup').length, 1);
      click('.newlearnergroup .cancel');
    });
  });
  andThen(function(){
    assert.equal(find('.newlearnergroup').length, 0);
    assert.equal(1, find('.resultslist-list tbody tr').length);
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText('learnergroup 0'));
  });
});

test('remove learnergroup', function(assert) {
  assert.expect(3);
  server.create('user', {id: 4136});
  server.create('school', {
    programs: [1]
  });
  server.create('program', {
    school: 1,
    programYears: [1]
  });
  server.create('programYear', {
    program: 1,
    cohort: 1
  });
  server.create('cohort', {
    programYear: 1,
    learnerGroups: [1]
  });
  server.create('learnerGroup', {
    cohort: 1,
  });
  visit('/learnergroups');
  andThen(function() {
    assert.equal(1, find('.resultslist-list tbody tr').length);
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText('learnergroup 0'));
    click('.resultslist-list tbody tr:eq(0) td:eq(3) button').then(function(){
      click('.resultslist-list tbody tr:eq(0) td:eq(3) li:eq(1)').then(function(){
        click('.confirm-buttons .remove');
      });
    });
  });
  andThen(function(){
    assert.equal(0, find('.resultslist-list tbody tr').length);
  });
});

test('cancel remove learnergroup', function(assert) {
  assert.expect(4);
  server.create('user', {id: 4136});
  server.create('school', {
    programs: [1]
  });
  server.create('program', {
    school: 1,
    programYears: [1]
  });
  server.create('programYear', {
    program: 1,
    cohort: 1
  });
  server.create('cohort', {
    programYear: 1,
    learnerGroups: [1]
  });
  server.create('learnerGroup', {
    cohort: 1,
  });
  visit('/learnergroups');
  andThen(function() {
    assert.equal(1, find('.resultslist-list tbody tr').length);
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText('learnergroup 0'));
    click('.resultslist-list tbody tr:eq(0) td:eq(3) button').then(function(){
      click('.resultslist-list tbody tr:eq(0) td:eq(3) li:eq(1)').then(function(){
        click('.confirm-buttons .done');
      });
    });
  });
  andThen(function(){
    assert.equal(1, find('.resultslist-list tbody tr').length);
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText('learnergroup 0'));
  });
});

test('confirmation of remove message', function(assert) {
  server.create('user', {id: 4136});
  server.createList('user', 5, {
    learnerGroups: [1]
  });
  server.create('school', {
    programs: [1]
  });
  server.create('program', {
    school: 1,
    programYears: [1]
  });
  server.create('programYear', {
    program: 1,
    cohort: 1
  });
  server.create('cohort', {
    programYear: 1,
    learnerGroups: [1]
  });
  server.create('learnerGroup', {
    cohort: 1,
    users: [2,3,4,5,6],
    offerings: [1,2],
    children: [2,3]
  });
  server.createList('learnerGroup',2, {
    parent: 1
  });
  assert.expect(5);
  visit('/learnergroups');
  andThen(function() {
    assert.equal(1, find('.resultslist-list tbody tr').length);
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText('learnergroup 0'));
    click('.resultslist-list tbody tr:eq(0) td:eq(3) button').then(function(){
      click('.resultslist-list tbody tr:eq(0) td:eq(3) li:eq(1)').then(function(){
        assert.ok(find('.resultslist-list tbody tr:eq(0)').hasClass('confirm-removal'));
        assert.ok(find('.resultslist-list tbody tr:eq(1)').hasClass('confirm-removal'));
        assert.equal(getElementText(find('.resultslist-list tbody tr:eq(1)')), getText('Are you sure you want to delete this learner group, with 5 learners and 2 subgroups? This action cannot be undone. Yes Cancel'));
      });
    });
  });
});

test('click edit takes you to learnergroup route', function(assert) {
  assert.expect(2);
  server.create('user', {id: 4136});
  server.create('school', {
    programs: [1]
  });
  server.create('program', {
    school: 1,
    programYears: [1]
  });
  server.create('programYear', {
    program: 1,
    cohort: 1
  });
  server.create('cohort', {
    programYear: 1,
    learnerGroups: [1]
  });
  server.create('learnerGroup', {
    cohort: 1,
  });
  visit('/learnergroups');
  andThen(function() {
    click('.resultslist-list tbody tr:eq(0) td:eq(3) button').then(function(){
      var edit = find('.resultslist-list tbody tr:eq(0) td:eq(3) li:eq(0)');
      assert.equal(getElementText(edit), 'Edit');
      click(edit);
    });
  });
  andThen(function(){
    assert.equal(currentURL(), '/learnergroups/1');
  });
});

test('click title takes you to learnergroup route', function(assert) {
  assert.expect(1);
  server.create('user', {id: 4136});
  server.create('school', {
    programs: [1]
  });
  server.create('program', {
    school: 1,
    programYears: [1]
  });
  server.create('programYear', {
    program: 1,
    cohort: 1
  });
  server.create('cohort', {
    programYear: 1,
    learnerGroups: [1]
  });
  server.create('learnerGroup', {
    cohort: 1,
  });
  visit('/learnergroups');
  andThen(function() {
    click('.resultslist-list tbody tr:eq(0) td:eq(0) a');
  });
  andThen(function(){
    assert.equal(currentURL(), '/learnergroups/1');
  });
});
