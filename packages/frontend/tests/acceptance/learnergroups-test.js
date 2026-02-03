import { currentRouteName, currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest, takeScreenshot } from 'frontend/tests/helpers';
import page from 'frontend/tests/pages/learner-groups';
import learnerGroupPage from 'frontend/tests/pages/learner-group';
import percySnapshot from '@percy/ember';
import { getUniqueName } from '../helpers/percy-snapshot-name';

module('Acceptance | Learner Groups', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school }, true);
    this.sessionType = this.server.create('session-type', { school: this.school });
  });

  test('visiting /learnergroups', async function (assert) {
    await page.visit();
    assert.strictEqual(currentRouteName(), 'learner-groups');
  });

  test('list groups', async function (assert) {
    this.server.createList('user', 11);
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', { programYear });
    const firstLearnerGroup = this.server.create('learner-group', {
      cohort,
      userIds: [2, 3, 4, 5, 6],
    });
    this.server.create('learner-group', {
      cohort,
    });
    const firstChildGroup = this.server.create('learner-group', {
      parent: firstLearnerGroup,
      userIds: [7, 8],
    });
    this.server.create('learner-group', {
      parent: firstLearnerGroup,
      userIds: [9, 10],
    });
    this.server.create('learner-group', {
      parent: firstChildGroup,
      userIds: [11, 12],
    });
    this.server.createList('offering', 2, {
      learnerGroups: [firstLearnerGroup],
    });

    await page.visit();
    await takeScreenshot(assert);
    await percySnapshot(assert);
    assert.ok(page.list.isPresent);
    assert.strictEqual(page.headerTitle, 'Learner Groups (2)');
    assert.strictEqual(page.list.items.length, 2);
    assert.strictEqual(page.list.items[0].title, 'learner group 0');
    assert.strictEqual(page.list.items[0].users, '5');
    assert.strictEqual(page.list.items[0].children, '2');
    assert.strictEqual(page.list.items[1].title, 'learner group 1');
    assert.strictEqual(page.list.items[1].users, '0');
    assert.strictEqual(page.list.items[1].children, '0');
  });

  test('single option filters', async function (assert) {
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('program-year', { program });
    this.server.create('cohort', { programYear });
    await page.visit();
    await takeScreenshot(assert);
    await percySnapshot(assert);
    assert.notOk(page.schoolFilter.hasMany);
    assert.strictEqual(page.schoolFilter.text, 'school 0');
    assert.notOk(page.programFilter.hasMany);
    assert.strictEqual(page.programFilter.text, 'program 0');
    assert.notOk(page.programYearFilter.hasMany);
    assert.strictEqual(page.programYearFilter.text, 'cohort 0');
  });

  test('multiple options filter', async function (assert) {
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', { programYear });
    const program2 = this.server.create('program', { school: this.school });
    const programYear3 = this.server.create('program-year', { program: program2 });
    const programYear2 = this.server.create('program-year', { program });
    this.server.create('cohort', { programYear: programYear2 });
    const cohort3 = this.server.create('cohort', { programYear: programYear3 });
    this.server.create('learner-group', { cohort });
    this.server.create('learner-group', { cohort: cohort3 });
    this.server.create('school');

    await page.visit();
    await takeScreenshot(assert);
    await percySnapshot(assert);
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
    assert.notOk(page.list.isPresent);

    await page.programYearFilter.select(1);
    assert.ok(page.list.isPresent);
    assert.strictEqual(page.headerTitle, 'Learner Groups (1)');
    assert.strictEqual(page.list.items.length, 1);

    assert.strictEqual(page.list.items[0].title, 'learner group 0');

    await page.programFilter.select(2);
    assert.ok(page.list.isPresent);
    assert.notOk(page.programYearFilter.hasMany);
    assert.strictEqual(page.programYearFilter.text, 'cohort 2');
    assert.strictEqual(page.headerTitle, 'Learner Groups (1)');
    assert.strictEqual(page.list.items.length, 1);
    assert.strictEqual(page.list.items[0].title, 'learner group 1');
  });

  test('filters by title', async function (assert) {
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', { programYear });
    const firstLearnerGroup = this.server.create('learner-group', {
      title: 'specialfirstlearnergroup',
      cohort,
    });
    const secondLearnerGroup = this.server.create('learner-group', {
      title: 'specialsecondlearnergroup',
      cohort,
    });
    const regularLearnerGroup = this.server.create('learner-group', {
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
    this.user.update({ administeredSchools: [this.school] });

    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('program-year', { program });
    this.server.create('cohort', { programYear });

    const newTitle = 'A New Test Title';
    await page.visit();
    assert.strictEqual(page.headerTitle, 'Learner Groups (0)');

    assert.notOk(page.list.isPresent);
    await page.toggleNewLearnerGroupForm();
    await takeScreenshot(assert);
    await percySnapshot(assert);
    assert.ok(page.newLearnerGroupForm.single.isVisible);
    await page.newLearnerGroupForm.single.title(newTitle);
    assert.notOk(page.newLearnerGroupForm.single.willFill);
    await page.newLearnerGroupForm.single.save();

    assert.strictEqual(page.savedResult, `${newTitle} saved successfully`);
    assert.ok(page.list.isPresent);
    assert.strictEqual(page.headerTitle, 'Learner Groups (1)');
    assert.strictEqual(page.list.items.length, 1);
    assert.strictEqual(page.list.items[0].title, newTitle);
    assert.strictEqual(page.list.items[0].users, '0');
    assert.strictEqual(page.list.items[0].children, '0');
  });

  test('cancel adding new learnergroup', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', { programYear });
    this.server.create('learner-group', { cohort });

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
    this.user.update({ administeredSchools: [this.school] });

    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', { programYear });
    const parent = this.server.create('learner-group', { cohort });
    this.server.create('learner-group', { cohort, parent });

    await page.visit();
    assert.strictEqual(page.headerTitle, 'Learner Groups (1)');
    assert.strictEqual(page.list.items.length, 1);
    assert.strictEqual(page.list.items[0].title, 'learner group 0');
    assert.strictEqual(page.list.items[0].children, '1');
    assert.ok(page.list.items[0].canBeDeleted);
    await page.list.items[0].remove();
    await takeScreenshot(assert);
    await percySnapshot(assert);
    await page.list.confirmRemoval.confirm();
    assert.strictEqual(page.headerTitle, 'Learner Groups (0)');
    assert.notOk(page.list.isPresent);
  });

  test('cancel remove learnergroup', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });

    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', { programYear });
    this.server.create('learner-group', { cohort });
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
    this.user.update({ administeredSchools: [this.school] });

    this.server.createList('user', 5);
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', { programYear });
    const parent = this.server.create('learner-group', { cohort });
    this.server.createList('learner-group', 2, { parent });
    await page.visit();
    assert.strictEqual(page.list.items.length, 1);
    assert.strictEqual(page.list.items[0].title, 'learner group 0');
    assert.ok(page.list.items[0].canBeDeleted);
    await page.list.items[0].remove();
    assert.ok(page.list.items[0].hasRemoveStyle);
    assert.strictEqual(
      page.list.confirmRemoval.message,
      'Are you sure you want to delete this learner group, with 2 subgroups? This action cannot be undone. Yes Cancel',
    );
  });

  test('populated learner groups are deletable', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });

    this.server.createList('user', 5);
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', { programYear });
    this.server.create('learner-group', {
      cohort,
      userIds: [2, 3, 4],
    });

    await page.visit();
    assert.strictEqual(page.list.items.length, 1);
    assert.strictEqual(page.list.items[0].title, 'learner group 0');
    assert.ok(page.list.items[0].canBeDeleted);
  });

  test('learner groups linked to offerings or ILMs cannot be deleted', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', { programYear });
    const course = this.server.create('course');
    const session = this.server.create('session', { course });
    const ilm = this.server.create('ilm-session', {
      session,
    });
    const offering = this.server.create('offering', { session });
    this.server.create('learner-group', {
      title: 'is linked to offering',
      cohort,
      offerings: [offering],
    });
    this.server.create('learner-group', {
      title: 'is linked to ilm',
      cohort,
      ilmSessions: [ilm],
    });
    const parentGroup1 = this.server.create('learner-group', {
      title: 'has sub-group linked to offering',
      cohort,
    });
    const parentGroup2 = this.server.create('learner-group', {
      title: 'has sub-group linked to ilm',
      cohort,
    });
    this.server.create('learner-group', {
      cohort,
      parent: parentGroup1,
      offerings: [offering],
    });
    this.server.create('learner-group', {
      cohort,
      parent: parentGroup2,
      ilmSessions: [ilm],
    });
    await page.visit();
    await takeScreenshot(assert);
    await percySnapshot(assert);
    assert.strictEqual(page.list.items.length, 4);
    assert.strictEqual(page.list.items[0].title, 'has sub-group linked to ilm');
    assert.notOk(page.list.items[0].canBeDeleted);
    assert.strictEqual(page.list.items[1].title, 'has sub-group linked to offering');
    assert.notOk(page.list.items[1].canBeDeleted);
    assert.strictEqual(page.list.items[2].title, 'is linked to ilm');
    assert.notOk(page.list.items[2].canBeDeleted);
    assert.strictEqual(page.list.items[3].title, 'is linked to offering');
    assert.notOk(page.list.items[3].canBeDeleted);
  });

  test('click title takes you to learnergroup route', async function (assert) {
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', { programYear });
    this.server.create('learner-group', { cohort });

    await page.visit();
    assert.strictEqual(page.list.items.length, 1);
    assert.strictEqual(page.list.items[0].title, 'learner group 0');
    await page.list.items[0].clickTitle();
    assert.strictEqual(currentURL(), '/learnergroups/1');
  });

  test('add new learnergroup with full cohort', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', { programYear });
    this.server.createList('user', 5, {
      cohorts: [cohort],
    });

    const newTitle = 'A New Test Title';
    await page.visit();
    assert.notOk(page.list.isPresent);
    await page.toggleNewLearnerGroupForm();
    assert.ok(page.newLearnerGroupForm.single.isVisible);
    await page.newLearnerGroupForm.single.title(newTitle);
    await page.newLearnerGroupForm.single.fillWithCohort();
    assert.ok(page.newLearnerGroupForm.single.willFill);
    await page.newLearnerGroupForm.single.save();

    assert.strictEqual(page.savedResult, `${newTitle} saved successfully`);
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
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', { programYear });
    this.server.create('learner-group', { cohort });
    this.server.create('learner-group', {
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
    this.user.update({ administeredSchools: [this.school] });

    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', { programYear });
    const parent = this.server.create('learner-group', { cohort });
    const parent2 = this.server.create('learner-group', {
      cohort,
      parent,
    });
    this.server.create('learner-group', {
      cohort,
      parent,
    });
    this.server.create('learner-group', {
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
    await percySnapshot(getUniqueName(assert, 'canCopyWithLearners'));
    await takeScreenshot(assert, 'canCopyWithLearners');
    await page.list.confirmCopy.copyWithoutLearners();
    await percySnapshot(getUniqueName(assert, 'copyWithoutLearners'));
    await takeScreenshot(assert, 'copyWithoutLearners');

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

    assert.strictEqual(learnerGroupPage.root.subgroups.list.items.length, 2);
    assert.strictEqual(learnerGroupPage.root.subgroups.list.items[0].title, 'learner group 1');
    assert.strictEqual(learnerGroupPage.root.subgroups.list.items[0].users, '0');
    assert.strictEqual(learnerGroupPage.root.subgroups.list.items[0].children, '1');
    assert.strictEqual(learnerGroupPage.root.subgroups.list.items[1].title, 'learner group 2');
    assert.strictEqual(learnerGroupPage.root.subgroups.list.items[1].users, '0');
    assert.strictEqual(learnerGroupPage.root.subgroups.list.items[1].children, '0');
  });

  test('copy learnergroup with learners', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });

    this.server.createList('user', 10);
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', { programYear });
    const parent = this.server.create('learner-group', {
      cohort,
      userIds: [2, 3, 4, 5, 6, 7, 8],
    });
    const parent2 = this.server.create('learner-group', {
      cohort,
      parent,
      userIds: [8],
    });
    this.server.create('learner-group', {
      cohort,
      parent,
      userIds: [5, 6, 7],
    });
    this.server.create('learner-group', {
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
    await percySnapshot(getUniqueName(assert, 'canCopyWithLearners'));
    await takeScreenshot(assert, 'canCopyWithLearners');
    await page.list.confirmCopy.copyWithLearners();
    await percySnapshot(getUniqueName(assert, 'copyWithLearners'));
    await takeScreenshot(assert, 'copyWithLearners');

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

    assert.strictEqual(learnerGroupPage.root.subgroups.list.items.length, 2);
    assert.strictEqual(learnerGroupPage.root.subgroups.list.items[0].title, 'learner group 1');
    assert.strictEqual(learnerGroupPage.root.subgroups.list.items[0].users, '1');
    assert.strictEqual(learnerGroupPage.root.subgroups.list.items[0].children, '1');
    assert.strictEqual(learnerGroupPage.root.subgroups.list.items[1].title, 'learner group 2');
    assert.strictEqual(learnerGroupPage.root.subgroups.list.items[1].users, '3');
    assert.strictEqual(learnerGroupPage.root.subgroups.list.items[1].children, '0');
  });
});
