import { currentURL } from '@ember/test-helpers';
import { test, module } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { DateTime } from 'luxon';
import { setupApplicationTest } from 'frontend/tests/helpers';
import page from '../pages/learner-group';
import learnerGroupsPage from '../pages/learner-groups';
import percySnapshot from '@percy/ember';
import { getUniqueName } from '../helpers/percy-snapshot-name';

module('Acceptance | Learner Group', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
    this.program = this.server.create('program', { school: this.school });
  });

  test('move learners individually from cohort to group', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const programYear = this.server.create('program-year', { program: this.program });
    const cohort = this.server.create('cohort', { programYear });
    this.server.create('learner-group', { cohort });
    this.server.createList('user', 2, { cohorts: [cohort] });

    await page.visit({ learnerGroupId: 1 });
    await page.root.actions.buttons.manageUsers.click();
    assert.strictEqual(page.root.userManager.usersInCurrentGroup.length, 0);
    assert.strictEqual(page.root.cohortUserManager.users.length, 2);
    assert.strictEqual(
      page.root.cohortUserManager.users[0].name.userNameInfo.fullName,
      '1 guy M. Mc1son',
    );
    assert.strictEqual(
      page.root.cohortUserManager.users[1].name.userNameInfo.fullName,
      '2 guy M. Mc2son',
    );
    await page.root.cohortUserManager.users[0].add();
    assert.strictEqual(page.root.userManager.usersInCurrentGroup.length, 1);
    assert.strictEqual(
      page.root.userManager.usersInCurrentGroup[0].name.userNameInfo.fullName,
      '1 guy M. Mc1son',
    );
    assert.strictEqual(page.root.cohortUserManager.users.length, 1);
    assert.strictEqual(
      page.root.cohortUserManager.users[0].name.userNameInfo.fullName,
      '2 guy M. Mc2son',
    );
  });

  test('remove learners individually from group', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const programYear = this.server.create('program-year', { program: this.program });
    const cohort = this.server.create('cohort', { programYear });
    const learnerGroup = this.server.create('learner-group', { cohort });
    this.server.createList('user', 2, { cohorts: [cohort], learnerGroups: [learnerGroup] });

    await page.visit({ learnerGroupId: 1 });
    await page.root.actions.buttons.manageUsers.click();
    assert.strictEqual(page.root.userManager.usersInCurrentGroup.length, 2);
    assert.strictEqual(page.root.cohortUserManager.users.length, 0);
    assert.strictEqual(
      page.root.userManager.usersInCurrentGroup[0].name.userNameInfo.fullName,
      '1 guy M. Mc1son',
    );
    assert.strictEqual(
      page.root.userManager.usersInCurrentGroup[1].name.userNameInfo.fullName,
      '2 guy M. Mc2son',
    );
    await page.root.userManager.usersInCurrentGroup[0].remove();
    assert.strictEqual(page.root.userManager.usersInCurrentGroup.length, 1);
    assert.strictEqual(
      page.root.userManager.usersInCurrentGroup[0].name.userNameInfo.fullName,
      '2 guy M. Mc2son',
    );
    assert.strictEqual(page.root.cohortUserManager.users.length, 1);
    assert.strictEqual(
      page.root.cohortUserManager.users[0].name.userNameInfo.fullName,
      '1 guy M. Mc1son',
    );
  });

  test('generate new subgroups', async function (assert) {
    assert.expect(23);
    this.user.update({ administeredSchools: [this.school] });
    const programYear = this.server.create('program-year', { program: this.program });
    const cohort = this.server.create('cohort', { programYear });
    this.server.createList('user', 2);
    const parent = this.server.create('learner-group', {
      cohort,
    });
    const parent2 = this.server.create('learner-group', {
      cohort,
      parent,
      userIds: [2, 3],
    });
    this.server.create('learner-group', {
      cohort,
      parent,
    });
    this.server.createList('learner-group', 2, {
      cohort,
      parent: parent2,
    });

    await page.visit({ learnerGroupId: 1 });
    await percySnapshot(getUniqueName(assert, 'learnerGroupId1'));
    assert.strictEqual(page.root.subgroups.list.items.length, 2);
    assert.strictEqual(page.root.subgroups.list.items[0].title, 'learner group 1');
    assert.strictEqual(page.root.subgroups.list.items[1].title, 'learner group 2');

    await page.root.subgroups.toggleNewLearnerGroupForm();
    await percySnapshot(getUniqueName(assert, 'toggleNewLearnerGroupForm'));

    assert.ok(page.root.subgroups.newLearnerGroupForm.singleGroupSelected);
    assert.notOk(page.root.subgroups.newLearnerGroupForm.multipleGroupSelected);
    await page.root.subgroups.newLearnerGroupForm.chooseMultipleGroups();
    await page.root.subgroups.newLearnerGroupForm.multiple.set('5');
    await page.root.subgroups.newLearnerGroupForm.multiple.save();

    assert.strictEqual(page.root.subgroups.list.items.length, 7);
    assert.strictEqual(page.root.subgroups.list.items[0].title, 'learner group 0 1');
    assert.strictEqual(page.root.subgroups.list.items[1].title, 'learner group 0 2');
    assert.strictEqual(page.root.subgroups.list.items[2].title, 'learner group 0 3');
    assert.strictEqual(page.root.subgroups.list.items[3].title, 'learner group 0 4');
    assert.strictEqual(page.root.subgroups.list.items[4].title, 'learner group 0 5');
    assert.strictEqual(page.root.subgroups.list.items[5].title, 'learner group 1');
    assert.strictEqual(page.root.subgroups.list.items[6].title, 'learner group 2');

    // add two more subgroups
    await page.root.subgroups.toggleNewLearnerGroupForm();
    await page.root.subgroups.newLearnerGroupForm.chooseMultipleGroups();
    await page.root.subgroups.newLearnerGroupForm.multiple.set('2');
    await page.root.subgroups.newLearnerGroupForm.multiple.save();
    await percySnapshot(getUniqueName(assert, 'toggleNewLearnerGroupForm +2 subgroups'));

    assert.strictEqual(page.root.subgroups.list.items.length, 9);
    assert.strictEqual(page.root.subgroups.list.items[0].title, 'learner group 0 1');
    assert.strictEqual(page.root.subgroups.list.items[1].title, 'learner group 0 2');
    assert.strictEqual(page.root.subgroups.list.items[2].title, 'learner group 0 3');
    assert.strictEqual(page.root.subgroups.list.items[3].title, 'learner group 0 4');
    assert.strictEqual(page.root.subgroups.list.items[4].title, 'learner group 0 5');
    assert.strictEqual(page.root.subgroups.list.items[5].title, 'learner group 0 6');
    assert.strictEqual(page.root.subgroups.list.items[6].title, 'learner group 0 7');
    assert.strictEqual(page.root.subgroups.list.items[7].title, 'learner group 1');
    assert.strictEqual(page.root.subgroups.list.items[8].title, 'learner group 2');
  });

  test('copy learnergroup without learners', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const programYear = this.server.create('program-year', { program: this.program });
    const cohort = this.server.create('cohort', {
      programYear,
    });
    const parent = this.server.create('learner-group', {
      cohort,
    });
    const subGroup = this.server.create('learner-group', {
      cohort,
      parent,
    });
    this.server.createList('learner-group', 2, {
      cohort,
      parent: subGroup,
    });

    await page.visit({ learnerGroupId: 1 });

    assert.strictEqual(page.root.subgroups.list.items.length, 1);
    assert.strictEqual(page.root.subgroups.list.items[0].title, 'learner group 1');
    assert.strictEqual(page.root.subgroups.list.items[0].users, '0');
    assert.strictEqual(page.root.subgroups.list.items[0].children, '2');
    await page.root.subgroups.list.items[0].copy();
    await page.root.subgroups.list.confirmCopy.copyWithoutLearners();
    assert.strictEqual(page.root.subgroups.list.items.length, 2);
    assert.strictEqual(page.root.subgroups.list.items[0].title, 'learner group 1');
    assert.strictEqual(page.root.subgroups.list.items[0].users, '0');
    assert.strictEqual(page.root.subgroups.list.items[0].children, '2');
    assert.strictEqual(page.root.subgroups.list.items[1].title, 'learner group 1 (Copy)');
    assert.strictEqual(page.root.subgroups.list.items[1].users, '0');
    assert.strictEqual(page.root.subgroups.list.items[1].children, '2');

    await page.visit({ learnerGroupId: 1 });
    assert.strictEqual(page.root.subgroups.list.items.length, 2);
    assert.strictEqual(page.root.subgroups.list.items[0].title, 'learner group 1');
    assert.strictEqual(page.root.subgroups.list.items[0].users, '0');
    assert.strictEqual(page.root.subgroups.list.items[0].children, '2');
    assert.strictEqual(page.root.subgroups.list.items[1].title, 'learner group 1 (Copy)');
    assert.strictEqual(page.root.subgroups.list.items[1].users, '0');
    assert.strictEqual(page.root.subgroups.list.items[1].children, '2');

    await page.root.subgroups.list.items[1].clickTitle();
    assert.strictEqual(currentURL(), '/learnergroups/5');
    assert.strictEqual(page.root.subgroups.list.items.length, 2);
    assert.strictEqual(page.root.subgroups.list.items[0].title, 'learner group 2');
    assert.strictEqual(page.root.subgroups.list.items[0].users, '0');
    assert.strictEqual(page.root.subgroups.list.items[0].children, '0');
    assert.strictEqual(page.root.subgroups.list.items[1].title, 'learner group 3');
    assert.strictEqual(page.root.subgroups.list.items[1].users, '0');
    assert.strictEqual(page.root.subgroups.list.items[1].children, '0');
  });

  test('cannot copy learnergroup with learners', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const users = this.server.createList('user', 3);
    const programYear = this.server.create('program-year', { program: this.program });
    const cohort = this.server.create('cohort', {
      programYear,
    });
    const parent = this.server.create('learner-group', {
      cohort,
    });
    const subGroup = this.server.create('learner-group', {
      cohort,
      parent,
      users,
    });
    this.server.createList('learner-group', 2, {
      cohort,
      parent: subGroup,
    });

    await page.visit({ learnerGroupId: 1 });
    assert.strictEqual(page.root.subgroups.list.items.length, 1);
    assert.strictEqual(page.root.subgroups.list.items[0].title, 'learner group 1');
    assert.strictEqual(page.root.subgroups.list.items[0].users, '3');
    assert.strictEqual(page.root.subgroups.list.items[0].children, '2');
    await page.root.subgroups.list.items[0].copy();
    assert.notOk(page.root.subgroups.list.confirmCopy.canCopyWithLearners);
    assert.ok(page.root.subgroups.list.confirmCopy.canCopyWithoutLearners);
  });

  test('cannot copy learnergroup with learners in subgroup', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const users = this.server.createList('user', 3);
    const programYear = this.server.create('program-year', { program: this.program });
    const cohort = this.server.create('cohort', {
      programYear,
    });
    const parent = this.server.create('learner-group', {
      cohort,
    });
    const subGroup = this.server.create('learner-group', {
      cohort,
      parent,
    });
    this.server.create('learner-group', {
      cohort,
      parent: subGroup,
      users,
    });
    this.server.create('learner-group', {
      cohort,
      parent: subGroup,
    });

    await page.visit({ learnerGroupId: 1 });
    assert.strictEqual(page.root.subgroups.list.items.length, 1);
    assert.strictEqual(page.root.subgroups.list.items[0].title, 'learner group 1');
    assert.strictEqual(page.root.subgroups.list.items[0].users, '0');
    assert.strictEqual(page.root.subgroups.list.items[0].children, '2');
    await page.root.subgroups.list.items[0].copy();
    assert.notOk(page.root.subgroups.list.confirmCopy.canCopyWithLearners);
    assert.ok(page.root.subgroups.list.confirmCopy.canCopyWithoutLearners);
  });

  test('Cohort members not in learner group appear after navigating to learner group #3428', async function (assert) {
    this.server.create('program-year', { program: this.program });
    const cohort = this.server.create('cohort', {
      programYearId: 1,
    });
    const learnerGroup = this.server.create('learner-group', {
      cohort,
    });
    this.server.createList('user', 5, {
      cohorts: [cohort],
      primaryCohort: cohort,
    });
    this.server.createList('user', 5, {
      cohorts: [cohort],
      primaryCohort: cohort,
      learnerGroups: [learnerGroup],
    });

    await learnerGroupsPage.visit();
    assert.strictEqual(learnerGroupsPage.list.items.length, 1);
    assert.strictEqual(learnerGroupsPage.list.items[0].title, 'learner group 0');
    await learnerGroupsPage.list.items[0].clickTitle();
    assert.strictEqual(currentURL(), '/learnergroups/1');
    assert.strictEqual(page.root.members.users.length, 5);
    assert.strictEqual(page.root.cohortUserManager.users.length, 5);
  });

  test('learner group calendar', async function (assert) {
    const programYear = this.server.create('program-year', { program: this.program });
    const cohort = this.server.create('cohort', { programYear });
    const learnerGroup = this.server.create('learner-group', { cohort });
    const course = this.server.create('course', { cohorts: [cohort] });
    const session = this.server.create('session', { course });
    this.server.create('offering', {
      session,
      startDate: DateTime.fromObject({ hour: 8 }).toJSDate(),
      endDate: DateTime.fromObject({ hour: 9 }).toJSDate(),
      learnerGroups: [learnerGroup],
    });
    this.server.create('offering');

    await page.visit({ learnerGroupId: 1 });
    assert.ok(page.root.actions.buttons.toggle.firstButton.isChecked);
    assert.notOk(page.root.calendar.isVisible);
    assert.strictEqual(page.root.calendar.calendar.events.length, 0);
    await page.root.actions.buttons.toggle.secondButton.click();
    assert.ok(page.root.actions.buttons.toggle.secondButton.isChecked);
    assert.ok(page.root.calendar.isVisible);
    assert.strictEqual(page.root.calendar.calendar.events.length, 1);
    await page.root.actions.buttons.toggle.firstButton.click();
    assert.ok(page.root.actions.buttons.toggle.firstButton.isChecked);
    assert.notOk(page.root.calendar.isVisible);
    assert.strictEqual(page.root.calendar.calendar.events.length, 0);
  });

  test('learner group calendar with subgroup events', async function (assert) {
    const programYear = this.server.create('program-year', { program: this.program });
    const cohort = this.server.create('cohort', { programYear });
    const learnerGroup = this.server.create('learner-group', { cohort });
    const course = this.server.create('course', { cohorts: [cohort] });
    const session = this.server.create('session', { course });
    const subgroup = this.server.create('learner-group', {
      cohort,
      parent: learnerGroup,
    });
    this.server.create('offering', {
      session,
      startDate: DateTime.fromObject({ hour: 8 }).toJSDate(),
      endDate: DateTime.fromObject({ hour: 9 }).toJSDate(),
      learnerGroups: [learnerGroup],
    });
    this.server.create('offering', {
      session,
      startDate: DateTime.fromObject({ hour: 8 }).toJSDate(),
      endDate: DateTime.fromObject({ hour: 9 }).toJSDate(),
      learnerGroups: [subgroup],
    });
    this.server.create('offering');

    await page.visit({ learnerGroupId: 1 });
    assert.strictEqual(page.root.calendar.calendar.events.length, 0);
    assert.notOk(page.root.calendar.calendar.isVisible);
    await page.root.actions.buttons.toggle.secondButton.click();
    assert.strictEqual(page.root.calendar.calendar.events.length, 1);
    assert.ok(page.root.calendar.calendar.isVisible);
    await page.root.calendar.showSubgroups.toggle.handle.click();
    assert.strictEqual(page.root.calendar.calendar.events.length, 2);
  });

  test('Learners with missing parent group affiliation still appear in subgroup manager #3476', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('program-year', { program: this.program });
    const cohort = this.server.create('cohort', {
      programYearId: 1,
    });
    const learnerGroup = this.server.create('learner-group', {
      cohort,
    });
    const subGroup = this.server.create('learner-group', {
      cohort,
      parent: learnerGroup,
    });
    this.server.createList('user', 2, {
      cohorts: [cohort],
      learnerGroups: [learnerGroup],
    });
    this.server.create('user', {
      cohorts: [cohort],
      learnerGroups: [subGroup],
    });

    await page.visit({ learnerGroupId: 2 });
    assert.strictEqual(currentURL(), '/learnergroups/2');
    assert.strictEqual(page.root.members.users.length, 1);
    await page.root.actions.buttons.manageUsers.click();
    assert.strictEqual(page.root.userManager.usersInCurrentGroup.length, 1);
    assert.strictEqual(page.root.userManager.usersNotInCurrentGroup.length, 2);
  });

  test('moving learners to group updates count #3570', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const programYear = this.server.create('program-year', { program: this.program });
    const cohort = this.server.create('cohort', { programYear });
    const learnerGroup = this.server.create('learner-group', { cohort });
    this.server.createList('user', 2, {
      cohorts: [cohort],
      learnerGroups: [learnerGroup],
    });
    this.server.createList('user', 2, { cohorts: [cohort] });

    await page.visit({ learnerGroupId: 1 });
    await page.root.actions.buttons.manageUsers.click();
    assert.strictEqual(page.root.userManager.usersInCurrentGroup.length, 2);
    assert.strictEqual(page.root.cohortUserManager.users.length, 2);
    assert.strictEqual(page.root.header.members, 'Members: 2 / 4');
    await page.root.cohortUserManager.users[0].add();
    assert.strictEqual(page.root.userManager.usersInCurrentGroup.length, 3);
    assert.strictEqual(page.root.cohortUserManager.users.length, 1);
    assert.strictEqual(page.root.header.members, 'Members: 3 / 4');
  });

  test('moving learners out of group updates count #3570', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const programYear = this.server.create('program-year', { program: this.program });
    const cohort = this.server.create('cohort', { programYear });
    const learnerGroup = this.server.create('learner-group', { cohort });
    this.server.createList('user', 2, {
      cohorts: [cohort],
      learnerGroups: [learnerGroup],
    });
    this.server.createList('user', 2, { cohorts: [cohort] });

    await page.visit({ learnerGroupId: 1 });
    await page.root.actions.buttons.manageUsers.click();
    assert.strictEqual(page.root.userManager.usersInCurrentGroup.length, 2);
    assert.strictEqual(page.root.cohortUserManager.users.length, 2);
    assert.strictEqual(page.root.header.members, 'Members: 2 / 4');

    await page.root.userManager.usersInCurrentGroup[0].remove();
    assert.strictEqual(page.root.userManager.usersInCurrentGroup.length, 1);
    assert.strictEqual(page.root.cohortUserManager.users.length, 3);
    assert.strictEqual(page.root.header.members, 'Members: 1 / 4');
  });

  test('manage subgroup members does not duplicate members #3936', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const programYear = this.server.create('program-year', { program: this.program });
    const cohort = this.server.create('cohort', { programYear });
    const parent = this.server.create('learner-group', { cohort });
    const child = this.server.create('learner-group', { cohort, parent });
    this.server.createList('user', 2, { cohorts: [cohort], learnerGroups: [parent, child] });

    await page.visit({ learnerGroupId: child.id });
    await page.root.actions.buttons.manageUsers.click();
    const users = page.root.userManager.usersInCurrentGroup;
    assert.strictEqual(users.length, 2);
    assert.strictEqual(users[0].name.userNameInfo.fullName, '1 guy M. Mc1son');
    assert.strictEqual(users[1].name.userNameInfo.fullName, '2 guy M. Mc2son');
  });

  test('move learners individually from subgroup to subgroup #4953', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const programYear = this.server.create('program-year', { program: this.program });
    const cohort = this.server.create('cohort', { programYear });
    const parent = this.server.create('learner-group', { cohort });
    this.server.createList('learner-group', 2, { cohort, parent });
    this.server.createList('user', 3, { cohorts: [cohort] });

    await page.visit({ learnerGroupId: 1 });
    assert.strictEqual(page.root.subgroups.list.items.length, 2, 'subgroup count is correct');
    assert.strictEqual(
      page.root.subgroups.list.items[0].title,
      'learner group 1',
      'first subgroup title is correct',
    );
    assert.strictEqual(
      page.root.subgroups.list.items[1].title,
      'learner group 2',
      'second subgroup title is correct',
    );

    await page.root.subgroups.list.items[0].clickTitle();
    await page.root.actions.buttons.manageUsers.click();
    assert.strictEqual(
      page.root.userManager.usersInCurrentGroup.length,
      0,
      'users in current group count correct',
    );
    assert.strictEqual(
      page.root.userManager.usersNotInCurrentGroup.length,
      0,
      'users not in current group count correct',
    );
    assert.strictEqual(page.root.cohortUserManager.users.length, 3, 'cohort users count correct');
    await page.root.cohortUserManager.users[0].add();
    assert.strictEqual(
      page.root.userManager.usersInCurrentGroup.length,
      1,
      'users in current group count correct',
    );
    assert.strictEqual(
      page.root.userManager.usersNotInCurrentGroup.length,
      0,
      'users not in current group count correct',
    );
    assert.strictEqual(page.root.cohortUserManager.users.length, 2, 'cohort users count correct');
    assert.strictEqual(
      page.root.userManager.usersInCurrentGroup[0].name.userNameInfo.fullName,
      '1 guy M. Mc1son',
      'name of first user in current group correct',
    );
    await page.root.header.breadcrumb.crumbs[2].visit();
    await page.root.subgroups.list.items[1].clickTitle();
    await page.root.actions.buttons.manageUsers.click();
    assert.strictEqual(
      page.root.userManager.usersInCurrentGroup.length,
      0,
      'users in current group count correct',
    );
    assert.strictEqual(
      page.root.userManager.usersNotInCurrentGroup.length,
      1,
      'users not in current group count correct',
    );
    assert.strictEqual(page.root.cohortUserManager.users.length, 2, 'cohort users count correct');
    await page.root.userManager.usersNotInCurrentGroup[0].add();
    assert.strictEqual(
      page.root.userManager.usersInCurrentGroup.length,
      1,
      'users in current group count correct',
    );
    assert.strictEqual(
      page.root.userManager.usersNotInCurrentGroup.length,
      0,
      'users not in current group count correct',
    );
    assert.strictEqual(page.root.cohortUserManager.users.length, 2, 'cohort users count correct');
    assert.strictEqual(
      page.root.userManager.usersInCurrentGroup[0].name.userNameInfo.fullName,
      '1 guy M. Mc1son',
      'name of first user in current group correct',
    );
  });

  test('expand and collapse course associations', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const programYear = this.server.create('program-year', { program: this.program });
    const cohort = this.server.create('cohort', { programYear });
    const learnerGroup = this.server.create('learner-group', { cohort });
    const course = this.server.create('course', { school: this.school });
    const session = this.server.create('session', { course });
    this.server.create('offering', { session, learnerGroups: [learnerGroup] });
    const learnerGroupId = learnerGroup.id;

    await page.visit({ learnerGroupId: learnerGroup.id });

    assert.strictEqual(currentURL(), `/learnergroups/${learnerGroupId}`);
    assert.ok(page.root.courseAssociations.header.toggle.isCollapsed);

    await page.root.courseAssociations.header.toggle.click();
    assert.ok(page.root.courseAssociations.header.toggle.isExpanded);
    assert.strictEqual(
      currentURL(),
      `/learnergroups/${learnerGroupId}?showCourseAssociations=true`,
    );

    await page.root.courseAssociations.header.toggle.click();
    assert.ok(page.root.courseAssociations.header.toggle.isCollapsed);
    assert.strictEqual(currentURL(), `/learnergroups/${learnerGroupId}`);
  });

  test('course associations are expanded if URL contains corresponding parameter', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const programYear = this.server.create('program-year', { program: this.program });
    const cohort = this.server.create('cohort', { programYear });
    const learnerGroup = this.server.create('learner-group', { cohort });
    const course = this.server.create('course', { school: this.school });
    const session = this.server.create('session', { course });
    this.server.create('offering', { session, learnerGroups: [learnerGroup] });
    const learnerGroupId = learnerGroup.id;

    await page.visit({ learnerGroupId, showCourseAssociations: 'true' });

    assert.strictEqual(
      currentURL(),
      `/learnergroups/${learnerGroupId}?showCourseAssociations=true`,
    );
    assert.ok(page.root.courseAssociations.header.toggle.isExpanded);
  });
});
