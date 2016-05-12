import destroyApp from '../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import {b as testgroup} from 'ilios/tests/helpers/test-groups';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import Ember from 'ember';

const { isEmpty, isPresent } = Ember;

var application;
const url = '/learnergroups';

module('Acceptance: Learner Groups' + testgroup, {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application, false);
  },

  afterEach: function() {
    destroyApp(application);
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
  const schoolsFilter = '.filter:eq(0)';
  const programsFilter = '.filter:eq(1)';
  const yearsFilter = '.filter:eq(2)';
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
    assert.equal(getElementText(find(schoolsFilter)), getText('school 0'));
    assert.equal(getElementText(find(programsFilter)), getText('program 0'));
    assert.equal(getElementText(find(yearsFilter)), getText('cohort 0'));
  });
});

test('multi-option filters', function(assert) {
  const schoolsFilter = '.filter:eq(0) option';
  const programsFilter = '.filter:eq(1) option';
  const yearsFilter = '.filter:eq(2) option';
  assert.expect(6);
  server.create('permission', {
    user: 4136,
    tableName: 'school',
    tableRowId: 2,
    canRead: true
  });
  server.create('user', {id: 4136, permissions: [1]});
  server.create('school', {
    programs: [1]
  });
  server.create('school');
  server.create('program', {
    school: 1,
    programYears: [1, 2]
  });
  server.create('program', {
    school: 1,
  });
  server.create('programYear', {
    program: 1,
    cohort: 1
  });
  server.create('programYear', {
    program: 1,
    cohort: 2
  });
  server.create('cohort', {
    programYear: 1,
  });
  server.create('cohort', {
    programYear: 2,
  });
  visit('/learnergroups');
  andThen(function() {
    assert.equal(find(schoolsFilter).length, 2);
    assert.equal(getElementText(find(schoolsFilter)), getText('school 0 school 1'));
    assert.equal(find(programsFilter).length, 3);
    assert.equal(getElementText(find(programsFilter)), getText('Select a Program program 0 program 1'));
    assert.equal(find(yearsFilter).length, 2);
    assert.equal(getElementText(find(yearsFilter)), getText('cohort 1 cohort 0'));
  });
});

test('primary school is selected by default', function(assert) {
  const schoolsFilter = '.filter:eq(0) option:selected';
  assert.expect(1);
  server.create('permission', {
    user: 4136,
    tableName: 'school',
    tableRowId: 1,
    canRead: true
  });
  server.create('user', {id: 4136, permissions: [1], school: 2});
  server.create('school', {users: []});
  server.create('school', {
    users: [1]
  });
  visit('/learnergroups');
  andThen(function() {
    assert.equal(getElementText(find(schoolsFilter)), getText('school 1'));
  });
});

test('multi-option filters', function(assert) {
  const schoolsFilter = '.filter:eq(0) option';
  const programsFilter = '.filter:eq(1) option';
  const yearsFilter = '.filter:eq(2) option';
  assert.expect(6);
  server.create('permission', {
    user: 4136,
    tableName: 'school',
    tableRowId: 2,
    canRead: true
  });
  server.create('user', {id: 4136, permissions: [1]});
  server.create('school', {
    programs: [1]
  });
  server.create('school');
  server.create('program', {
    school: 1,
    programYears: [1, 2]
  });
  server.create('program', {
    school: 1,
  });
  server.create('programYear', {
    program: 1,
    cohort: 1
  });
  server.create('programYear', {
    program: 1,
    cohort: 2
  });
  server.create('cohort', {
    programYear: 1,
  });
  server.create('cohort', {
    programYear: 2,
  });
  visit('/learnergroups');
  andThen(function() {
    assert.equal(find(schoolsFilter).length, 2);
    assert.equal(getElementText(find(schoolsFilter)), getText('school 0 school 1'));
    assert.equal(find(programsFilter).length, 3);
    assert.equal(getElementText(find(programsFilter)), getText('Select a Program program 0 program 1'));
    assert.equal(find(yearsFilter).length, 2);
    assert.equal(getElementText(find(yearsFilter)), getText('cohort 1 cohort 0'));
  });
});

test('multiple programs filter', function(assert) {
  const selectedProgram = '.filter:eq(1) select option:selected';
  const programOptions = '.filter:eq(1) select option';
  const programSelectList = '.filter:eq(1) select';
  const firstListedLearnerGroup = '.resultslist-list tbody tr td:eq(0)';
  assert.expect(8);
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
    assert.equal(getElementText(find(selectedProgram)), getText('program 0'));
    andThen(function(){
      assert.equal(getElementText(find(firstListedLearnerGroup)),getText(firstLearnergroup.title));
      var options = find(programOptions);
      assert.equal(options.length, 3);
      assert.equal(getElementText(options.eq(0)), getText('Select a Program'));
      assert.equal(getElementText(options.eq(1)), getText('program 0'));
      assert.equal(getElementText(options.eq(2)), getText('program 1'));
      pickOption(programSelectList, 'program 1', assert);
      andThen(() => {
        assert.equal(getElementText(find(firstListedLearnerGroup)),getText(secondLearnergroup.title));
      });
    });
  });
});

test('multiple program years filter', function(assert) {
  const selectedProgramYear = '.filter:eq(2) select option:selected';
  const programYearOptions = '.filter:eq(2) select option';
  const programYearSelectList = '.filter:eq(2) select';
  const firstListedLearnerGroup = '.resultslist-list tbody tr td:eq(0)';
  assert.expect(7);
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
    assert.equal(getElementText(find(selectedProgramYear)), getText('cohort 1'));
    assert.equal(getElementText(find(firstListedLearnerGroup)),getText(secondLearnergroup.title));
    var options = find(programYearOptions);
    assert.equal(options.length, 2);
    assert.equal(getElementText(options.eq(0)), getText('cohort 1'));
    assert.equal(getElementText(options.eq(1)), getText('cohort 0'));
    pickOption(programYearSelectList, 'cohort 0', assert);
    andThen(function(){
      assert.equal(getElementText(find(firstListedLearnerGroup)),getText(firstLearnergroup.title));
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

  visit('/learnergroups');
  andThen(function() {
    assert.equal(2, find('.resultslist-list tbody tr').length);
    var rows = find('.resultslist-list tbody tr');
    assert.equal(getElementText(find('td:eq(0)', rows.eq(0))),getText(firstLearnergroup.title));
    // Assertion below needs to be fixed (issue #1157)
    // assert.equal(getElementText(find('td:eq(1)', rows.eq(0))), 11);
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

function getCellData(row, cell) {
  return find(`.resultslist-list tbody tr:eq(${row}) td:eq(${cell})`).text().trim();
}

test('add new learnergroup', function(assert) {
  assert.expect(2);

  server.create('user', { id: 4136 });
  server.create('school', { programs: [1] });
  server.create('program', {
    school: 1,
    programYears: [1]
  });
  server.create('programYear', {
    program: 1,
    cohort: 1
  });
  server.create('cohort', {
    programYear: 1
  });

  const expandButton = '.expand-button';
  const input = '.new-learnergroup input';
  const done = '.new-learnergroup .done';

  visit(url);
  click(expandButton);
  fillIn(input, 'A New Test Title');
  click(done);
  andThen(() => {
    assert.equal(getCellData(0, 0), 'A New Test Title', 'title is correct');
    assert.equal(getCellData(0, 1), 0, 'member count is correct');
  });
});

test('cancel adding new learnergroup', function(assert) {
  assert.expect(8);

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

  const expandButton = '.expand-button';
  const collapseButton = '.collapse-button';
  const cancelButton = '.new-learnergroup .cancel';
  const component = '.new-learnergroup';

  visit(url);
  click(expandButton);
  andThen(() => {
    assert.ok(isPresent(find(collapseButton)), 'collapse button is visible');
    assert.ok(isPresent(find(component)), '`new-learnergroup` component is visible');
  });

  click(cancelButton);
  andThen(() => {
    assert.ok(isPresent(find(expandButton)), 'expand button is visible');
    assert.ok(isEmpty(find(component)), '`new-learnergroup` component is not visible');
    assert.equal(getCellData(0, 0), 'learner group 0');
  });

  click(expandButton);
  click(collapseButton);
  andThen(() => {
    assert.ok(isPresent(find(expandButton)), 'expand button is visible');
    assert.ok(isEmpty(find(component)), '`new-learnergroup` component is not visible');
    assert.equal(getCellData(0, 0), 'learner group 0');
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

test('add new learnergroup with full cohort', function(assert) {
  assert.expect(2);

  server.create('user', { id: 4136 });
  server.create('school', { programs: [1] });
  server.create('program', {
    school: 1,
    programYears: [1]
  });
  server.create('programYear', {
    program: 1,
    cohort: 1
  });
  server.createList('user', 5, {cohort: 1});
  server.create('cohort', {
    programYear: 1,
    users: [2,3,4,5,6]
  });

  const expandButton = '.expand-button';
  const input = '.new-learnergroup input[type=text]';
  const addFullCohort = '.new-learnergroup .clickable:eq(0)';
  const done = '.new-learnergroup .done';

  visit(url);
  click(expandButton);
  fillIn(input, 'A New Test Title');
  click(addFullCohort);
  click(done);
  andThen(() => {
    assert.equal(getCellData(0, 0), 'A New Test Title', 'title is correct');
    assert.equal(getCellData(0, 1), 5, 'member count is correct');
  });
});
