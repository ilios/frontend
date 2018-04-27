import { click, fillIn, find, findAll, currentURL, currentRouteName, visit } from '@ember/test-helpers';
import { isPresent, isEmpty } from '@ember/utils';
import {
  module,
  test
} from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

const url = '/learnergroups';

import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { getElementText, getText } from 'ilios/tests/helpers/custom-helpers';

module('Acceptance: Learner Groups', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('User in single school with no special permissions', function (hooks) {
    hooks.beforeEach(async function () {
      this.school = this.server.create('school');
      this.user = await setupAuthentication({school: this.school});
    });
    test('visiting /learnergroups', async function (assert) {
      this.server.create('user', {id: 4136});
      this.server.create('school');
      await visit('/learnergroups');
      assert.equal(currentRouteName(), 'learnerGroups');
    });

    test('single option filters', async function (assert) {
      const schoolsFilter = '.schoolsfilter';
      const programsFilter = '.programsfilter';
      const programyearsfilter = '.programyearsfilter';
      assert.expect(3);

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
      assert.equal(await getElementText(find(schoolsFilter)), getText('school 0'));
      assert.equal(await getElementText(find(programsFilter)), getText('program 0'));
      assert.equal(await getElementText(find(programyearsfilter)), getText('cohort 0'));
    });

    test('multiple programs filter', async function (assert) {
      const selectedProgram = '.programsfilter select option:checked';
      const programOptions = '.programsfilter select option';
      const programSelectList = '.programsfilter select';
      const firstListedLearnerGroup = '.list tbody tr td:nth-of-type(1)';
      assert.expect(6);

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
      assert.equal(await getElementText(find(selectedProgram)), getText('program 0'));
      assert.equal(await getElementText(find(firstListedLearnerGroup)), getText(firstLearnergroup.title));
      var options = findAll(programOptions);
      assert.equal(options.length, 2);
      assert.equal(await getElementText(options[0]), getText('program 0'));
      assert.equal(await getElementText(options[1]), getText('program 1'));
      await fillIn(programSelectList, '2');
      assert.equal(await getElementText(find(firstListedLearnerGroup)), getText(secondLearnergroup.title));
    });

    test('multiple program years filter', async function (assert) {
      const selectedProgramYear = '.programyearsfilter select option:checked';
      const programYearOptions = '.programyearsfilter select option';
      const programYearSelectList = '.programyearsfilter select';
      const firstListedLearnerGroup = '.list tbody tr td:nth-of-type(1)';
      assert.expect(6);

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
      assert.equal(await getElementText(find(selectedProgramYear)), getText('cohort 1'));
      assert.equal(await getElementText(find(firstListedLearnerGroup)), getText(secondLearnergroup.title));
      var options = findAll(programYearOptions);
      assert.equal(options.length, 2);
      assert.equal(await getElementText(options[0]), getText('cohort 1'));
      assert.equal(await getElementText(options[1]), getText('cohort 0'));
      await fillIn(programYearSelectList, '1');
      assert.equal(await getElementText(find(firstListedLearnerGroup)), getText(firstLearnergroup.title));
    });

    test('list groups', async function (assert) {
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
        userIds: [7, 8],
      });
      this.server.create('learnerGroup', {
        parentId: 1,
        userIds: [9, 10]
      });
      this.server.create('learnerGroup', {
        parentId: 3,
        userIds: [11, 12]
      });
      this.server.createList('offering', 2, {
        learnerGroupIds: [1],
      });

      await visit('/learnergroups');
      const rows = '.list tbody tr';
      assert.equal(2, findAll(rows).length);
      assert.equal(await getElementText(`${rows}:nth-of-type(1) td:nth-of-type(1)`), getText(firstLearnergroup.title));
      assert.equal(await getElementText(`${rows}:nth-of-type(1) td:nth-of-type(2)`), 5);
      assert.equal(await getElementText(`${rows}:nth-of-type(1) td:nth-of-type(3)`), 2);

      assert.equal(await getElementText(`${rows}:nth-of-type(2) td:nth-of-type(1)`), getText(secondLearnergroup.title));
      assert.equal(await getElementText(`${rows}:nth-of-type(2) td:nth-of-type(2)`), 0);
      assert.equal(await getElementText(`${rows}:nth-of-type(2) td:nth-of-type(3)`), 0);
    });

    test('filters by title', async function (assert) {
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
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(1) td'))), getText(regularLearnergroup.title));
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(2) td'))), getText(firstLearnergroup.title));
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(3) td'))), getText(secondLearnergroup.title));

      await fillIn('.titlefilter input', 'first');
      assert.equal(1, findAll('.list tbody tr').length);
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(1) td'))), getText(firstLearnergroup.title));

      await fillIn('.titlefilter input', 'second');
      assert.equal(1, findAll('.list tbody tr').length);
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(1) td'))), getText(secondLearnergroup.title));

      await fillIn('.titlefilter input', 'special');
      assert.equal(2, findAll('.list tbody tr').length);
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(1) td'))), getText(firstLearnergroup.title));
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(2) td'))), getText(secondLearnergroup.title));

      await fillIn('.titlefilter input', '');
      assert.equal(3, findAll('.list tbody tr').length);
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(1) td'))), getText(regularLearnergroup.title));
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(2) td'))), getText(firstLearnergroup.title));
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(3) td'))), getText(secondLearnergroup.title));
    });

    function getCellData(row, cell) {
      return find(`.list tbody tr:nth-of-type(${row + 1}) td:nth-of-type(${cell + 1})`).textContent.trim();
    }

    test('add new learnergroup', async function (assert) {
      this.user.update({administeredSchools: [this.school]});
      assert.expect(3);

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
      assert.equal(await getElementText(find('.saved-result')), getText(newTitle + 'Saved Successfully', 'Success message is shown.'));
    });

    test('cancel adding new learnergroup', async function (assert) {
      this.user.update({administeredSchools: [this.school]});
      assert.expect(8);
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

    test('remove learnergroup', async function (assert) {
      this.user.update({administeredSchools: [this.school]});
      assert.expect(3);

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
        id: 1,
      });
      this.server.create('learnerGroup', {
        cohortId: 1,
        parentId: 1,
      });
      await visit('/learnergroups');
      assert.equal(1, findAll('.list tbody tr').length);
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(1) td'))), getText('learnergroup 0'));
      await click('.list tbody tr:nth-of-type(1) td:nth-of-type(4) .remove');
      await click('.list tbody tr:nth-of-type(2) .remove');
      assert.equal(0, findAll('.list tbody tr').length);
    });

    test('cancel remove learnergroup', async function (assert) {
      this.user.update({administeredSchools: [this.school]});
      assert.expect(4);

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
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(1) td'))), getText('learnergroup 0'));
      await click('.list tbody tr:nth-of-type(1) td:nth-of-type(4) .remove');
      await click('.list tbody tr:nth-of-type(2) .done');
      assert.equal(1, findAll('.list tbody tr').length);
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(1) td'))), getText('learnergroup 0'));
    });

    test('confirmation of remove message', async function (assert) {
      this.user.update({administeredSchools: [this.school]});

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
      this.server.createList('learnerGroup', 2, {
        parentId: 1
      });
      this.server.createList('offering', 2, {learnerGroupIds: [1]});
      assert.expect(5);
      await visit('/learnergroups');
      assert.equal(1, findAll('.list tbody tr').length);
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(1) td'))), getText('learnergroup 0'));
      await click('.list tbody tr:nth-of-type(1) td:nth-of-type(4) .remove');
      assert.ok(find('.list tbody tr').classList.contains('confirm-removal'));
      assert.ok(find(findAll('.list tbody tr')[1]).classList.contains('confirm-removal'));
      assert.equal(await getElementText(find(findAll('.list tbody tr')[1])), getText('Are you sure you want to delete this learner group, with 2 subgroups? This action cannot be undone. Yes Cancel'));
    });

    test('populated learner groups are not deletable', async function (assert) {
      this.user.update({administeredSchools: [this.school]});

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
      this.server.createList('offering', 2, {learnerGroupIds: [1]});

      assert.expect(3);
      await visit('/learnergroups');
      assert.equal(1, findAll('.list tbody tr').length);
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(1) td'))), getText('learnergroup 0'));
      assert.notOk(findAll('.list tbody tr:nth-of-type(1) td:nth-of-type(4) .remove').length, 'No delete action is available');
    });

    test('click title takes you to learnergroup route', async function (assert) {
      assert.expect(1);

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
      await click('.list tbody tr:nth-of-type(1) td:nth-of-type(1) a');
      assert.equal(currentURL(), '/learnergroups/1');
    });

    test('add new learnergroup with full cohort', async function (assert) {
      assert.expect(2);

      this.user.update({administeredSchools: [this.school]});
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
      const addFullCohort = '.new-learnergroup .clickable:nth-of-type(1)';
      const done = '.new-learnergroup .done';

      await visit(url);
      await click(expandButton);
      await fillIn(input, 'A New Test Title');
      await click(addFullCohort);
      await click(done);
      assert.equal(getCellData(0, 0), 'A New Test Title', 'title is correct');
      assert.equal(getCellData(0, 1), 5, 'member count is correct');
    });

    test('no add button when there is no cohort', async function (assert) {
      this.user.update({administeredSchools: [this.school]});

      await visit('/learnergroups');
      const expandNewButton = '.actions .expand-button';

      assert.equal(currentRouteName(), 'learnerGroups');
      assert.equal(findAll(expandNewButton).length, 0);
    });

    test('title filter escapes regex', async function (assert) {
      assert.expect(5);

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
      const firstGroupTitle = `${groups}:nth-of-type(1) td:nth-of-type(1)`;
      const filter = '.titlefilter input';
      await visit('/learnergroups');

      assert.equal(findAll(groups).length, 1);
      assert.equal(await getElementText(firstGroupTitle), 'yes\\no');
      await fillIn(filter, '\\');
      assert.equal(findAll(groups).length, 1);
      assert.equal(await getElementText(firstGroupTitle), 'yes\\no');
      assert.equal(find(filter).value, '\\');
    });

    test('copy learnergroup without learners', async function (assert) {
      this.user.update({administeredSchools: [this.school]});
      assert.expect(20);

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
      const firstGroup = `${groups}:nth-of-type(1)`;
      const firstTitle = `${firstGroup} td:nth-of-type(1)`;
      const firstLink = `${firstTitle} a`;
      const firstMembers = `${firstGroup} td:nth-of-type(2)`;
      const firstSubgroups = `${firstGroup} td:nth-of-type(3)`;
      const firstGroupCopy = `${firstGroup} td:nth-of-type(4) .fa-copy`;
      const firstGroupCopyNoLearners = '.list tbody tr:nth-of-type(2) .done:nth-of-type(2)';
      const secondGroup = `${groups}:nth-of-type(2)`;
      const secondTitle = `${secondGroup} td:nth-of-type(1)`;
      const secondLink = `${secondTitle} a`;
      const secondMembers = `${secondGroup} td:nth-of-type(2)`;
      const secondSubgroups = `${secondGroup} td:nth-of-type(3)`;

      const subGroupList = '.learnergroup-subgroup-list-list tbody tr';
      const firstSubgroup = `${subGroupList}:nth-of-type(1)`;
      const firstSubgroupTitle = `${firstSubgroup} td:nth-of-type(1)`;
      const firstSubgroupMembers = `${firstSubgroup} td:nth-of-type(2)`;
      const firstSubgroupSubgroups = `${firstSubgroup} td:nth-of-type(3)`;
      const secondSubgroup = `${subGroupList}:nth-of-type(2)`;
      const secondSubgroupTitle = `${secondSubgroup} td:nth-of-type(1)`;
      const secondSubgroupMembers = `${secondSubgroup} td:nth-of-type(2)`;
      const secondSubgroupSubgroups = `${secondSubgroup} td:nth-of-type(3)`;


      await visit('/learnergroups');
      assert.equal(1, findAll(groups).length);
      assert.equal(await getElementText(find(firstTitle)), getText('learnergroup 0'));
      assert.equal(await getElementText(find(firstMembers)), getText('0'));
      assert.equal(await getElementText(find(firstSubgroups)), getText('2'));
      await click(firstGroupCopy);
      await click(firstGroupCopyNoLearners);
      assert.equal(2, findAll(groups).length);
      assert.equal(await getElementText(find(firstTitle)), getText('learnergroup 0'));
      assert.equal(await getElementText(find(firstMembers)), getText('0'));
      assert.equal(await getElementText(find(firstSubgroups)), getText('2'));
      assert.equal(await getElementText(find(secondTitle)), getText('learnergroup 0 (Copy)'));
      assert.equal(await getElementText(find(secondMembers)), getText('0'));
      assert.equal(await getElementText(find(secondSubgroups)), getText('2'));
      await click(firstLink);
      assert.equal(currentURL(), '/learnergroups/1');
      await visit('/learnergroups');
      await click(secondLink);
      assert.equal(currentURL(), '/learnergroups/5');

      assert.equal(2, findAll(subGroupList).length);

      assert.equal(await getElementText(find(firstSubgroupTitle)), getText('learnergroup 1'));
      assert.equal(await getElementText(find(firstSubgroupMembers)), getText('0'));
      assert.equal(await getElementText(find(firstSubgroupSubgroups)), getText('1'));
      assert.equal(await getElementText(find(secondSubgroupTitle)), getText('learnergroup 2'));
      assert.equal(await getElementText(find(secondSubgroupMembers)), getText('0'));
      assert.equal(await getElementText(find(secondSubgroupSubgroups)), getText('0'));
    });

    test('copy learnergroup with learners', async function (assert) {
      this.user.update({administeredSchools: [this.school]});
      assert.expect(20);

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
      const firstGroup = `${groups}:nth-of-type(1)`;
      const firstTitle = `${firstGroup} td:nth-of-type(1)`;
      const firstLink = `${firstTitle} a`;
      const firstMembers = `${firstGroup} td:nth-of-type(2)`;
      const firstSubgroups = `${firstGroup} td:nth-of-type(3)`;
      const firstGroupCopy = `${firstGroup} td:nth-of-type(4) .fa-copy`;
      const firstGroupCopyWithLearners = '.list tbody tr:nth-of-type(2) .done:nth-of-type(1)';
      const secondGroup = `${groups}:nth-of-type(2)`;
      const secondTitle = `${secondGroup} td:nth-of-type(1)`;
      const secondLink = `${secondTitle} a`;
      const secondMembers = `${secondGroup} td:nth-of-type(2)`;
      const secondSubgroups = `${secondGroup} td:nth-of-type(3)`;

      const subGroupList = '.learnergroup-subgroup-list-list tbody tr';
      const firstSubgroup = `${subGroupList}:nth-of-type(1)`;
      const firstSubgroupTitle = `${firstSubgroup} td:nth-of-type(1)`;
      const firstSubgroupMembers = `${firstSubgroup} td:nth-of-type(2)`;
      const firstSubgroupSubgroups = `${firstSubgroup} td:nth-of-type(3)`;
      const secondSubgroup = `${subGroupList}:nth-of-type(2)`;
      const secondSubgroupTitle = `${secondSubgroup} td:nth-of-type(1)`;
      const secondSubgroupMembers = `${secondSubgroup} td:nth-of-type(2)`;
      const secondSubgroupSubgroups = `${secondSubgroup} td:nth-of-type(3)`;

      await visit('/learnergroups');
      assert.equal(1, findAll(groups).length);
      assert.equal(await getElementText(find(firstTitle)), getText('learnergroup 0'));
      assert.equal(await getElementText(find(firstMembers)), getText('7'));
      assert.equal(await getElementText(find(firstSubgroups)), getText('2'));
      await click(firstGroupCopy);
      await click(firstGroupCopyWithLearners);
      assert.equal(2, findAll(groups).length);
      assert.equal(await getElementText(find(firstTitle)), getText('learnergroup 0'));
      assert.equal(await getElementText(find(firstMembers)), getText('7'));
      assert.equal(await getElementText(find(firstSubgroups)), getText('2'));
      assert.equal(await getElementText(find(secondTitle)), getText('learnergroup 0 (Copy)'));
      assert.equal(await getElementText(find(secondMembers)), getText('7'));
      assert.equal(await getElementText(find(secondSubgroups)), getText('2'));
      await click(firstLink);
      assert.equal(currentURL(), '/learnergroups/1');
      await visit('/learnergroups');
      await click(secondLink);
      assert.equal(currentURL(), '/learnergroups/5');

      assert.equal(2, findAll(subGroupList).length);

      assert.equal(await getElementText(find(firstSubgroupTitle)), getText('learnergroup 1'));
      assert.equal(await getElementText(find(firstSubgroupMembers)), getText('1'));
      assert.equal(await getElementText(find(firstSubgroupSubgroups)), getText('1'));
      assert.equal(await getElementText(find(secondSubgroupTitle)), getText('learnergroup 2'));
      assert.equal(await getElementText(find(secondSubgroupMembers)), getText('3'));
      assert.equal(await getElementText(find(secondSubgroupSubgroups)), getText('0'));
    });
  });
});

