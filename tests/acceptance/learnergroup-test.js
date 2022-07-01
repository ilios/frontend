import { currentURL } from '@ember/test-helpers';
import { test, module } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import moment from 'moment';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from '../pages/learner-group';
import learnerGroupsPage from '../pages/learner-groups';

module('Acceptance | Learnergroup', function (hooks) {
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

    await page.visit({ learnerGroupId: 1 });
    await page.details.actions.buttons.manageUsers.click();
    assert.strictEqual(page.details.userManager.usersInCurrentGroup.length, 0);
    assert.strictEqual(page.details.cohortUserManager.users.length, 2);
    assert.strictEqual(
      page.details.cohortUserManager.users[0].name.userNameInfo.fullName,
      '1 guy M. Mc1son'
    );
    assert.strictEqual(
      page.details.cohortUserManager.users[1].name.userNameInfo.fullName,
      '2 guy M. Mc2son'
    );
    await page.details.cohortUserManager.users[0].add();
    assert.strictEqual(page.details.userManager.usersInCurrentGroup.length, 1);
    assert.strictEqual(
      page.details.userManager.usersInCurrentGroup[0].name.userNameInfo.fullName,
      '1 guy M. Mc1son'
    );
    assert.strictEqual(page.details.cohortUserManager.users.length, 1);
    assert.strictEqual(
      page.details.cohortUserManager.users[0].name.userNameInfo.fullName,
      '2 guy M. Mc2son'
    );
  });

  test('remove learners individually from group', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const programYear = this.server.create('programYear', { program: this.program });
    const cohort = this.server.create('cohort', { programYear });
    const learnerGroup = this.server.create('learnerGroup', { cohort });
    this.server.createList('user', 2, { cohorts: [cohort], learnerGroups: [learnerGroup] });

    await page.visit({ learnerGroupId: 1 });
    await page.details.actions.buttons.manageUsers.click();
    assert.strictEqual(page.details.userManager.usersInCurrentGroup.length, 2);
    assert.strictEqual(page.details.cohortUserManager.users.length, 0);
    assert.strictEqual(
      page.details.userManager.usersInCurrentGroup[0].name.userNameInfo.fullName,
      '1 guy M. Mc1son'
    );
    assert.strictEqual(
      page.details.userManager.usersInCurrentGroup[1].name.userNameInfo.fullName,
      '2 guy M. Mc2son'
    );
    await page.details.userManager.usersInCurrentGroup[0].remove();
    assert.strictEqual(page.details.userManager.usersInCurrentGroup.length, 1);
    assert.strictEqual(
      page.details.userManager.usersInCurrentGroup[0].name.userNameInfo.fullName,
      '2 guy M. Mc2son'
    );
    assert.strictEqual(page.details.cohortUserManager.users.length, 1);
    assert.strictEqual(
      page.details.cohortUserManager.users[0].name.userNameInfo.fullName,
      '1 guy M. Mc1son'
    );
  });

  test('generate new subgroups', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const programYear = this.server.create('programYear', { program: this.program });
    const cohort = this.server.create('cohort', { programYear });
    this.server.createList('user', 2);
    const parent = this.server.create('learnerGroup', {
      cohort,
    });
    const parent2 = this.server.create('learnerGroup', {
      cohort,
      parent,
      userIds: [2, 3],
    });
    this.server.create('learnerGroup', {
      cohort,
      parent,
    });
    this.server.createList('learnerGroup', 2, {
      cohort,
      parent: parent2,
    });

    await page.visit({ learnerGroupId: 1 });
    assert.strictEqual(page.details.subgroupList.groups.length, 2);
    assert.strictEqual(page.details.subgroupList.groups[0].title, 'learner group 1');
    assert.strictEqual(page.details.subgroupList.groups[1].title, 'learner group 2');

    await page.details.subgroupList.toggleNewForm();

    assert.ok(page.details.subgroupList.newForm.singleGroupSelected);
    assert.notOk(page.details.subgroupList.newForm.multipleGroupSelected);
    await page.details.subgroupList.newForm.chooseMultipleGroups();
    await page.details.subgroupList.newForm.multiple.setNumberOfGroups(5);
    await page.details.subgroupList.newForm.multiple.save();

    assert.strictEqual(page.details.subgroupList.groups.length, 7);
    assert.strictEqual(page.details.subgroupList.groups[0].title, 'learner group 0 1');
    assert.strictEqual(page.details.subgroupList.groups[1].title, 'learner group 0 2');
    assert.strictEqual(page.details.subgroupList.groups[2].title, 'learner group 0 3');
    assert.strictEqual(page.details.subgroupList.groups[3].title, 'learner group 0 4');
    assert.strictEqual(page.details.subgroupList.groups[4].title, 'learner group 0 5');
    assert.strictEqual(page.details.subgroupList.groups[5].title, 'learner group 1');
    assert.strictEqual(page.details.subgroupList.groups[6].title, 'learner group 2');

    // add two more subgroups
    await page.details.subgroupList.toggleNewForm();
    await page.details.subgroupList.newForm.chooseMultipleGroups();
    await page.details.subgroupList.newForm.multiple.setNumberOfGroups(2);
    await page.details.subgroupList.newForm.multiple.save();

    assert.strictEqual(page.details.subgroupList.groups.length, 9);
    assert.strictEqual(page.details.subgroupList.groups[0].title, 'learner group 0 1');
    assert.strictEqual(page.details.subgroupList.groups[1].title, 'learner group 0 2');
    assert.strictEqual(page.details.subgroupList.groups[2].title, 'learner group 0 3');
    assert.strictEqual(page.details.subgroupList.groups[3].title, 'learner group 0 4');
    assert.strictEqual(page.details.subgroupList.groups[4].title, 'learner group 0 5');
    assert.strictEqual(page.details.subgroupList.groups[5].title, 'learner group 0 6');
    assert.strictEqual(page.details.subgroupList.groups[6].title, 'learner group 0 7');
    assert.strictEqual(page.details.subgroupList.groups[7].title, 'learner group 1');
    assert.strictEqual(page.details.subgroupList.groups[8].title, 'learner group 2');
  });

  test('copy learnergroup without learners', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const programYear = this.server.create('programYear', { program: this.program });
    const cohort = this.server.create('cohort', {
      programYear,
    });
    const parent = this.server.create('learnerGroup', {
      cohort,
    });
    const subGroup = this.server.create('learnerGroup', {
      cohort,
      parent,
    });
    this.server.createList('learnerGroup', 2, {
      cohort,
      parent: subGroup,
    });

    await page.visit({ learnerGroupId: 1 });

    assert.strictEqual(page.details.subgroupList.groups.length, 1);
    assert.strictEqual(page.details.subgroupList.groups[0].title, 'learner group 1');
    assert.strictEqual(page.details.subgroupList.groups[0].members, '0');
    assert.strictEqual(page.details.subgroupList.groups[0].subgroups, '2');
    await page.details.subgroupList.groups[0].actions.copy();
    await page.details.subgroupList.confirmCopy.confirmWithoutLearners();

    assert.strictEqual(page.details.subgroupList.groups.length, 2);
    assert.strictEqual(page.details.subgroupList.groups[0].title, 'learner group 1');
    assert.strictEqual(page.details.subgroupList.groups[0].members, '0');
    assert.strictEqual(page.details.subgroupList.groups[0].subgroups, '2');
    assert.strictEqual(page.details.subgroupList.groups[1].title, 'learner group 1 (Copy)');
    assert.strictEqual(page.details.subgroupList.groups[1].members, '0');
    assert.strictEqual(page.details.subgroupList.groups[1].subgroups, '2');

    await page.visit({ learnerGroupId: 1 });
    assert.strictEqual(page.details.subgroupList.groups.length, 2);
    assert.strictEqual(page.details.subgroupList.groups[0].title, 'learner group 1');
    assert.strictEqual(page.details.subgroupList.groups[0].members, '0');
    assert.strictEqual(page.details.subgroupList.groups[0].subgroups, '2');
    assert.strictEqual(page.details.subgroupList.groups[1].title, 'learner group 1 (Copy)');
    assert.strictEqual(page.details.subgroupList.groups[1].members, '0');
    assert.strictEqual(page.details.subgroupList.groups[1].subgroups, '2');

    await page.details.subgroupList.groups[1].visit();
    assert.strictEqual(currentURL(), '/learnergroups/5');
    assert.strictEqual(page.details.subgroupList.groups.length, 2);
    assert.strictEqual(page.details.subgroupList.groups[0].title, 'learner group 2');
    assert.strictEqual(page.details.subgroupList.groups[0].members, '0');
    assert.strictEqual(page.details.subgroupList.groups[0].subgroups, '0');
    assert.strictEqual(page.details.subgroupList.groups[1].title, 'learner group 3');
    assert.strictEqual(page.details.subgroupList.groups[1].members, '0');
    assert.strictEqual(page.details.subgroupList.groups[1].subgroups, '0');
  });

  test('cannot copy learnergroup with learners', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const users = this.server.createList('user', 3);
    const programYear = this.server.create('programYear', { program: this.program });
    const cohort = this.server.create('cohort', {
      programYear,
    });
    const parent = this.server.create('learnerGroup', {
      cohort,
    });
    const subGroup = this.server.create('learnerGroup', {
      cohort,
      parent,
      users,
    });
    this.server.createList('learnerGroup', 2, {
      cohort,
      parent: subGroup,
    });

    await page.visit({ learnerGroupId: 1 });
    assert.strictEqual(page.details.subgroupList.groups.length, 1);
    assert.strictEqual(page.details.subgroupList.groups[0].title, 'learner group 1');
    assert.strictEqual(page.details.subgroupList.groups[0].members, '3');
    assert.strictEqual(page.details.subgroupList.groups[0].subgroups, '2');
    await page.details.subgroupList.groups[0].actions.copy();
    assert.notOk(page.details.subgroupList.confirmCopy.canCopyWithLearners);
    assert.ok(page.details.subgroupList.confirmCopy.canCopyWithoutLearners);
  });

  test('cannot copy learnergroup with learners in subgroup', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const users = this.server.createList('user', 3);
    const programYear = this.server.create('programYear', { program: this.program });
    const cohort = this.server.create('cohort', {
      programYear,
    });
    const parent = this.server.create('learnerGroup', {
      cohort,
    });
    const subGroup = this.server.create('learnerGroup', {
      cohort,
      parent,
    });
    this.server.create('learnerGroup', {
      cohort,
      parent: subGroup,
      users,
    });
    this.server.create('learnerGroup', {
      cohort,
      parent: subGroup,
    });

    await page.visit({ learnerGroupId: 1 });
    assert.strictEqual(page.details.subgroupList.groups.length, 1);
    assert.strictEqual(page.details.subgroupList.groups[0].title, 'learner group 1');
    assert.strictEqual(page.details.subgroupList.groups[0].members, '0');
    assert.strictEqual(page.details.subgroupList.groups[0].subgroups, '2');
    await page.details.subgroupList.groups[0].actions.copy();
    assert.notOk(page.details.subgroupList.confirmCopy.canCopyWithLearners);
    assert.ok(page.details.subgroupList.confirmCopy.canCopyWithoutLearners);
  });

  test('Cohort members not in learner group appear after navigating to learner group #3428', async function (assert) {
    this.server.create('programYear', { program: this.program });
    const cohort = this.server.create('cohort', {
      programYearId: 1,
    });
    const learnerGroup = this.server.create('learnerGroup', {
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
    assert.strictEqual(page.details.userManager.usersInCurrentGroup.length, 5);
    assert.strictEqual(page.details.cohortUserManager.users.length, 5);
  });

  test('learner group calendar', async function (assert) {
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

    await page.visit({ learnerGroupId: 1 });
    assert.ok(page.details.actions.buttons.toggle.firstButton.isChecked);
    assert.notOk(page.details.calendar.isVisible);
    assert.strictEqual(page.details.calendar.calendar.events.length, 0);
    await page.details.actions.buttons.toggle.secondButton.click();
    assert.ok(page.details.actions.buttons.toggle.secondButton.isChecked);
    assert.ok(page.details.calendar.isVisible);
    assert.strictEqual(page.details.calendar.calendar.events.length, 1);
    await page.details.actions.buttons.toggle.firstButton.click();
    assert.ok(page.details.actions.buttons.toggle.firstButton.isChecked);
    assert.notOk(page.details.calendar.isVisible);
    assert.strictEqual(page.details.calendar.calendar.events.length, 0);
  });

  test('learner group calendar with subgroup events', async function (assert) {
    const programYear = this.server.create('programYear', { program: this.program });
    const cohort = this.server.create('cohort', { programYear });
    const learnerGroup = this.server.create('learnerGroup', { cohort });
    const course = this.server.create('course', { cohorts: [cohort] });
    const session = this.server.create('session', { course });
    const subgroup = this.server.create('learnerGroup', {
      cohort,
      parent: learnerGroup,
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

    await page.visit({ learnerGroupId: 1 });
    assert.strictEqual(page.details.calendar.calendar.events.length, 0);
    assert.notOk(page.details.calendar.calendar.isVisible);
    await page.details.actions.buttons.toggle.secondButton.click();
    assert.strictEqual(page.details.calendar.calendar.events.length, 1);
    assert.ok(page.details.calendar.calendar.isVisible);
    await page.details.calendar.showSubgroups.toggle.handle.click();
    assert.strictEqual(page.details.calendar.calendar.events.length, 2);
  });

  test('Learners with missing parent group affiliation still appear in subgroup manager #3476', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('programYear', { program: this.program });
    const cohort = this.server.create('cohort', {
      programYearId: 1,
    });
    const learnerGroup = this.server.create('learnerGroup', {
      cohort,
    });
    const subGroup = this.server.create('learnerGroup', {
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
    assert.strictEqual(page.details.userManager.usersInCurrentGroup.length, 1);
    await page.details.actions.buttons.manageUsers.click();
    assert.strictEqual(page.details.userManager.usersInCurrentGroup.length, 1);
    assert.strictEqual(page.details.userManager.usersNotInCurrentGroup.length, 2);
  });

  test('moving learners to group updates count #3570', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const programYear = this.server.create('programYear', { program: this.program });
    const cohort = this.server.create('cohort', { programYear });
    const learnerGroup = this.server.create('learnerGroup', { cohort });
    this.server.createList('user', 2, {
      cohorts: [cohort],
      learnerGroups: [learnerGroup],
    });
    this.server.createList('user', 2, { cohorts: [cohort] });

    await page.visit({ learnerGroupId: 1 });
    await page.details.actions.buttons.manageUsers.click();
    assert.strictEqual(page.details.userManager.usersInCurrentGroup.length, 2);
    assert.strictEqual(page.details.cohortUserManager.users.length, 2);
    assert.strictEqual(page.details.header.members, 'Members: 2 / 4');
    await page.details.cohortUserManager.users[0].add();
    assert.strictEqual(page.details.userManager.usersInCurrentGroup.length, 3);
    assert.strictEqual(page.details.cohortUserManager.users.length, 1);
    assert.strictEqual(page.details.header.members, 'Members: 3 / 4');
  });

  test('moving learners out of group updates count #3570', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const programYear = this.server.create('programYear', { program: this.program });
    const cohort = this.server.create('cohort', { programYear });
    const learnerGroup = this.server.create('learnerGroup', { cohort });
    this.server.createList('user', 2, {
      cohorts: [cohort],
      learnerGroups: [learnerGroup],
    });
    this.server.createList('user', 2, { cohorts: [cohort] });

    await page.visit({ learnerGroupId: 1 });
    await page.details.actions.buttons.manageUsers.click();
    assert.strictEqual(page.details.userManager.usersInCurrentGroup.length, 2);
    assert.strictEqual(page.details.cohortUserManager.users.length, 2);
    assert.strictEqual(page.details.header.members, 'Members: 2 / 4');

    await page.details.userManager.usersInCurrentGroup[0].remove();
    assert.strictEqual(page.details.userManager.usersInCurrentGroup.length, 1);
    assert.strictEqual(page.details.cohortUserManager.users.length, 3);
    assert.strictEqual(page.details.header.members, 'Members: 1 / 4');
  });

  test('manage subgroup members does not duplicate members #3936', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const programYear = this.server.create('programYear', { program: this.program });
    const cohort = this.server.create('cohort', { programYear });
    const parent = this.server.create('learnerGroup', { cohort });
    const child = this.server.create('learnerGroup', { cohort, parent });
    this.server.createList('user', 2, { cohorts: [cohort], learnerGroups: [parent, child] });

    await page.visit({ learnerGroupId: child.id });
    await page.details.actions.buttons.manageUsers.click();
    const users = page.details.userManager.usersInCurrentGroup;
    assert.strictEqual(users.length, 2);
    assert.strictEqual(users[0].name.userNameInfo.fullName, '1 guy M. Mc1son');
    assert.strictEqual(users[1].name.userNameInfo.fullName, '2 guy M. Mc2son');
  });
});
