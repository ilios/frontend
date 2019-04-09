import {
  click,
  fillIn,
  findAll,
  currentURL,
  find,
  visit
} from '@ember/test-helpers';
import { test, module } from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import moment from 'moment';

import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { getElementText, getText } from 'ilios-common';
import page from '../pages/learner-group';

module('Acceptance | Learnergroup', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
    this.program = this.server.create('program', { school: this.school });
  });

  test('move learners individually from cohort to group', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const programYear = this.server.create('programYear', { program: this.program });
    const cohort = this.server.create('cohort', { programYear });
    this.server.create('learnerGroup', { cohort });
    this.server.createList('user', 2, { cohorts: [cohort] });

    assert.expect(8);

    await visit('/learnergroups/1');
    await page.overview.manage();
    assert.equal(page.overview.list.length, 0);
    assert.equal(page.usersInCohort.list.length, 2);
    assert.equal(page.usersInCohort.list[0].firstName, '1 guy');
    assert.equal(page.usersInCohort.list[1].firstName, '2 guy');

    await page.usersInCohort.list[0].add();

    assert.equal(page.overview.list.length, 1);
    assert.equal(page.overview.list[0].firstName, '1 guy');
    assert.equal(page.usersInCohort.list.length, 1);
    assert.equal(page.usersInCohort.list[0].firstName, '2 guy');
  });

  test('remove learners individually from group', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    const programYear = this.server.create('programYear', { program: this.program });
    const cohort = this.server.create('cohort', { programYear });
    const learnerGroup = this.server.create('learnerGroup', { cohort });
    this.server.createList('user', 2, { cohorts: [cohort], learnerGroups: [learnerGroup] });

    assert.expect(8);

    await visit('/learnergroups/1');
    await page.overview.manage();
    assert.equal(page.overview.list.length, 2);
    assert.equal(page.overview.list[0].firstName, '1 guy');
    assert.equal(page.overview.list[1].firstName, '2 guy');
    assert.equal(page.usersInCohort.list.length, 0);

    await page.overview.list[0].remove();

    assert.equal(page.overview.list.length, 1);
    assert.equal(page.overview.list[0].firstName, '2 guy');
    assert.equal(page.usersInCohort.list.length, 1);
    assert.equal(page.usersInCohort.list[0].firstName, '1 guy');
  });


  test('generate new subgroups', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('programYear', { program: this.program });
    this.server.create('cohort', { programYearId: 1 });
    this.server.createList('user', 2);
    this.server.create('learnerGroup', {
      cohortId: 1,
    });
    this.server.create('learnerGroup', {
      cohortId: 1,
      parentId: 1,
      userIds: [2,3]
    });
    this.server.create('learnerGroup', {
      cohortId: 1,
      parentId: 1
    });
    this.server.createList('learnerGroup', 2, {
      cohortId: 1,
      parentId: 2
    });


    assert.expect(11);

    const subgroupList = '.learnergroup-subgroup-list';
    const expandButton = `${subgroupList} .expand-button`;
    const input = `${subgroupList} .new-learnergroup input`;
    const done = `${subgroupList} .new-learnergroup .done`;
    const multiGroupsButton = `${subgroupList} .second-button`;
    const parentLearnergroupTitle = `learner group 0`;
    const table = `${subgroupList} .learnergroup-subgroup-list-list table tbody`;

    await visit('/learnergroups/1');
    // add five subgroups
    await click(expandButton);
    await click(multiGroupsButton);
    await fillIn(input, '5');
    await click(done);
    function getCellData(row, cell) {
      return find(`${table} tr:nth-of-type(${row + 1}) td:nth-of-type(${cell + 1})`).textContent.trim();
    }
    assert.dom(`${table} tr`).exists({ count: 7 }, 'all subgroups are displayed.');
    for (let i = 0; i < 5; i++) {
      assert.equal(getCellData(i, 0), `${parentLearnergroupTitle} ${i + 1}`, 'new learnergroup title is ok.');
    }
    assert.equal(getCellData(5, 0), 'learner group 1');
    assert.equal(getCellData(6, 0), 'learner group 2');

    // add two more subgroups
    await click(expandButton);
    await click(multiGroupsButton);
    await fillIn(input, '2');
    await click(done);
    assert.dom(`${table} tr`).exists({ count: 9 }, 'all subgroups are still displayed.');
    assert.equal(getCellData(5, 0), `${parentLearnergroupTitle} 6`, 'consecutively new learnergroup title is ok.');
    assert.equal(getCellData(6, 0), `${parentLearnergroupTitle} 7`, 'consecutively new learnergroup title is ok.');
  });

  test('copy learnergroup without learners', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(20);
    this.server.create('programYear', { program: this.program });
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
    const firstGroupCopy = `${firstGroup} td:nth-of-type(5) .fa-copy`;
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

  test('copy learnergroup with learners', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(20);
    this.server.createList('user', 10);
    this.server.create('programYear', { program: this.program });
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
    const firstGroupCopy = `${firstGroup} td:nth-of-type(5) .fa-copy`;
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


  test('Cohort members not in learner group appear after navigating to learner group #3428', async function (assert) {
    const groups = '.list tbody tr';
    const firstGroup = `${groups}:nth-of-type(1)`;
    const firstTitle = `${firstGroup} td:nth-of-type(1)`;
    const firstLink = `${firstTitle} a`;
    const members = '.learnergroup-overview-content table:nth-of-type(2) tbody tr';
    const cohortMembers = `.cohortmembers tbody tr`;
    assert.expect(5);
    this.server.create('programYear', { program: this.program });
    const cohort = this.server.create('cohort', {
      programYearId: 1,
    });
    const learnerGroup = this.server.create('learnerGroup', {
      cohort
    });
    this.server.createList('user', 5, {
      cohorts: [cohort],
      primaryCohort: cohort
    });
    this.server.createList('user', 5, {
      cohorts: [cohort],
      primaryCohort: cohort,
      learnerGroups: [learnerGroup]
    });

    await visit('/learnergroups');
    assert.equal(1, findAll(groups).length);
    assert.equal(await getElementText(find(firstTitle)), getText('learnergroup 0'));
    await click(firstLink);
    assert.equal(currentURL(), '/learnergroups/1');
    assert.dom(members).exists({ count: 5 }, 'lists members');
    assert.dom(cohortMembers).exists({ count: 5 }, 'lists cohort non members');
  });

  test('learner group calendar', async function(assert) {
    assert.expect(2);
    const programYear = this.server.create('programYear', { program: this.program });
    const cohort = this.server.create('cohort', { programYear });
    const learnerGroup = this.server.create('learnerGroup', { cohort });
    const course = this.server.create('course', { cohorts: [cohort] });
    const session = this.server.create('session', { course });
    this.server.create('offering', {
      session,
      startDate: moment().hour(8).toDate(),
      endDate: moment().hour(8).add(1, 'hour').toDate(),
      learnerGroups: [learnerGroup],
    });

    this.server.create('offering');

    const calendarToggle = '[data-test-toggle-learnergroup-calendar] label:nth-of-type(2)';
    const event = '.event';

    await visit('/learnergroups/1');
    assert.dom(event).doesNotExist();
    await click(calendarToggle);
    assert.dom(event).exists({ count: 1 });
  });

  test('learner group calendar with subgroup events', async function(assert) {
    assert.expect(3);
    const programYear = this.server.create('programYear', { program: this.program });
    const cohort = this.server.create('cohort', { programYear });
    const learnerGroup = this.server.create('learnerGroup', { cohort });
    const course = this.server.create('course', { cohorts: [cohort] });
    const session = this.server.create('session', { course });
    const subgroup = this.server.create('learnerGroup', {
      cohort,
      parent: learnerGroup
    });
    this.server.create('offering', {
      session,
      startDate: moment().hour(8).toDate(),
      endDate: moment().hour(8).add(1, 'hour').toDate(),
      learnerGroups: [learnerGroup],
    });
    this.server.create('offering', {
      session,
      startDate: moment().hour(8).toDate(),
      endDate: moment().hour(8).add(1, 'hour').toDate(),
      learnerGroups: [subgroup],
    });

    this.server.create('offering');

    const calendarToggle = '[data-test-toggle-learnergroup-calendar] label:nth-of-type(2)';
    const subgroupEventsToggle = '[data-test-learnergroup-calendar-toggle-subgroup-events] [data-test-toggle-yesno]';
    const event = '.event';

    await visit('/learnergroups/1');
    assert.dom(event).doesNotExist();
    await click(calendarToggle);
    assert.dom(event).exists({ count: 1 });
    await click(subgroupEventsToggle);
    assert.dom(event).exists({ count: 2 });
  });


  test('Learners with missing parent group affiliation still appear in subgroup manager #3476', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const members = '.learnergroup-overview-content table:nth-of-type(2) tbody tr';
    const manage = '.learnergroup-overview-actions button:nth-of-type(2)';
    const manager = '.learnergroup-user-manager-content';
    const membersOfGroup = `${manager} table:nth-of-type(2) tr`;
    const membersOfTree = `${manager} table:nth-of-type(3) tr`;
    assert.expect(4);
    this.server.create('programYear', { program: this.program });
    const cohort = this.server.create('cohort', {
      programYearId: 1,
    });
    const learnerGroup = this.server.create('learnerGroup', {
      cohort
    });
    const subGroup = this.server.create('learnerGroup', {
      cohort,
      parent: learnerGroup
    });
    this.server.createList('user', 2, {
      cohorts: [cohort],
      learnerGroups: [learnerGroup]
    });
    this.server.create('user', {
      cohorts: [cohort],
      learnerGroups: [subGroup]
    });

    await visit('/learnergroups/2');
    assert.equal(currentURL(), '/learnergroups/2');
    assert.dom(members).exists({ count: 1 }, 'lists members');
    await click(manage);
    assert.dom(membersOfGroup).exists({ count: 1 }, 'displays all group members');
    assert.dom(membersOfTree).exists({ count: 2 }, 'lists all tree members');
  });

  test('moving learners to group updates count #3570', async function (assert) {
    assert.expect(6);
    this.user.update({ administeredSchools: [this.school] });
    const programYear = this.server.create('programYear', { program: this.program });
    const cohort = this.server.create('cohort', { programYear });
    const learnerGroup = this.server.create('learnerGroup', { cohort });
    this.server.createList('user', 2, {
      cohorts: [cohort],
      learnerGroups: [learnerGroup]
    });
    this.server.createList('user', 2, { cohorts: [cohort] });

    await visit('/learnergroups/1');
    await page.overview.manage();
    assert.equal(page.overview.list.length, 2);
    assert.equal(page.usersInCohort.list.length, 2);
    assert.equal(page.header.members, 'Members: 2 / 4');

    await page.usersInCohort.list[0].add();

    assert.equal(page.overview.list.length, 3);
    assert.equal(page.usersInCohort.list.length, 1);
    assert.equal(page.header.members, 'Members: 3 / 4');
  });

  test('moving learners out of group updates count #3570', async function (assert) {
    assert.expect(6);
    this.user.update({ administeredSchools: [this.school] });
    const programYear = this.server.create('programYear', { program: this.program });
    const cohort = this.server.create('cohort', { programYear });
    const learnerGroup = this.server.create('learnerGroup', { cohort });
    this.server.createList('user', 2, {
      cohorts: [cohort],
      learnerGroups: [learnerGroup]
    });
    this.server.createList('user', 2, { cohorts: [cohort] });

    await visit('/learnergroups/1');
    await page.overview.manage();
    assert.equal(page.overview.list.length, 2);
    assert.equal(page.usersInCohort.list.length, 2);
    assert.equal(page.header.members, 'Members: 2 / 4');

    await page.overview.list[0].remove();

    assert.equal(page.overview.list.length, 1);
    assert.equal(page.usersInCohort.list.length, 3);
    assert.equal(page.header.members, 'Members: 1 / 4');
  });
});
