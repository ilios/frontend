import { test, module } from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import moment from 'moment';

let application;

module('Acceptance: Learnergroup', {
  beforeEach: function() {
    application = startApp();
    server.create('school');
    setupAuthentication(application, {id: 4136, schoolId: 1});
  },

  afterEach: function() {
    destroyApp(application);
  }
});


test('generate new subgroups', async function(assert) {
  server.create('programYear');
  server.create('cohort', { programYearId: 1 });
  server.createList('user', 2);
  server.create('learnerGroup', {
    cohortId: 1,
  });
  server.create('learnerGroup', {
    cohortId: 1,
    parentId: 1,
    userIds: [2,3]
  });
  server.create('learnerGroup', {
    cohortId: 1,
    parentId: 1
  });
  server.createList('learnerGroup', 2, {
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
    return find(`${table} tr:eq(${row}) td:eq(${cell})`).text().trim();
  }
  assert.equal(find(`${table} tr`).length, 7, 'all subgroups are displayed.');
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
  assert.equal(find(`${table} tr`).length, 9, 'all subgroups are still displayed.');
  assert.equal(getCellData(5, 0), `${parentLearnergroupTitle} 6`, 'consecutively new learnergroup title is ok.');
  assert.equal(getCellData(6, 0), `${parentLearnergroupTitle} 7`, 'consecutively new learnergroup title is ok.');
});

test('copy learnergroup without learners', async function(assert) {
  assert.expect(20);
  server.create('school');
  server.create('program', {
    schoolId: 1,
  });
  server.create('programYear', {
    programId: 1
  });
  server.create('cohort', {
    programYearId: 1,
  });
  server.create('learnerGroup', {
    cohortId: 1,
  });
  server.create('learnerGroup', {
    cohortId: 1,
    parentId: 1,
  });
  server.create('learnerGroup', {
    cohortId: 1,
    parentId: 1,
  });
  server.create('learnerGroup', {
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
  assert.equal(1, find(groups).length);
  assert.equal(getElementText(find(firstTitle)), getText('learnergroup 0'));
  assert.equal(getElementText(find(firstMembers)), getText('0'));
  assert.equal(getElementText(find(firstSubgroups)), getText('2'));
  await click(firstGroupCopy);
  await click(firstGroupCopyNoLearners);
  assert.equal(2, find(groups).length);
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

  assert.equal(2, find(subGroupList).length);

  assert.equal(getElementText(find(firstSubgroupTitle)), getText('learnergroup 1'));
  assert.equal(getElementText(find(firstSubgroupMembers)), getText('0'));
  assert.equal(getElementText(find(firstSubgroupSubgroups)), getText('1'));
  assert.equal(getElementText(find(secondSubgroupTitle)), getText('learnergroup 2'));
  assert.equal(getElementText(find(secondSubgroupMembers)), getText('0'));
  assert.equal(getElementText(find(secondSubgroupSubgroups)), getText('0'));
});

test('copy learnergroup with learners', async function(assert) {
  assert.expect(20);
  server.createList('user', 10);
  server.create('program', {
    schoolId: 1,
  });
  server.create('programYear', {
    programId: 1,
  });
  server.create('cohort', {
    programYearId: 1,
  });
  server.create('learnerGroup', {
    cohortId: 1,
    userIds: [2, 3, 4, 5, 6, 7, 8]
  });
  server.create('learnerGroup', {
    cohortId: 1,
    parentId: 1,
    userIds: [8]
  });
  server.create('learnerGroup', {
    cohortId: 1,
    parentId: 1,
    userIds: [5, 6, 7]
  });
  server.create('learnerGroup', {
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
  assert.equal(1, find(groups).length);
  assert.equal(getElementText(find(firstTitle)), getText('learnergroup 0'));
  assert.equal(getElementText(find(firstMembers)), getText('7'));
  assert.equal(getElementText(find(firstSubgroups)), getText('2'));
  await click(firstGroupCopy);
  await click(firstGroupCopyWithLearners);
  assert.equal(2, find(groups).length);
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

  assert.equal(2, find(subGroupList).length);

  assert.equal(getElementText(find(firstSubgroupTitle)), getText('learnergroup 1'));
  assert.equal(getElementText(find(firstSubgroupMembers)), getText('1'));
  assert.equal(getElementText(find(firstSubgroupSubgroups)), getText('1'));
  assert.equal(getElementText(find(secondSubgroupTitle)), getText('learnergroup 2'));
  assert.equal(getElementText(find(secondSubgroupMembers)), getText('3'));
  assert.equal(getElementText(find(secondSubgroupSubgroups)), getText('0'));
});


test('Cohort members not in learner group appear after navigating to learner group #3428', async function (assert) {
  const groups = '.list tbody tr';
  const firstGroup = `${groups}:eq(0)`;
  const firstTitle = `${firstGroup} td:eq(0)`;
  const firstLink = `${firstTitle} a`;
  const members = '.learnergroup-overview-content table:eq(1) tbody tr';
  const cohortMembers = `.cohortmembers tbody tr`;
  assert.expect(5);
  server.create('school');
  server.create('program', {
    schoolId: 1,
  });
  server.create('programYear', {
    programId: 1
  });
  const cohort = server.create('cohort', {
    programYearId: 1,
  });
  const learnerGroup = server.create('learnerGroup', {
    cohort
  });
  server.createList('user', 5, {
    cohorts: [cohort],
    primaryCohort: cohort
  });
  server.createList('user', 5, {
    cohorts: [cohort],
    primaryCohort: cohort,
    learnerGroups: [learnerGroup]
  });

  await visit('/learnergroups');
  assert.equal(1, find(groups).length);
  assert.equal(getElementText(find(firstTitle)), getText('learnergroup 0'));
  await click(firstLink);
  assert.equal(currentURL(), '/learnergroups/1');
  assert.equal(find(members).length, 5, 'lists members');
  assert.equal(find(cohortMembers).length, 5, 'lists cohort non members');
});

test('learner group calendar', async function(assert) {
  assert.expect(2);
  const program = server.create('program', {
    schoolId: 1,
  });
  const programYear = server.create('programYear', { program });
  const cohort = server.create('cohort', { programYear });
  const learnerGroup = server.create('learnerGroup', { cohort });
  const course = server.create('course', { cohorts: [cohort] });
  const session = server.create('session', { course });
  server.create('offering', {
    session,
    startDate: moment().hour(8).toDate(),
    endDate: moment().hour(8).add(1, 'hour').toDate(),
    learnerGroups: [learnerGroup],
  });

  server.create('offering');

  const calendarToggle = '[data-test-toggle-learnergroup-calendar] label:eq(1)';
  const event = '.event';

  await visit('/learnergroups/1');
  assert.equal(find(event).length, 0);
  await click(calendarToggle);
  assert.equal(find(event).length, 1);
});

test('learner group calendar with subgroup events', async function(assert) {
  assert.expect(3);
  const program = server.create('program', {
    schoolId: 1,
  });
  const programYear = server.create('programYear', { program });
  const cohort = server.create('cohort', { programYear });
  const learnerGroup = server.create('learnerGroup', { cohort });
  const course = server.create('course', { cohorts: [cohort] });
  const session = server.create('session', { course });
  const subgroup = server.create('learnerGroup', {
    cohort,
    parent: learnerGroup
  });
  server.create('offering', {
    session,
    startDate: moment().hour(8).toDate(),
    endDate: moment().hour(8).add(1, 'hour').toDate(),
    learnerGroups: [learnerGroup],
  });
  server.create('offering', {
    session,
    startDate: moment().hour(8).toDate(),
    endDate: moment().hour(8).add(1, 'hour').toDate(),
    learnerGroups: [subgroup],
  });

  server.create('offering');

  const calendarToggle = '[data-test-toggle-learnergroup-calendar] label:eq(1)';
  const subgroupEventsToggle = '[data-test-learnergroup-calendar-toggle-subgroup-events] input:eq(0)';
  const event = '.event';

  await visit('/learnergroups/1');
  assert.equal(find(event).length, 0);
  await click(calendarToggle);
  assert.equal(find(event).length, 1);
  await click(subgroupEventsToggle);
  assert.equal(find(event).length, 2);
});


test('Learners with missing parent group affiliation still appear in subgroup manager #3476', async function (assert) {
  const members = '.learnergroup-overview-content table:eq(1) tbody tr';
  const manage = '.learnergroup-overview-actions button:eq(1)';
  const manager = '.learnergroup-user-manager-content';
  const membersOfGroup = `${manager} table:eq(1) tr`;
  const membersOfTree = `${manager} table:eq(2) tr`;
  assert.expect(4);
  server.create('school');
  server.create('program', {
    schoolId: 1,
  });
  server.create('programYear', {
    programId: 1
  });
  const cohort = server.create('cohort', {
    programYearId: 1,
  });
  const learnerGroup = server.create('learnerGroup', {
    cohort
  });
  const subGroup = server.create('learnerGroup', {
    cohort,
    parent: learnerGroup
  });
  server.createList('user', 2, {
    cohorts: [cohort],
    learnerGroups: [learnerGroup]
  });
  server.create('user', {
    cohorts: [cohort],
    learnerGroups: [subGroup]
  });

  await visit('/learnergroups/2');
  assert.equal(currentURL(), '/learnergroups/2');
  assert.equal(find(members).length, 1, 'lists members');
  await click(manage);
  assert.equal(find(membersOfGroup).length, 1, 'displays all group members');
  assert.equal(find(membersOfTree).length, 2, 'lists all tree members');
});
