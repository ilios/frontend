import { click, fillIn, find, findAll, currentURL, currentPath, visit } from '@ember/test-helpers';
import { isPresent, isEmpty } from '@ember/utils';
import destroyApp from '../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;
const url = '/learnergroups';

module('Acceptance: Learner Groups', function(hooks) {
  hooks.beforeEach(function() {
    application = startApp();
    setupAuthentication(application, false);
  });

  hooks.afterEach(function() {
    destroyApp(application);
  });

  test('visiting /learnergroups', async function(assert) {
    this.server.create('user', {id: 4136});
    this.server.create('school');
    await visit('/learnergroups');
    assert.equal(currentPath(), 'learnerGroups');
  });

  test('single option filters', async function(assert) {
    const schoolsFilter = '.schoolsfilter';
    const programsFilter = '.programsfilter';
    const programyearsfilter = '.programyearsfilter';
    assert.expect(3);
    this.server.create('school');
    this.server.create('user', {id: 4136, schoolId: 1});
    this.server.create('program', {
      schoolId: 1,
    });
    this.server.create('programYear', {
      programId: 1,
    });
    this.server.create('cohort', {
      programYearId: 1,
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
    this.server.create('permission', {
      tableName: 'school',
      tableRowId: 2,
      canRead: true
    });
    this.server.createList('school', 2);
    this.server.create('user', {id: 4136, permissionIds: [1], schoolId: 1});
    this.server.create('program', {
      schoolId: 1,
    });
    this.server.create('program', {
      schoolId: 1,
    });
    this.server.create('programYear', {
      programId: 1,
    });
    this.server.create('programYear', {
      programId: 1,
    });
    this.server.create('cohort', {
      programYearId: 1,
    });
    this.server.create('cohort', {
      programYearId: 2,
    });
    await visit('/learnergroups');
    assert.equal(findAll(schoolsFilter).length, 2);
    assert.equal(getElementText(find(schoolsFilter)), getText('school 0 school 1'));
    assert.equal(find(schoolSelect).value, '1', 'default school is selected');
    assert.equal(findAll(programsFilter).length, 2);
    assert.equal(getElementText(find(programsFilter)), getText('program 0 program 1'));
    assert.equal(findAll(programyearsfilter).length, 2);
    assert.equal(getElementText(find(programyearsfilter)), getText('cohort 1 cohort 0'));
  });

  test('primary school is selected by default', async function(assert) {
    const schoolsFilter = '.schoolsfilter option:selected';
    assert.expect(1);
    this.server.createList('school', 2);
    this.server.create('permission', {
      tableName: 'school',
      tableRowId: 1,
      canRead: true
    });
    this.server.create('user', {id: 4136, permissionIds: [1], schoolId: 2});
    await visit('/learnergroups');
    assert.equal(getElementText(find(schoolsFilter)), getText('school 1'));
  });

  test('multi-option filters', async function(assert) {
    const schoolsFilter = '.schoolsfilter option';
    const programsFilter = '.programsfilter option';
    const programyearsfilter = '.programyearsfilter option';
    assert.expect(6);
    this.server.create('permission', {
      tableName: 'school',
      tableRowId: 2,
      canRead: true
    });
    this.server.createList('school', 2);
    this.server.create('user', {id: 4136, permissionIds: [1], schoolId: 1});
    this.server.create('program', {
      schoolId: 1,
    });
    this.server.create('program', {
      schoolId: 1,
    });
    this.server.create('programYear', {
      programId: 1,
    });
    this.server.create('programYear', {
      programId: 1,
    });
    this.server.create('cohort', {
      programYearId: 1,
    });
    this.server.create('cohort', {
      programYearId: 2,
    });
    await visit('/learnergroups');
    assert.equal(findAll(schoolsFilter).length, 2);
    assert.equal(getElementText(find(schoolsFilter)), getText('school 0 school 1'));
    assert.equal(findAll(programsFilter).length, 2);
    assert.equal(getElementText(find(programsFilter)), getText('program 0 program 1'));
    assert.equal(findAll(programyearsfilter).length, 2);
    assert.equal(getElementText(find(programyearsfilter)), getText('cohort 1 cohort 0'));
  });

  test('multiple programs filter', async function(assert) {
    const selectedProgram = '.programsfilter select option:selected';
    const programOptions = '.programsfilter select option';
    const programSelectList = '.programsfilter select';
    const firstListedLearnerGroup = '.list tbody tr td:eq(0)';
    assert.expect(7);
    this.server.create('school');
    this.server.create('user', {id: 4136, schoolId: 1});
    this.server.create('program', {
      schoolId: 1,
    });
    this.server.create('programYear', {
      programId: 1,
    });
    this.server.create('cohort', {
      programYearId: 1,
    });
    this.server.create('program', {
      schoolId: 1,
    });
    this.server.create('programYear', {
      programId: 2,
    });
    this.server.create('cohort', {
      programYearId: 2,
    });
    var firstLearnergroup = this.server.create('learnerGroup', {
      cohortId: 1
    });
    var secondLearnergroup = this.server.create('learnerGroup', {
      cohortId: 2
    });
    await visit('/learnergroups');
    assert.equal(getElementText(find(selectedProgram)), getText('program 0'));
    assert.equal(getElementText(find(firstListedLearnerGroup)),getText(firstLearnergroup.title));
    var options = find(programOptions);
    assert.equal(options.length, 2);
    assert.equal(getElementText(options.eq(0)), getText('program 0'));
    assert.equal(getElementText(options.eq(1)), getText('program 1'));
    await pickOption(programSelectList, 'program 1', assert);
    assert.equal(getElementText(find(firstListedLearnerGroup)),getText(secondLearnergroup.title));
  });

  test('multiple program years filter', async function(assert) {
    const selectedProgramYear = '.programyearsfilter select option:selected';
    const programYearOptions = '.programyearsfilter select option';
    const programYearSelectList = '.programyearsfilter select';
    const firstListedLearnerGroup = '.list tbody tr td:eq(0)';
    assert.expect(7);
    this.server.create('school');
    this.server.create('user', {id: 4136, schoolId: 1});
    this.server.create('program', {
      schoolId: 1,
    });
    this.server.create('programYear', {
      programId: 1,
    });
    this.server.create('cohort', {
      programYearId: 1,
    });
    this.server.create('programYear', {
      programId: 1,
    });
    this.server.create('cohort', {
      programYearId: 2,
    });
    var firstLearnergroup = this.server.create('learnerGroup', {
      cohortId: 1
    });
    var secondLearnergroup = this.server.create('learnerGroup', {
      cohortId: 2
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
    this.server.create('school');
    this.server.create('user', {id: 4136, schoolId: 1});
    this.server.createList('user', 11);
    this.server.create('program', {
      schoolId: 1,
    });
    this.server.create('programYear', {
      programId: 1,
    });
    this.server.create('cohort', {
      programYearId: 1,
    });
    let firstLearnergroup = this.server.create('learnerGroup', {
      cohortId: 1,
      userIds: [2, 3, 4, 5, 6],
    });
    let secondLearnergroup = this.server.create('learnerGroup', {
      cohortId: 1,
    });
    this.server.create('learnerGroup', {
      parentId: 1,
      userIds: [7,8],
    });
    this.server.create('learnerGroup', {
      parentId: 1,
      userIds: [9,10]
    });
    this.server.create('learnerGroup', {
      parentId: 3,
      userIds: [11,12]
    });
    this.server.createList('offering', 2, {
      learnerGroupIds: [1],
    });

    await visit('/learnergroups');
    assert.equal(2, findAll('.list tbody tr').length);
    var rows = find('.list tbody tr');
    assert.equal(getElementText(find(find('td'), rows.eq(0))),getText(firstLearnergroup.title));
    // Assertion below needs to be fixed (issue #1157)
    // assert.equal(getElementText(find('td:eq(1)', rows.eq(0))), 11);
    assert.equal(getElementText(find(findAll('td')[2], rows.eq(0))), 2);

    assert.equal(getElementText(find(find('td'), rows.eq(1))),getText(secondLearnergroup.title));
    assert.equal(getElementText(find(findAll('td')[1], rows.eq(1))), 0);
    assert.equal(getElementText(find(findAll('td')[2], rows.eq(1))), 0);
  });

  test('filters by title', async function(assert) {
    this.server.create('school');
    this.server.create('user', {id: 4136, schoolId: 1});
    this.server.create('program', {
      schoolId: 1,
    });
    this.server.create('programYear', {
      programId: 1,
    });
    this.server.create('cohort', {
      programYearId: 1,
    });
    var firstLearnergroup = this.server.create('learnerGroup', {
      title: 'specialfirstlearnergroup',
      cohortId: 1,
    });
    var secondLearnergroup = this.server.create('learnerGroup', {
      title: 'specialsecondlearnergroup',
      cohortId: 1,
    });
    var regularLearnergroup = this.server.create('learnerGroup', {
      title: 'regularlearnergroup',
      cohortId: 1,
    });
    assert.expect(15);
    await visit('/learnergroups');
    assert.equal(findAll('.list tbody tr').length, 3);
    assert.equal(getElementText(find(find('.list tbody tr:eq(0) td'))),getText(regularLearnergroup.title));
    assert.equal(getElementText(find(find('.list tbody tr:eq(1) td'))),getText(firstLearnergroup.title));
    assert.equal(getElementText(find(find('.list tbody tr:eq(2) td'))),getText(secondLearnergroup.title));

    await fillIn('.titlefilter input', 'first');
    assert.equal(1, findAll('.list tbody tr').length);
    assert.equal(getElementText(find(find('.list tbody tr:eq(0) td'))),getText(firstLearnergroup.title));

    await fillIn('.titlefilter input', 'second');
    assert.equal(1, findAll('.list tbody tr').length);
    assert.equal(getElementText(find(find('.list tbody tr:eq(0) td'))),getText(secondLearnergroup.title));

    await fillIn('.titlefilter input', 'special');
    assert.equal(2, findAll('.list tbody tr').length);
    assert.equal(getElementText(find(find('.list tbody tr:eq(0) td'))),getText(firstLearnergroup.title));
    assert.equal(getElementText(find(find('.list tbody tr:eq(1) td'))),getText(secondLearnergroup.title));

    await fillIn('.titlefilter input', '');
    assert.equal(3, findAll('.list tbody tr').length);
    assert.equal(getElementText(find(find('.list tbody tr:eq(0) td'))),getText(regularLearnergroup.title));
    assert.equal(getElementText(find(find('.list tbody tr:eq(1) td'))),getText(firstLearnergroup.title));
    assert.equal(getElementText(find(find('.list tbody tr:eq(2) td'))),getText(secondLearnergroup.title));
  });

  function getCellData(row, cell) {
    return find(`.list tbody tr:eq(${row}) td:eq(${cell})`).textContent.trim();
  }

  test('add new learnergroup', async function(assert) {
    assert.expect(3);

    this.server.create('school');
    this.server.create('user', {id: 4136, schoolId: 1});
    this.server.create('program', {
      schoolId: 1,
    });
    this.server.create('programYear', {
      programId: 1,
    });
    this.server.create('cohort', {
      programYearId: 1
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

    this.server.create('school');
    this.server.create('user', {id: 4136, schoolId: 1});
    this.server.create('program', {
      schoolId: 1,
    });
    this.server.create('programYear', {
      programId: 1,
    });
    this.server.create('cohort', {
      programYearId: 1,
    });
    this.server.create('learnerGroup', {
      cohortId: 1
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
    this.server.create('school');
    this.server.create('user', {id: 4136, schoolId: 1});
    this.server.create('program', {
      schoolId: 1,
    });
    this.server.create('programYear', {
      programId: 1,
    });
    this.server.create('cohort', {
      programYearId: 1,
    });
    this.server.create('learnerGroup', {
      cohortId: 1
    });
    await visit('/learnergroups');
    assert.equal(1, findAll('.list tbody tr').length);
    assert.equal(getElementText(find(find('.list tbody tr:eq(0) td'))),getText('learnergroup 0'));
    await click('.list tbody tr:eq(0) td:eq(3) .remove');
    await click('.list tbody tr:eq(1) .remove');
    assert.equal(0, findAll('.list tbody tr').length);
  });

  test('cancel remove learnergroup', async function(assert) {
    assert.expect(4);
    this.server.create('school');
    this.server.create('user', {id: 4136, schoolId: 1});
    this.server.create('program', {
      schoolId: 1,
    });
    this.server.create('programYear', {
      programId: 1,
    });
    this.server.create('cohort', {
      programYearId: 1,
    });
    this.server.create('learnerGroup', {
      cohortId: 1
    });
    await visit('/learnergroups');
    assert.equal(1, findAll('.list tbody tr').length);
    assert.equal(getElementText(find(find('.list tbody tr:eq(0) td'))),getText('learnergroup 0'));
    await click('.list tbody tr:eq(0) td:eq(3) .remove');
    await click('.list tbody tr:eq(1) .done');
    assert.equal(1, findAll('.list tbody tr').length);
    assert.equal(getElementText(find(find('.list tbody tr:eq(0) td'))),getText('learnergroup 0'));
  });

  test('confirmation of remove message', async function(assert) {
    this.server.create('school');
    this.server.create('user', {id: 4136, schoolId: 1});
    this.server.createList('user', 5);
    this.server.create('program', {
      schoolId: 1,
    });
    this.server.create('programYear', {
      programId: 1,
    });
    this.server.create('cohort', {
      programYearId: 1,
    });
    this.server.create('learnerGroup', {
      cohortId: 1,
    });
    this.server.createList('learnerGroup',2, {
      parentId: 1
    });
    this.server.createList('offering', 2, { learnerGroupIds: [1] });
    assert.expect(5);
    await visit('/learnergroups');
    assert.equal(1, findAll('.list tbody tr').length);
    assert.equal(getElementText(find(find('.list tbody tr:eq(0) td'))),getText('learnergroup 0'));
    await click('.list tbody tr:eq(0) td:eq(3) .remove');
    assert.ok(find('.list tbody tr').classList.contains('confirm-removal'));
    assert.ok(find(findAll('.list tbody tr')[1]).classList.contains('confirm-removal'));
    assert.equal(getElementText(find(findAll('.list tbody tr')[1])), getText('Are you sure you want to delete this learner group, with 2 subgroups? This action cannot be undone. Yes Cancel'));
  });

  test('populated learner groups are not deletable', async function(assert) {
    this.server.create('school');
    this.server.create('user', {id: 4136, schoolId: 1});
    this.server.createList('user', 5);
    this.server.create('program', {
      schoolId: 1,
    });
    this.server.create('programYear', {
      programId: 1,
    });
    this.server.create('cohort', {
      programYearId: 1,
    });
    this.server.create('learnerGroup', {
      cohortId: 1,
      userIds: [2, 3, 4],
    });
    this.server.createList('offering', 2, { learnerGroupIds: [1] });

    assert.expect(3);
    await visit('/learnergroups');
    assert.equal(1, findAll('.list tbody tr').length);
    assert.equal(getElementText(find(find('.list tbody tr:eq(0) td'))), getText('learnergroup 0'));
    assert.notOk(findAll('.list tbody tr:eq(0) td:eq(3) .remove').length, 'No delete action is available');
  });

  test('click title takes you to learnergroup route', async function(assert) {
    assert.expect(1);
    this.server.create('school');
    this.server.create('user', {id: 4136, schoolId: 1});
    this.server.create('program', {
      schoolId: 1,
    });
    this.server.create('programYear', {
      programId: 1,
    });
    this.server.create('cohort', {
      programYearId: 1,
    });
    this.server.create('learnerGroup', {
      cohortId: 1,
    });
    await visit('/learnergroups');
    await click('.list tbody tr:eq(0) td:eq(0) a');
    assert.equal(currentURL(), '/learnergroups/1');
  });

  test('add new learnergroup with full cohort', async function(assert) {
    assert.expect(2);

    this.server.create('school');
    this.server.create('user', {id: 4136, schoolId: 1});
    this.server.create('program', {
      schoolId: 1,
    });
    this.server.create('programYear', {
      programId: 1,
    });
    this.server.create('cohort', {
      programYearId: 1,
    });
    this.server.createList('user', 5, {
      cohortIds: [1]
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
    this.server.create('school');
    this.server.create('user', {id: 4136, schoolId: 1});
    await visit('/learnergroups');
    const expandNewButton = '.actions .expand-button';

    assert.equal(currentPath(), 'learnerGroups');
    assert.equal(findAll(expandNewButton).length, 0);
  });

  test('title filter escapes regex', async function(assert) {
    assert.expect(5);
    this.server.create('school');
    this.server.create('user', {id: 4136, schoolId: 1});
    this.server.create('program', {
      schoolId: 1,
    });
    this.server.create('programYear', {
      programId: 1,
    });
    this.server.create('cohort', {
      programYearId: 1,
    });
    this.server.create('learnerGroup', {
      title: 'yes\\no',
      cohortId: 1
    });

    const groups = '.list tbody tr';
    const firstGroupTitle = `${groups}:eq(0) td:eq(0)`;
    const filter = '.titlefilter input';
    await visit('/learnergroups');

    assert.equal(findAll(groups).length, 1);
    assert.equal(getElementText(firstGroupTitle), 'yes\\no');
    await fillIn(filter, '\\');
    assert.equal(findAll(groups).length, 1);
    assert.equal(getElementText(firstGroupTitle), 'yes\\no');
    assert.equal(find(filter).value, '\\');
  });

  test('copy learnergroup without learners', async function(assert) {
    assert.expect(20);
    this.server.create('school');
    this.server.create('user', {id: 4136, schoolId: 1});
    this.server.create('program', {
      schoolId: 1,
    });
    this.server.create('programYear', {
      programId: 1,
    });
    this.server.create('cohort', {
      programYearId: 1,
    });
    this.server.create('learnerGroup', {
      cohortId: 1,
    });
    this.server.create('learnerGroup', {
      cohortId: 1,
      parentId: 1,
    });
    this.server.create('learnerGroup', {
      cohortId: 1,
      parentId: 1,
    });
    this.server.create('learnerGroup', {
      cohortId: 1,
      parentId: 2,
    });
    const groups = '.list tbody tr';
    const firstGroup = `${groups}:eq(0)`;
    const firstTitle = `${firstGroup} td:eq(0)`;
    const firstLink = `${firstTitle} a`;
    const firstMembers = `${firstGroup} td:eq(1)`;
    const firstSubgroups = `${firstGroup} td:eq(2)`;
    const firstGroupCopy = `${firstGroup} td:eq(3) .fa-copy`;
    const firstGroupCopyNoLearners = '.list tbody tr:eq(1) .done:eq(1)';
    const secondGroup = `${groups}:eq(1)`;
    const secondTitle = `${secondGroup} td:eq(0)`;
    const secondLink = `${secondTitle} a`;
    const secondMembers = `${secondGroup} td:eq(1)`;
    const secondSubgroups = `${secondGroup} td:eq(2)`;

    const subGroupList = '.learnergroup-subgroup-list-list tbody tr';
    const firstSubgroup = `${subGroupList}:eq(0)`;
    const firstSubgroupTitle = `${firstSubgroup} td:eq(0)`;
    const firstSubgroupMembers = `${firstSubgroup} td:eq(1)`;
    const firstSubgroupSubgroups = `${firstSubgroup} td:eq(2)`;
    const secondSubgroup = `${subGroupList}:eq(1)`;
    const secondSubgroupTitle = `${secondSubgroup} td:eq(0)`;
    const secondSubgroupMembers = `${secondSubgroup} td:eq(1)`;
    const secondSubgroupSubgroups = `${secondSubgroup} td:eq(2)`;


    await visit('/learnergroups');
    assert.equal(1, findAll(groups).length);
    assert.equal(getElementText(find(firstTitle)), getText('learnergroup 0'));
    assert.equal(getElementText(find(firstMembers)), getText('0'));
    assert.equal(getElementText(find(firstSubgroups)), getText('2'));
    await click(firstGroupCopy);
    await click(firstGroupCopyNoLearners);
    assert.equal(2, findAll(groups).length);
    assert.equal(getElementText(find(firstTitle)), getText('learnergroup 0'));
    assert.equal(getElementText(find(firstMembers)), getText('0'));
    assert.equal(getElementText(find(firstSubgroups)), getText('2'));
    assert.equal(getElementText(find(secondTitle)), getText('learnergroup 0 (Copy)'));
    assert.equal(getElementText(find(secondMembers)), getText('0'));
    assert.equal(getElementText(find(secondSubgroups)), getText('2'));
    await click(firstLink);
    assert.equal(currentURL(), '/learnergroups/1');
    await visit('/learnergroups');
    await click(secondLink);
    assert.equal(currentURL(), '/learnergroups/5');

    assert.equal(2, findAll(subGroupList).length);

    assert.equal(getElementText(find(firstSubgroupTitle)), getText('learnergroup 1'));
    assert.equal(getElementText(find(firstSubgroupMembers)), getText('0'));
    assert.equal(getElementText(find(firstSubgroupSubgroups)), getText('1'));
    assert.equal(getElementText(find(secondSubgroupTitle)), getText('learnergroup 2'));
    assert.equal(getElementText(find(secondSubgroupMembers)), getText('0'));
    assert.equal(getElementText(find(secondSubgroupSubgroups)), getText('0'));
  });

  test('copy learnergroup with learners', async function(assert) {
    assert.expect(20);
    this.server.create('school');
    this.server.create('user', {id: 4136, schoolId: 1});
    this.server.createList('user', 10);
    this.server.create('program', {
      schoolId: 1,
    });
    this.server.create('programYear', {
      programId: 1,
    });
    this.server.create('cohort', {
      programYearId: 1,
    });
    this.server.create('learnerGroup', {
      cohortId: 1,
      userIds: [2, 3, 4, 5, 6, 7, 8]
    });
    this.server.create('learnerGroup', {
      cohortId: 1,
      parentId: 1,
      userIds: [8]
    });
    this.server.create('learnerGroup', {
      cohortId: 1,
      parentId: 1,
      userIds: [5, 6, 7]
    });
    this.server.create('learnerGroup', {
      cohortId: 1,
      parentId: 2,
      userIds: [8]
    });


    const groups = '.list tbody tr';
    const firstGroup = `${groups}:eq(0)`;
    const firstTitle = `${firstGroup} td:eq(0)`;
    const firstLink = `${firstTitle} a`;
    const firstMembers = `${firstGroup} td:eq(1)`;
    const firstSubgroups = `${firstGroup} td:eq(2)`;
    const firstGroupCopy = `${firstGroup} td:eq(3) .fa-copy`;
    const firstGroupCopyWithLearners = '.list tbody tr:eq(1) .done:eq(0)';
    const secondGroup = `${groups}:eq(1)`;
    const secondTitle = `${secondGroup} td:eq(0)`;
    const secondLink = `${secondTitle} a`;
    const secondMembers = `${secondGroup} td:eq(1)`;
    const secondSubgroups = `${secondGroup} td:eq(2)`;

    const subGroupList = '.learnergroup-subgroup-list-list tbody tr';
    const firstSubgroup = `${subGroupList}:eq(0)`;
    const firstSubgroupTitle = `${firstSubgroup} td:eq(0)`;
    const firstSubgroupMembers = `${firstSubgroup} td:eq(1)`;
    const firstSubgroupSubgroups = `${firstSubgroup} td:eq(2)`;
    const secondSubgroup = `${subGroupList}:eq(1)`;
    const secondSubgroupTitle = `${secondSubgroup} td:eq(0)`;
    const secondSubgroupMembers = `${secondSubgroup} td:eq(1)`;
    const secondSubgroupSubgroups = `${secondSubgroup} td:eq(2)`;

    await visit('/learnergroups');
    assert.equal(1, findAll(groups).length);
    assert.equal(getElementText(find(firstTitle)), getText('learnergroup 0'));
    assert.equal(getElementText(find(firstMembers)), getText('7'));
    assert.equal(getElementText(find(firstSubgroups)), getText('2'));
    await click(firstGroupCopy);
    await click(firstGroupCopyWithLearners);
    assert.equal(2, findAll(groups).length);
    assert.equal(getElementText(find(firstTitle)), getText('learnergroup 0'));
    assert.equal(getElementText(find(firstMembers)), getText('7'));
    assert.equal(getElementText(find(firstSubgroups)), getText('2'));
    assert.equal(getElementText(find(secondTitle)), getText('learnergroup 0 (Copy)'));
    assert.equal(getElementText(find(secondMembers)), getText('7'));
    assert.equal(getElementText(find(secondSubgroups)), getText('2'));
    await click(firstLink);
    assert.equal(currentURL(), '/learnergroups/1');
    await visit('/learnergroups');
    await click(secondLink);
    assert.equal(currentURL(), '/learnergroups/5');

    assert.equal(2, findAll(subGroupList).length);

    assert.equal(getElementText(find(firstSubgroupTitle)), getText('learnergroup 1'));
    assert.equal(getElementText(find(firstSubgroupMembers)), getText('1'));
    assert.equal(getElementText(find(firstSubgroupSubgroups)), getText('1'));
    assert.equal(getElementText(find(secondSubgroupTitle)), getText('learnergroup 2'));
    assert.equal(getElementText(find(secondSubgroupMembers)), getText('3'));
    assert.equal(getElementText(find(secondSubgroupSubgroups)), getText('0'));
  });
});
