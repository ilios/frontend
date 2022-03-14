import { currentURL } from '@ember/test-helpers';
import { test, module } from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
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

    assert.expect(8);

    await page.visit({ learnerGroupId: 1 });
    await page.overview.manage();
    assert.strictEqual(page.overview.learnerGroupUserManager.usersInCurrentGroup.length, 0);
    assert.strictEqual(page.usersInCohort.list.length, 2);
    assert.strictEqual(page.usersInCohort.list[0].name.userNameInfo.fullName, '1 guy M. Mc1son');
    assert.strictEqual(page.usersInCohort.list[1].name.userNameInfo.fullName, '2 guy M. Mc2son');

    await page.usersInCohort.list[0].add();

    assert.strictEqual(page.overview.learnerGroupUserManager.usersInCurrentGroup.length, 1);
    assert.strictEqual(
      page.overview.learnerGroupUserManager.usersInCurrentGroup[0].name.userNameInfo.fullName,
      '1 guy M. Mc1son'
    );
    assert.strictEqual(page.usersInCohort.list.length, 1);
    assert.strictEqual(page.usersInCohort.list[0].name.userNameInfo.fullName, '2 guy M. Mc2son');
  });

  test('remove learners individually from group', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const programYear = this.server.create('programYear', { program: this.program });
    const cohort = this.server.create('cohort', { programYear });
    const learnerGroup = this.server.create('learnerGroup', { cohort });
    this.server.createList('user', 2, { cohorts: [cohort], learnerGroups: [learnerGroup] });

    assert.expect(8);

    await page.visit({ learnerGroupId: 1 });
    await page.overview.manage();
    assert.strictEqual(page.overview.learnerGroupUserManager.usersInCurrentGroup.length, 2);
    assert.strictEqual(
      page.overview.learnerGroupUserManager.usersInCurrentGroup[0].name.userNameInfo.fullName,
      '1 guy M. Mc1son'
    );
    assert.strictEqual(
      page.overview.learnerGroupUserManager.usersInCurrentGroup[1].name.userNameInfo.fullName,
      '2 guy M. Mc2son'
    );
    assert.strictEqual(page.usersInCohort.list.length, 0);

    await page.overview.learnerGroupUserManager.usersInCurrentGroup[0].remove();

    assert.strictEqual(page.overview.learnerGroupUserManager.usersInCurrentGroup.length, 1);
    assert.strictEqual(
      page.overview.learnerGroupUserManager.usersInCurrentGroup[0].name.userNameInfo.fullName,
      '2 guy M. Mc2son'
    );
    assert.strictEqual(page.usersInCohort.list.length, 1);
    assert.strictEqual(page.usersInCohort.list[0].name.userNameInfo.fullName, '1 guy M. Mc1son');
  });

  test('generate new subgroups', async function (assert) {
    assert.expect(23);
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
    assert.strictEqual(page.subgroups.groups.length, 2);
    assert.strictEqual(page.subgroups.groups[0].title, 'learner group 1');
    assert.strictEqual(page.subgroups.groups[1].title, 'learner group 2');

    await page.subgroups.toggleNewForm();
    assert.ok(page.subgroups.newForm.singleGroupSelected);
    assert.notOk(page.subgroups.newForm.multipleGroupSelected);
    await page.subgroups.newForm.chooseMultipleGroups();
    await page.subgroups.newForm.multiple.setNumberOfGroups(5);
    await page.subgroups.newForm.multiple.save();

    assert.strictEqual(page.subgroups.groups.length, 7);
    assert.strictEqual(page.subgroups.groups[0].title, 'learner group 0 1');
    assert.strictEqual(page.subgroups.groups[1].title, 'learner group 0 2');
    assert.strictEqual(page.subgroups.groups[2].title, 'learner group 0 3');
    assert.strictEqual(page.subgroups.groups[3].title, 'learner group 0 4');
    assert.strictEqual(page.subgroups.groups[4].title, 'learner group 0 5');
    assert.strictEqual(page.subgroups.groups[5].title, 'learner group 1');
    assert.strictEqual(page.subgroups.groups[6].title, 'learner group 2');

    // add two more subgroups
    await page.subgroups.toggleNewForm();
    await page.subgroups.newForm.chooseMultipleGroups();
    await page.subgroups.newForm.multiple.setNumberOfGroups(2);
    await page.subgroups.newForm.multiple.save();

    assert.strictEqual(page.subgroups.groups.length, 9);
    assert.strictEqual(page.subgroups.groups[0].title, 'learner group 0 1');
    assert.strictEqual(page.subgroups.groups[1].title, 'learner group 0 2');
    assert.strictEqual(page.subgroups.groups[2].title, 'learner group 0 3');
    assert.strictEqual(page.subgroups.groups[3].title, 'learner group 0 4');
    assert.strictEqual(page.subgroups.groups[4].title, 'learner group 0 5');
    assert.strictEqual(page.subgroups.groups[5].title, 'learner group 0 6');
    assert.strictEqual(page.subgroups.groups[6].title, 'learner group 0 7');

    assert.strictEqual(page.subgroups.groups[7].title, 'learner group 1');
    assert.strictEqual(page.subgroups.groups[8].title, 'learner group 2');
  });

  test('copy learnergroup without learners', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(26);
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

    assert.strictEqual(page.subgroups.groups.length, 1);
    assert.strictEqual(page.subgroups.groups[0].title, 'learner group 1');
    assert.strictEqual(page.subgroups.groups[0].members, '0');
    assert.strictEqual(page.subgroups.groups[0].subgroups, '2');
    await page.subgroups.groups[0].actions.copy();
    await page.subgroups.confirmCopy.confirmWithoutLearners();

    assert.strictEqual(page.subgroups.groups.length, 2);
    assert.strictEqual(page.subgroups.groups[0].title, 'learner group 1');
    assert.strictEqual(page.subgroups.groups[0].members, '0');
    assert.strictEqual(page.subgroups.groups[0].subgroups, '2');
    assert.strictEqual(page.subgroups.groups[1].title, 'learner group 1 (Copy)');
    assert.strictEqual(page.subgroups.groups[1].members, '0');
    assert.strictEqual(page.subgroups.groups[1].subgroups, '2');

    await page.visit({ learnerGroupId: 1 });
    assert.strictEqual(page.subgroups.groups.length, 2);
    assert.strictEqual(page.subgroups.groups[0].title, 'learner group 1');
    assert.strictEqual(page.subgroups.groups[0].members, '0');
    assert.strictEqual(page.subgroups.groups[0].subgroups, '2');
    assert.strictEqual(page.subgroups.groups[1].title, 'learner group 1 (Copy)');
    assert.strictEqual(page.subgroups.groups[1].members, '0');
    assert.strictEqual(page.subgroups.groups[1].subgroups, '2');

    await page.subgroups.groups[1].visit();
    assert.strictEqual(currentURL(), '/learnergroups/5');
    assert.strictEqual(page.subgroups.groups.length, 2);
    assert.strictEqual(page.subgroups.groups[0].title, 'learner group 2');
    assert.strictEqual(page.subgroups.groups[0].members, '0');
    assert.strictEqual(page.subgroups.groups[0].subgroups, '0');
    assert.strictEqual(page.subgroups.groups[1].title, 'learner group 3');
    assert.strictEqual(page.subgroups.groups[1].members, '0');
    assert.strictEqual(page.subgroups.groups[1].subgroups, '0');
  });

  test('cannot copy learnergroup with learners', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(6);
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
    assert.strictEqual(page.subgroups.groups.length, 1);
    assert.strictEqual(page.subgroups.groups[0].title, 'learner group 1');
    assert.strictEqual(page.subgroups.groups[0].members, '3');
    assert.strictEqual(page.subgroups.groups[0].subgroups, '2');
    await page.subgroups.groups[0].actions.copy();
    assert.notOk(page.subgroups.confirmCopy.canCopyWithLearners);
    assert.ok(page.subgroups.confirmCopy.canCopyWithoutLearners);
  });

  test('cannot copy learnergroup with learners in subgroup', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(6);
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
    assert.strictEqual(page.subgroups.groups.length, 1);
    assert.strictEqual(page.subgroups.groups[0].title, 'learner group 1');
    assert.strictEqual(page.subgroups.groups[0].members, '0');
    assert.strictEqual(page.subgroups.groups[0].subgroups, '2');
    await page.subgroups.groups[0].actions.copy();
    assert.notOk(page.subgroups.confirmCopy.canCopyWithLearners);
    assert.ok(page.subgroups.confirmCopy.canCopyWithoutLearners);
  });

  test('Cohort members not in learner group appear after navigating to learner group #3428', async function (assert) {
    assert.expect(5);
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
    assert.strictEqual(page.overview.learnerGroupUserManager.usersInCurrentGroup.length, 5);
    assert.strictEqual(page.usersInCohort.list.length, 5);
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
    assert.ok(page.overview.displayToggle.firstButton.isChecked);
    assert.notOk(page.overview.calendar.isVisible);
    assert.strictEqual(page.overview.calendar.events.length, 0);
    await page.overview.displayToggle.secondButton.click();
    assert.ok(page.overview.displayToggle.secondButton.isChecked);
    assert.ok(page.overview.calendar.isVisible);
    assert.strictEqual(page.overview.calendar.events.length, 1);
    await page.overview.displayToggle.firstButton.click();
    assert.ok(page.overview.displayToggle.firstButton.isChecked);
    assert.notOk(page.overview.calendar.isVisible);
    assert.strictEqual(page.overview.calendar.events.length, 0);
  });

  test('learner group calendar with subgroup events', async function (assert) {
    assert.expect(5);
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
    assert.strictEqual(page.overview.calendar.events.length, 0);
    assert.notOk(page.overview.calendar.isVisible);
    await page.overview.displayToggle.secondButton.click();
    assert.strictEqual(page.overview.calendar.events.length, 1);
    assert.ok(page.overview.calendar.isVisible);
    await page.overview.calendar.toggleSubgroupEvents();
    assert.strictEqual(page.overview.calendar.events.length, 2);
  });

  test('Learners with missing parent group affiliation still appear in subgroup manager #3476', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(4);
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
    assert.strictEqual(page.overview.learnerGroupUserManager.usersInCurrentGroup.length, 1);
    await page.overview.manage();
    assert.strictEqual(page.overview.learnerGroupUserManager.usersInCurrentGroup.length, 1);
    assert.strictEqual(page.overview.learnerGroupUserManager.usersNotInCurrentGroup.length, 2);
  });

  test('moving learners to group updates count #3570', async function (assert) {
    assert.expect(6);
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
    await page.overview.manage();
    assert.strictEqual(page.overview.learnerGroupUserManager.usersInCurrentGroup.length, 2);
    assert.strictEqual(page.usersInCohort.list.length, 2);
    assert.strictEqual(page.header.members, 'Members: 2 / 4');

    await page.usersInCohort.list[0].add();

    assert.strictEqual(page.overview.learnerGroupUserManager.usersInCurrentGroup.length, 3);
    assert.strictEqual(page.usersInCohort.list.length, 1);
    assert.strictEqual(page.header.members, 'Members: 3 / 4');
  });

  test('moving learners out of group updates count #3570', async function (assert) {
    assert.expect(6);
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
    await page.overview.manage();
    assert.strictEqual(page.overview.learnerGroupUserManager.usersInCurrentGroup.length, 2);
    assert.strictEqual(page.usersInCohort.list.length, 2);
    assert.strictEqual(page.header.members, 'Members: 2 / 4');

    await page.overview.learnerGroupUserManager.usersInCurrentGroup[0].remove();

    assert.strictEqual(page.overview.learnerGroupUserManager.usersInCurrentGroup.length, 1);
    assert.strictEqual(page.usersInCohort.list.length, 3);
    assert.strictEqual(page.header.members, 'Members: 1 / 4');
  });

  test('manage subgroup members does not duplicate members #3936', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const programYear = this.server.create('programYear', { program: this.program });
    const cohort = this.server.create('cohort', { programYear });
    const parent = this.server.create('learnerGroup', { cohort });
    const child = this.server.create('learnerGroup', { cohort, parent });
    this.server.createList('user', 2, { cohorts: [cohort], learnerGroups: [parent, child] });

    assert.expect(3);

    await page.visit({ learnerGroupId: child.id });
    await page.overview.manage();
    const users = page.overview.learnerGroupUserManager.usersInCurrentGroup;
    assert.strictEqual(users.length, 2);
    assert.strictEqual(users[0].name.userNameInfo.fullName, '1 guy M. Mc1son');
    assert.strictEqual(users[1].name.userNameInfo.fullName, '2 guy M. Mc2son');
  });
});
