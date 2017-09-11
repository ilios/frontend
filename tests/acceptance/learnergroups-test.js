import destroyApp from '../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import Ember from 'ember';

const { isEmpty, isPresent } = Ember;

var application;
const url = '/learnergroups';

module('Acceptance: Learner Groups', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application, false);
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('visiting /learnergroups', async function(assert) {
  server.create('user', {id: 4136});
  server.create('school');
  await visit('/learnergroups');
  assert.equal(currentPath(), 'learnerGroups');
});

test('single option filters', async function(assert) {
  const schoolsFilter = '.schoolsfilter';
  const programsFilter = '.programsfilter';
  const programyearsfilter = '.programyearsfilter';
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
  await visit('/learnergroups');
  assert.equal(getElementText(find(schoolsFilter)), getText('school 0'));
  assert.equal(getElementText(find(programsFilter)), getText('program 0'));
  assert.equal(getElementText(find(programyearsfilter)), getText('cohort 0'));
});

test('multi-option filters', async function(assert) {
  const schoolSelect = '.schoolsfilter select';
  const schoolsFilter = `${schoolSelect} option`;
  const programsFilter = '.programsfilter option';
  const programyearsfilter = '.programyearsfilter option';
  assert.expect(7);
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
  await visit('/learnergroups');
  assert.equal(find(schoolsFilter).length, 2);
  assert.equal(getElementText(find(schoolsFilter)), getText('school 0 school 1'));
  assert.equal(find(schoolSelect).val(), '1', 'default school is selected');
  assert.equal(find(programsFilter).length, 3);
  assert.equal(getElementText(find(programsFilter)), getText('Select a Program program 0 program 1'));
  assert.equal(find(programyearsfilter).length, 2);
  assert.equal(getElementText(find(programyearsfilter)), getText('cohort 1 cohort 0'));
});

test('primary school is selected by default', async function(assert) {
  const schoolsFilter = '.schoolsfilter option:selected';
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
  await visit('/learnergroups');
  assert.equal(getElementText(find(schoolsFilter)), getText('school 1'));
});

test('multi-option filters', async function(assert) {
  const schoolsFilter = '.schoolsfilter option';
  const programsFilter = '.programsfilter option';
  const programyearsfilter = '.programyearsfilter option';
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
  await visit('/learnergroups');
  assert.equal(find(schoolsFilter).length, 2);
  assert.equal(getElementText(find(schoolsFilter)), getText('school 0 school 1'));
  assert.equal(find(programsFilter).length, 3);
  assert.equal(getElementText(find(programsFilter)), getText('Select a Program program 0 program 1'));
  assert.equal(find(programyearsfilter).length, 2);
  assert.equal(getElementText(find(programyearsfilter)), getText('cohort 1 cohort 0'));
});

test('multiple programs filter', async function(assert) {
  const selectedProgram = '.programsfilter select option:selected';
  const programOptions = '.programsfilter select option';
  const programSelectList = '.programsfilter select';
  const firstListedLearnerGroup = '.list tbody tr td:eq(0)';
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
  await visit('/learnergroups');
  assert.equal(getElementText(find(selectedProgram)), getText('program 0'));
  assert.equal(getElementText(find(firstListedLearnerGroup)),getText(firstLearnergroup.title));
  var options = find(programOptions);
  assert.equal(options.length, 3);
  assert.equal(getElementText(options.eq(0)), getText('Select a Program'));
  assert.equal(getElementText(options.eq(1)), getText('program 0'));
  assert.equal(getElementText(options.eq(2)), getText('program 1'));
  await pickOption(programSelectList, 'program 1', assert);
  assert.equal(getElementText(find(firstListedLearnerGroup)),getText(secondLearnergroup.title));
});

test('multiple program years filter', async function(assert) {
  const selectedProgramYear = '.programyearsfilter select option:selected';
  const programYearOptions = '.programyearsfilter select option';
  const programYearSelectList = '.programyearsfilter select';
  const firstListedLearnerGroup = '.list tbody tr td:eq(0)';
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
  await visit('/learnergroups');
  assert.equal(getElementText(find(selectedProgramYear)), getText('cohort 1'));
  assert.equal(getElementText(find(firstListedLearnerGroup)),getText(secondLearnergroup.title));
  var options = find(programYearOptions);
  assert.equal(options.length, 2);
  assert.equal(getElementText(options.eq(0)), getText('cohort 1'));
  assert.equal(getElementText(options.eq(1)), getText('cohort 0'));
  await pickOption(programYearSelectList, 'cohort 0', assert);
  assert.equal(getElementText(find(firstListedLearnerGroup)),getText(firstLearnergroup.title));
});

test('list groups', async function(assert) {
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

  await visit('/learnergroups');
  assert.equal(2, find('.list tbody tr').length);
  var rows = find('.list tbody tr');
  assert.equal(getElementText(find('td:eq(0)', rows.eq(0))),getText(firstLearnergroup.title));
  // Assertion below needs to be fixed (issue #1157)
  // assert.equal(getElementText(find('td:eq(1)', rows.eq(0))), 11);
  assert.equal(getElementText(find('td:eq(2)', rows.eq(0))), 2);

  assert.equal(getElementText(find('td:eq(0)', rows.eq(1))),getText(secondLearnergroup.title));
  assert.equal(getElementText(find('td:eq(1)', rows.eq(1))), 0);
  assert.equal(getElementText(find('td:eq(2)', rows.eq(1))), 0);
});

test('filters by title', async function(assert) {
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
  await visit('/learnergroups');
  assert.equal(find('.list tbody tr').length, 3);
  assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')),getText(regularLearnergroup.title));
  assert.equal(getElementText(find('.list tbody tr:eq(1) td:eq(0)')),getText(firstLearnergroup.title));
  assert.equal(getElementText(find('.list tbody tr:eq(2) td:eq(0)')),getText(secondLearnergroup.title));

  await fillIn('.titlefilter input', 'first');
  assert.equal(1, find('.list tbody tr').length);
  assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')),getText(firstLearnergroup.title));

  await fillIn('.titlefilter input', 'second');
  assert.equal(1, find('.list tbody tr').length);
  assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')),getText(secondLearnergroup.title));

  await fillIn('.titlefilter input', 'special');
  assert.equal(2, find('.list tbody tr').length);
  assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')),getText(firstLearnergroup.title));
  assert.equal(getElementText(find('.list tbody tr:eq(1) td:eq(0)')),getText(secondLearnergroup.title));

  await fillIn('.titlefilter input', '');
  assert.equal(3, find('.list tbody tr').length);
  assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')),getText(regularLearnergroup.title));
  assert.equal(getElementText(find('.list tbody tr:eq(1) td:eq(0)')),getText(firstLearnergroup.title));
  assert.equal(getElementText(find('.list tbody tr:eq(2) td:eq(0)')),getText(secondLearnergroup.title));
});

function getCellData(row, cell) {
  return find(`.list tbody tr:eq(${row}) td:eq(${cell})`).text().trim();
}

test('add new learnergroup', async function(assert) {
  assert.expect(3);

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

  let newTitle = 'A New Test Title';
  await visit(url);
  await click(expandButton);
  await fillIn(input, newTitle);
  await click(done);
  assert.equal(getCellData(0, 0), 'A New Test Title', 'title is correct');
  assert.equal(getCellData(0, 1), 0, 'member count is correct');
  assert.equal(getElementText(find('.saved-result')), getText(newTitle + 'Saved Successfully', 'Success message is shown.'));
});

test('cancel adding new learnergroup', async function(assert) {
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

  await visit(url);
  await click(expandButton);
  assert.ok(isPresent(find(collapseButton)), 'collapse button is visible');
  assert.ok(isPresent(find(component)), '`new-learnergroup` component is visible');

  await click(cancelButton);
  assert.ok(isPresent(find(expandButton)), 'expand button is visible');
  assert.ok(isEmpty(find(component)), '`new-learnergroup` component is not visible');
  assert.equal(getCellData(0, 0), 'learner group 0');

  await click(expandButton);
  await click(collapseButton);
  assert.ok(isPresent(find(expandButton)), 'expand button is visible');
  assert.ok(isEmpty(find(component)), '`new-learnergroup` component is not visible');
  assert.equal(getCellData(0, 0), 'learner group 0');
});

test('remove learnergroup', async function(assert) {
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
  await visit('/learnergroups');
  assert.equal(1, find('.list tbody tr').length);
  assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')),getText('learnergroup 0'));
  await click('.list tbody tr:eq(0) td:eq(3) .remove');
  await click('.list tbody tr:eq(1) .remove');
  assert.equal(0, find('.list tbody tr').length);
});

test('cancel remove learnergroup', async function(assert) {
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
  await visit('/learnergroups');
  assert.equal(1, find('.list tbody tr').length);
  assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')),getText('learnergroup 0'));
  await click('.list tbody tr:eq(0) td:eq(3) .remove');
  await click('.list tbody tr:eq(1) .done');
  assert.equal(1, find('.list tbody tr').length);
  assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')),getText('learnergroup 0'));
});

test('confirmation of remove message', async function(assert) {
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
    offerings: [1,2],
    children: [2,3]
  });
  server.createList('learnerGroup',2, {
    parent: 1
  });
  assert.expect(5);
  await visit('/learnergroups');
  assert.equal(1, find('.list tbody tr').length);
  assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')),getText('learnergroup 0'));
  await click('.list tbody tr:eq(0) td:eq(3) .remove');
  assert.ok(find('.list tbody tr:eq(0)').hasClass('confirm-removal'));
  assert.ok(find('.list tbody tr:eq(1)').hasClass('confirm-removal'));
  assert.equal(getElementText(find('.list tbody tr:eq(1)')), getText('Are you sure you want to delete this learner group, with 2 subgroups? This action cannot be undone. Yes Cancel'));
});

test('populated learner groups are not deletable', async function(assert) {
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
    users: [2, 3, 4],
    offerings: [1,2]
  });

  assert.expect(3);
  await visit('/learnergroups');
  assert.equal(1, find('.list tbody tr').length);
  assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')), getText('learnergroup 0'));
  assert.notOk(find('.list tbody tr:eq(0) td:eq(3) .remove').length, 'No delete action is available');
});

test('click title takes you to learnergroup route', async function(assert) {
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
  await visit('/learnergroups');
  await click('.list tbody tr:eq(0) td:eq(0) a');
  assert.equal(currentURL(), '/learnergroups/1');
});

test('add new learnergroup with full cohort', async function(assert) {
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

  await visit(url);
  await click(expandButton);
  await fillIn(input, 'A New Test Title');
  await click(addFullCohort);
  await click(done);
  assert.equal(getCellData(0, 0), 'A New Test Title', 'title is correct');
  assert.equal(getCellData(0, 1), 5, 'member count is correct');
});

test('no add button when there is no cohort', async function(assert) {
  server.create('user', {id: 4136});
  server.create('school');
  await visit('/learnergroups');
  const expandNewButton = '.actions .expand-button';

  assert.equal(currentPath(), 'learnerGroups');
  assert.equal(find(expandNewButton).length, 0);
});

test('title filter escapes regex', async function(assert) {
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
    title: 'yes\\no',
    cohort: 1,
  });

  const groups = '.list tbody tr';
  const firstGroupTitle = `${groups}:eq(0) td:eq(0)`;
  const filter = '.titlefilter input';
  await visit('/learnergroups');

  assert.equal(find(groups).length, 1);
  assert.equal(getElementText(firstGroupTitle), 'yes\\no');
  await fillIn(filter, '\\');
  assert.equal(find(groups).length, 1);
  assert.equal(getElementText(firstGroupTitle), 'yes\\no');
});
