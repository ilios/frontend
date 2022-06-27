import { currentRouteName, currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from 'ilios/tests/pages/learner-groups';
import learnerGroupPage from 'ilios/tests/pages/learner-group';

module('Acceptance | Learner Groups', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
  });

  test('visiting /learnergroups', async function (assert) {
    await page.visit();
    assert.strictEqual(currentRouteName(), 'learner-groups');
  });

  test('single option filters', async function (assert) {
    assert.expect(6);
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('programYear', { program });
    this.server.create('cohort', { programYear });
    await page.visit();
    assert.notOk(page.schoolFilter.hasMany);
    assert.strictEqual(page.schoolFilter.text, 'school 0');
    assert.notOk(page.programFilter.hasMany);
    assert.strictEqual(page.programFilter.text, 'program 0');
    assert.notOk(page.programYearFilter.hasMany);
    assert.strictEqual(page.programYearFilter.text, 'cohort 0');
  });

  test('multiple options filter', async function (assert) {
    assert.expect(31);
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('programYear', { program });
    const cohort = this.server.create('cohort', { programYear });
    const program2 = this.server.create('program', { school: this.school });
    const programYear3 = this.server.create('programYear', { program: program2 });
    const programYear2 = this.server.create('programYear', { program });
    this.server.create('cohort', { programYear: programYear2 });
    const cohort3 = this.server.create('cohort', { programYear: programYear3 });
    this.server.create('learnerGroup', { cohort });
    this.server.create('learnerGroup', { cohort: cohort3 });
    this.server.create('school');

    await page.visit();
    assert.ok(page.schoolFilter.hasMany);
    assert.strictEqual(page.schoolFilter.schools.length, 2);
    assert.strictEqual(page.schoolFilter.schools[0].text, 'school 0');
    assert.strictEqual(page.schoolFilter.schools[0].value, '1');
    assert.strictEqual(page.schoolFilter.schools[1].text, 'school 1');
    assert.strictEqual(page.schoolFilter.schools[1].value, '2');
    assert.strictEqual(page.schoolFilter.selectedSchool, '1');

    assert.ok(page.programFilter.hasMany);
    assert.strictEqual(page.programFilter.programs.length, 2);
    assert.strictEqual(page.programFilter.programs[0].text, 'program 0');
    assert.strictEqual(page.programFilter.programs[0].value, '1');
    assert.strictEqual(page.programFilter.programs[1].text, 'program 1');
    assert.strictEqual(page.programFilter.programs[1].value, '2');
    assert.strictEqual(page.programFilter.selectedProgram, '1');

    assert.ok(page.programYearFilter.hasMany);
    assert.strictEqual(page.programYearFilter.programYears.length, 2);
    assert.strictEqual(page.programYearFilter.programYears[0].text, 'cohort 1');
    assert.strictEqual(page.programYearFilter.programYears[0].value, '3');
    assert.strictEqual(page.programYearFilter.programYears[1].text, 'cohort 0');
    assert.strictEqual(page.programYearFilter.programYears[1].value, '1');
    assert.strictEqual(page.programYearFilter.selectedProgramYear, '3');

    assert.strictEqual(page.headerTitle, 'Learner Groups (0)');
    assert.ok(page.list.isEmpty);

    await page.programYearFilter.select(1);
    assert.strictEqual(page.headerTitle, 'Learner Groups (1)');
    assert.strictEqual(page.list.items.length, 1);

    assert.strictEqual(page.list.items[0].title, 'learner group 0');

    await page.programFilter.select(2);
    assert.notOk(page.programYearFilter.hasMany);
    assert.strictEqual(page.programYearFilter.text, 'cohort 2');
    assert.strictEqual(page.headerTitle, 'Learner Groups (1)');
    assert.strictEqual(page.list.items.length, 1);
    assert.strictEqual(page.list.items[0].title, 'learner group 1');
  });

  test('list groups', async function (assert) {
    this.server.createList('user', 11);
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('programYear', { program });
    const cohort = this.server.create('cohort', { programYear });
    const firstLearnerGroup = this.server.create('learnerGroup', {
      cohort,
      userIds: [2, 3, 4, 5, 6],
    });
    this.server.create('learnerGroup', {
      cohort,
    });
    const firstChildGroup = this.server.create('learnerGroup', {
      parent: firstLearnerGroup,
      userIds: [7, 8],
    });
    this.server.create('learnerGroup', {
      parent: firstLearnerGroup,
      userIds: [9, 10],
    });
    this.server.create('learnerGroup', {
      parent: firstChildGroup,
      userIds: [11, 12],
    });
    this.server.createList('offering', 2, {
      learnerGroups: [firstLearnerGroup],
    });

    await page.visit();
    assert.strictEqual(page.headerTitle, 'Learner Groups (2)');
    assert.strictEqual(page.list.items.length, 2);
    assert.strictEqual(page.list.items[0].title, 'learner group 0');
    assert.strictEqual(page.list.items[0].users, '5');
    assert.strictEqual(page.list.items[0].children, '2');
    assert.strictEqual(page.list.items[1].title, 'learner group 1');
    assert.strictEqual(page.list.items[1].users, '0');
    assert.strictEqual(page.list.items[1].children, '0');
  });

  test('filters by title', async function (assert) {
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('programYear', { program });
    const cohort = this.server.create('cohort', { programYear });
    const firstLearnerGroup = this.server.create('learnerGroup', {
      title: 'specialfirstlearnergroup',
      cohort,
    });
    const secondLearnerGroup = this.server.create('learnerGroup', {
      title: 'specialsecondlearnergroup',
      cohort,
    });
    const regularLearnerGroup = this.server.create('learnerGroup', {
      title: 'regularlearnergroup',
      cohort,
    });
    await page.visit();
    assert.strictEqual(page.headerTitle, 'Learner Groups (3)');
    assert.strictEqual(page.list.items.length, 3);
    assert.strictEqual(page.list.items[0].title, regularLearnerGroup.title);
    assert.strictEqual(page.list.items[1].title, firstLearnerGroup.title);
    assert.strictEqual(page.list.items[2].title, secondLearnerGroup.title);

    await page.setTitleFilter('first');
    assert.strictEqual(page.headerTitle, 'Learner Groups (1)');
    assert.strictEqual(page.list.items.length, 1);
    assert.strictEqual(page.list.items[0].title, firstLearnerGroup.title);

    await page.setTitleFilter('   first     ');
    assert.strictEqual(page.headerTitle, 'Learner Groups (1)');
    assert.strictEqual(page.list.items.length, 1);
    assert.strictEqual(page.list.items[0].title, firstLearnerGroup.title);

    await page.setTitleFilter('second');
    assert.strictEqual(page.headerTitle, 'Learner Groups (1)');
    assert.strictEqual(page.list.items.length, 1);
    assert.strictEqual(page.list.items[0].title, secondLearnerGroup.title);

    await page.setTitleFilter('special');
    assert.strictEqual(page.headerTitle, 'Learner Groups (2)');
    assert.strictEqual(page.list.items.length, 2);
    assert.strictEqual(page.list.items[0].title, firstLearnerGroup.title);
    assert.strictEqual(page.list.items[1].title, secondLearnerGroup.title);

    await page.setTitleFilter('');
    assert.strictEqual(page.headerTitle, 'Learner Groups (3)');
    assert.strictEqual(page.list.items.length, 3);
    assert.strictEqual(page.list.items[0].title, regularLearnerGroup.title);
    assert.strictEqual(page.list.items[1].title, firstLearnerGroup.title);
    assert.strictEqual(page.list.items[2].title, secondLearnerGroup.title);
  });

  test('add new learnergroup', async function (assert) {
    assert.expect(10);
    this.user.update({ administeredSchools: [this.school] });

    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('programYear', { program });
    this.server.create('cohort', { programYear });

    const newTitle = 'A New Test Title';
    await page.visit();
    assert.strictEqual(page.headerTitle, 'Learner Groups (0)');

    assert.ok(page.list.isEmpty);
    await page.toggleNewLearnerGroupForm();
    assert.ok(page.newLearnerGroupForm.single.isVisible);
    await page.newLearnerGroupForm.single.title(newTitle);
    assert.notOk(page.newLearnerGroupForm.single.willFill);
    await page.newLearnerGroupForm.single.save();

    assert.strictEqual(page.savedResult, `${newTitle} Saved Successfully`);
    assert.strictEqual(page.headerTitle, 'Learner Groups (1)');
    assert.strictEqual(page.list.items.length, 1);
    assert.strictEqual(page.list.items[0].title, newTitle);
    assert.strictEqual(page.list.items[0].users, '0');
    assert.strictEqual(page.list.items[0].children, '0');
  });

  test('cancel adding new learnergroup', async function (assert) {
    assert.expect(6);
    this.user.update({ administeredSchools: [this.school] });
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('programYear', { program });
    const cohort = this.server.create('cohort', { programYear });
    this.server.create('learnerGroup', { cohort });

    await page.visit();

    assert.strictEqual(page.list.items.length, 1);
    assert.strictEqual(page.list.items[0].title, 'learner group 0');
    await page.toggleNewLearnerGroupForm();
    assert.ok(page.newLearnerGroupForm.single.isVisible);
    await page.newLearnerGroupForm.single.cancel();
    assert.notOk(page.newLearnerGroupForm.single.isVisible);

    assert.strictEqual(page.list.items.length, 1);
    assert.strictEqual(page.list.items[0].title, 'learner group 0');
  });

  test('remove learnergroup', async function (assert) {
    assert.expect(7);
    this.user.update({ administeredSchools: [this.school] });

    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('programYear', { program });
    const cohort = this.server.create('cohort', { programYear });
    const parent = this.server.create('learnerGroup', { cohort });
    this.server.create('learnerGroup', { cohort, parent });

    await page.visit();
    assert.strictEqual(page.headerTitle, 'Learner Groups (1)');
    assert.strictEqual(page.list.items.length, 1);
    assert.strictEqual(page.list.items[0].title, 'learner group 0');
    assert.strictEqual(page.list.items[0].children, '1');
    assert.ok(page.list.items[0].canBeDeleted);
    await page.list.items[0].remove();
    await page.list.confirmRemoval.confirm();
    assert.strictEqual(page.headerTitle, 'Learner Groups (0)');
    assert.ok(page.list.isEmpty);
  });

  test('cancel remove learnergroup', async function (assert) {
    assert.expect(5);
    this.user.update({ administeredSchools: [this.school] });

    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('programYear', { program });
    const cohort = this.server.create('cohort', { programYear });
    this.server.create('learnerGroup', { cohort });
    await page.visit();
    assert.strictEqual(page.list.items.length, 1);
    assert.strictEqual(page.list.items[0].title, 'learner group 0');
    assert.ok(page.list.items[0].canBeDeleted);
    await page.list.items[0].remove();
    await page.list.confirmRemoval.cancel();

    assert.strictEqual(page.list.items.length, 1);
    assert.strictEqual(page.list.items[0].title, 'learner group 0');
  });

  test('confirmation of remove message', async function (assert) {
    assert.expect(5);
    this.user.update({ administeredSchools: [this.school] });

    this.server.createList('user', 5);
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('programYear', { program });
    const cohort = this.server.create('cohort', { programYear });
    const parent = this.server.create('learnerGroup', { cohort });
    this.server.createList('learnerGroup', 2, { parent });
    this.server.createList('offering', 2, {
      learnerGroups: [parent],
    });

    await page.visit();
    assert.strictEqual(page.list.items.length, 1);
    assert.strictEqual(page.list.items[0].title, 'learner group 0');
    assert.ok(page.list.items[0].canBeDeleted);
    await page.list.items[0].remove();
    assert.ok(page.list.items[0].hasRemoveStyle);
    assert.strictEqual(
      page.list.confirmRemoval.text,
      'Are you sure you want to delete this learner group, with 2 subgroups? This action cannot be undone. Yes Cancel'
    );
  });

  test('populated learner groups are not deletable', async function (assert) {
    assert.expect(3);
    this.user.update({ administeredSchools: [this.school] });

    this.server.createList('user', 5);
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('programYear', { program });
    const cohort = this.server.create('cohort', { programYear });
    this.server.create('learnerGroup', {
      cohort,
      userIds: [2, 3, 4],
    });

    await page.visit();
    assert.strictEqual(page.list.items.length, 1);
    assert.strictEqual(page.list.items[0].title, 'learner group 0');
    assert.notOk(page.list.items[0].canBeDeleted);
  });

  test('learner groups with courses cannot be deleted', async function (assert) {
    assert.expect(7);
    this.user.update({ administeredSchools: [this.school] });

    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('programYear', { program });
    const cohort = this.server.create('cohort', { programYear });
    const course = this.server.create('course');
    const session = this.server.create('session', { course });
    const offering = this.server.create('offering', { session });
    this.server.create('learnerGroup', {
      cohort,
      offerings: [offering],
    });

    await page.visit();
    assert.strictEqual(page.list.items.length, 1);
    assert.strictEqual(page.list.items[0].title, 'learner group 0');
    assert.ok(page.list.items[0].canBeDeleted);

    await page.list.items[0].remove();
    assert.strictEqual(
      page.list.confirmRemoval.text,
      'This group is attached to one course and cannot be deleted. 2013 course 0 OK'
    );
    assert.notOk(page.list.confirmRemoval.canConfirm);
    assert.ok(page.list.confirmRemoval.canCancel);
    await page.list.confirmRemoval.cancel();
    assert.strictEqual(page.list.items.length, 1);
  });

  test('course academic year shows range if applicable by configuration', async function (assert) {
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    this.server.get('application/config', function () {
      return {
        config: {
          apiVersion,
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    this.user.update({ administeredSchools: [this.school] });

    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('programYear', { program });
    const cohort = this.server.create('cohort', { programYear });
    const course = this.server.create('course');
    const session = this.server.create('session', { course });
    const offering = this.server.create('offering', { session });
    this.server.create('learnerGroup', {
      cohort,
      offerings: [offering],
    });

    await page.visit();
    await page.list.items[0].remove();
    assert.strictEqual(
      page.list.confirmRemoval.text,
      'This group is attached to one course and cannot be deleted. 2013 - 2014 course 0 OK'
    );
  });

  test('click title takes you to learnergroup route', async function (assert) {
    assert.expect(3);
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('programYear', { program });
    const cohort = this.server.create('cohort', { programYear });
    this.server.create('learnerGroup', { cohort });

    await page.visit();
    assert.strictEqual(page.list.items.length, 1);
    assert.strictEqual(page.list.items[0].title, 'learner group 0');
    await page.list.items[0].clickTitle();
    assert.strictEqual(currentURL(), '/learnergroups/1');
  });

  test('add new learnergroup with full cohort', async function (assert) {
    assert.expect(8);
    this.user.update({ administeredSchools: [this.school] });
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('programYear', { program });
    const cohort = this.server.create('cohort', { programYear });
    this.server.createList('user', 5, {
      cohorts: [cohort],
    });

    const newTitle = 'A New Test Title';
    await page.visit();
    assert.ok(page.list.isEmpty);
    await page.toggleNewLearnerGroupForm();
    assert.ok(page.newLearnerGroupForm.single.isVisible);
    await page.newLearnerGroupForm.single.title(newTitle);
    await page.newLearnerGroupForm.single.fillWithCohort();
    assert.ok(page.newLearnerGroupForm.single.willFill);
    await page.newLearnerGroupForm.single.save();

    assert.strictEqual(page.savedResult, `${newTitle} Saved Successfully`);
    assert.strictEqual(page.list.items.length, 1);
    assert.strictEqual(page.list.items[0].title, newTitle);
    assert.strictEqual(page.list.items[0].users, '5');
    assert.strictEqual(page.list.items[0].children, '0');
  });

  test('no add button when there is no cohort', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });

    await page.visit();
    assert.strictEqual(currentRouteName(), 'learner-groups');
    assert.notOk(page.hasNewGroupToggle);
  });

  test('title filter escapes regex', async function (assert) {
    assert.expect(5);
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('programYear', { program });
    const cohort = this.server.create('cohort', { programYear });
    this.server.create('learner-group', { cohort });
    this.server.create('learnerGroup', {
      title: 'yes\\no',
      cohort,
    });

    await page.visit();
    assert.strictEqual(page.list.items.length, 2);
    assert.strictEqual(page.list.items[0].title, 'learner group 0');
    assert.strictEqual(page.list.items[1].title, 'yes\\no');
    await page.setTitleFilter('\\');
    assert.strictEqual(page.list.items.length, 1);
    assert.strictEqual(page.list.items[0].title, 'yes\\no');
  });

  test('copy learnergroup without learners', async function (assert) {
    assert.expect(23);
    this.user.update({ administeredSchools: [this.school] });

    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('programYear', { program });
    const cohort = this.server.create('cohort', { programYear });
    const parent = this.server.create('learnerGroup', { cohort });
    const parent2 = this.server.create('learnerGroup', {
      cohort,
      parent,
    });
    this.server.create('learnerGroup', {
      cohort,
      parent,
    });
    this.server.create('learnerGroup', {
      cohort,
      parent: parent2,
    });

    await page.visit();

    assert.strictEqual(page.list.items.length, 1);
    assert.strictEqual(page.list.items[0].title, 'learner group 0');
    assert.strictEqual(page.list.items[0].users, '0');
    assert.strictEqual(page.list.items[0].children, '2');
    assert.ok(page.list.items[0].canBeCopied);
    await page.list.items[0].copy();
    assert.ok(page.list.confirmCopy.canCopyWithoutLearners);
    assert.ok(page.list.confirmCopy.canCopyWithLearners);
    await page.list.confirmCopy.copyWithoutLearners();

    assert.strictEqual(page.list.items.length, 2);
    assert.strictEqual(page.list.items[0].title, 'learner group 0');
    assert.strictEqual(page.list.items[0].users, '0');
    assert.strictEqual(page.list.items[0].children, '2');
    assert.strictEqual(page.list.items[1].title, 'learner group 0 (Copy)');
    assert.strictEqual(page.list.items[1].users, '0');
    assert.strictEqual(page.list.items[1].children, '2');

    await page.list.items[0].clickTitle();
    assert.strictEqual(currentURL(), '/learnergroups/1');
    await page.visit();
    await page.list.items[1].clickTitle();
    assert.strictEqual(currentURL(), '/learnergroups/5');

    assert.strictEqual(learnerGroupPage.details.subgroupList.groups.length, 2);
    assert.strictEqual(learnerGroupPage.details.subgroupList.groups[0].title, 'learner group 1');
    assert.strictEqual(learnerGroupPage.details.subgroupList.groups[0].members, '0');
    assert.strictEqual(learnerGroupPage.details.subgroupList.groups[0].subgroups, '1');
    assert.strictEqual(learnerGroupPage.details.subgroupList.groups[1].title, 'learner group 2');
    assert.strictEqual(learnerGroupPage.details.subgroupList.groups[1].members, '0');
    assert.strictEqual(learnerGroupPage.details.subgroupList.groups[1].subgroups, '0');
  });

  test('copy learnergroup with learners', async function (assert) {
    assert.expect(23);
    this.user.update({ administeredSchools: [this.school] });

    this.server.createList('user', 10);
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('programYear', { program });
    const cohort = this.server.create('cohort', { programYear });
    const parent = this.server.create('learnerGroup', {
      cohort,
      userIds: [2, 3, 4, 5, 6, 7, 8],
    });
    const parent2 = this.server.create('learnerGroup', {
      cohort,
      parent,
      userIds: [8],
    });
    this.server.create('learnerGroup', {
      cohort,
      parent,
      userIds: [5, 6, 7],
    });
    this.server.create('learnerGroup', {
      cohort,
      parent: parent2,
      userIds: [8],
    });

    await page.visit();

    assert.strictEqual(page.list.items.length, 1);
    assert.strictEqual(page.list.items[0].title, 'learner group 0');
    assert.strictEqual(page.list.items[0].users, '7');
    assert.strictEqual(page.list.items[0].children, '2');
    assert.ok(page.list.items[0].canBeCopied);
    await page.list.items[0].copy();
    assert.ok(page.list.confirmCopy.canCopyWithoutLearners);
    assert.ok(page.list.confirmCopy.canCopyWithLearners);
    await page.list.confirmCopy.copyWithLearners();

    assert.strictEqual(page.list.items.length, 2);
    assert.strictEqual(page.list.items[0].title, 'learner group 0');
    assert.strictEqual(page.list.items[0].users, '7');
    assert.strictEqual(page.list.items[0].children, '2');
    assert.strictEqual(page.list.items[1].title, 'learner group 0 (Copy)');
    assert.strictEqual(page.list.items[1].users, '7');
    assert.strictEqual(page.list.items[1].children, '2');

    await page.list.items[0].clickTitle();
    assert.strictEqual(currentURL(), '/learnergroups/1');
    await page.visit();
    await page.list.items[1].clickTitle();
    assert.strictEqual(currentURL(), '/learnergroups/5');

    assert.strictEqual(learnerGroupPage.details.subgroupList.groups.length, 2);
    assert.strictEqual(learnerGroupPage.details.subgroupList.groups[0].title, 'learner group 1');
    assert.strictEqual(learnerGroupPage.details.subgroupList.groups[0].members, '1');
    assert.strictEqual(learnerGroupPage.details.subgroupList.groups[0].subgroups, '1');
    assert.strictEqual(learnerGroupPage.details.subgroupList.groups[1].title, 'learner group 2');
    assert.strictEqual(learnerGroupPage.details.subgroupList.groups[1].members, '3');
    assert.strictEqual(learnerGroupPage.details.subgroupList.groups[1].subgroups, '0');
  });
});
