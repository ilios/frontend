import { currentRouteName, currentURL } from '@ember/test-helpers';
import {
  module,
  test
} from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from 'ilios/tests/pages/learner-groups';
import learnerGroupPage from 'ilios/tests/pages/learner-group';

module('Acceptance | Learner Groups', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({school: this.school});
  });

  test('visiting /learnergroups', async function (assert) {
    this.server.create('user', {id: 4136});
    this.server.create('school');
    await page.visit();
    assert.equal(currentRouteName(), 'learnerGroups');
  });

  test('single option filters', async function (assert) {
    assert.expect(6);

    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('programYear', { program });
    this.server.create('cohort', { programYear });
    await page.visit();
    assert.notOk(page.schoolFilter.hasMany);
    assert.equal(page.schoolFilter.text, 'school 0');
    assert.notOk(page.programFilter.hasMany);
    assert.equal(page.programFilter.text, 'program 0');
    assert.notOk(page.programYearFilter.hasMany);
    assert.equal(page.programYearFilter.text, 'cohort 0');
  });

  test('multiple options filter', async function (assert) {
    assert.expect(29);

    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('programYear', { program });
    const cohort = this.server.create('cohort', { programYear });
    const programYear2 = this.server.create('programYear', { program });
    this.server.create('cohort', { programYear: programYear2 });
    const program2 = this.server.create('program', { school: this.school });
    const programYear3 = this.server.create('programYear', { program: program2 });
    const cohort3 = this.server.create('cohort', { programYear: programYear3 });
    this.server.create('learnerGroup', { cohort });
    this.server.create('learnerGroup', { cohort: cohort3 });
    this.server.create('school');

    await page.visit();
    assert.ok(page.schoolFilter.hasMany);
    assert.equal(page.schoolFilter.list.length, 2);
    assert.equal(page.schoolFilter.list[0].text, 'school 0');
    assert.equal(page.schoolFilter.list[0].value, '1');
    assert.equal(page.schoolFilter.list[1].text, 'school 1');
    assert.equal(page.schoolFilter.list[1].value, '2');
    assert.equal(page.schoolFilter.filterValue, '1');

    assert.ok(page.programFilter.hasMany);
    assert.equal(page.programFilter.list.length, 2);
    assert.equal(page.programFilter.list[0].text, 'program 0');
    assert.equal(page.programFilter.list[0].value, '1');
    assert.equal(page.programFilter.list[1].text, 'program 1');
    assert.equal(page.programFilter.list[1].value, '2');
    assert.equal(page.programFilter.filterValue, '1');

    assert.ok(page.programYearFilter.hasMany);
    assert.equal(page.programYearFilter.list.length, 2);
    assert.equal(page.programYearFilter.list[0].text, 'cohort 1');
    assert.equal(page.programYearFilter.list[0].value, '2');
    assert.equal(page.programYearFilter.list[1].text, 'cohort 0');
    assert.equal(page.programYearFilter.list[1].value, '1');
    assert.equal(page.programYearFilter.filterValue, '2');

    assert.equal(page.learnerGroupList.groups.length, 1);
    assert.equal(page.learnerGroupList.groups[0].title, 'None');

    await page.programYearFilter.filter(1);
    assert.equal(page.learnerGroupList.groups.length, 1);
    assert.equal(page.learnerGroupList.groups[0].title, 'learner group 0');

    await page.programFilter.filter(2);
    assert.notOk(page.programYearFilter.hasMany);
    assert.equal(page.programYearFilter.text, 'cohort 2');
    assert.equal(page.learnerGroupList.groups.length, 1);
    assert.equal(page.learnerGroupList.groups[0].title, 'learner group 1');
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
      userIds: [9, 10]
    });
    this.server.create('learnerGroup', {
      parent: firstChildGroup,
      userIds: [11, 12]
    });
    this.server.createList('offering', 2, {
      learnerGroups: [firstLearnerGroup],
    });

    await page.visit();
    assert.equal(page.learnerGroupList.groups.length, 2);
    assert.equal(page.learnerGroupList.groups[0].title, 'learner group 0');
    assert.equal(page.learnerGroupList.groups[0].members, '5');
    assert.equal(page.learnerGroupList.groups[0].subgroups, '2');
    assert.equal(page.learnerGroupList.groups[1].title, 'learner group 1');
    assert.equal(page.learnerGroupList.groups[1].members, '0');
    assert.equal(page.learnerGroupList.groups[1].subgroups, '0');
  });

  test('filters by title', async function (assert) {
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('programYear', { program });
    const cohort = this.server.create('cohort', { programYear });
    const firstLearnerGroup = this.server.create('learnerGroup', {
      title: 'specialfirstlearnergroup',
      cohort
    });
    const secondLearnerGroup = this.server.create('learnerGroup', {
      title: 'specialsecondlearnergroup',
      cohort
    });
    const regularLearnerGroup = this.server.create('learnerGroup', {
      title: 'regularlearnergroup',
      cohort
    });
    assert.expect(15);
    await page.visit();
    assert.equal(page.learnerGroupList.groups.length, 3);
    assert.equal(page.learnerGroupList.groups[0].title, regularLearnerGroup.title);
    assert.equal(page.learnerGroupList.groups[1].title, firstLearnerGroup.title);
    assert.equal(page.learnerGroupList.groups[2].title, secondLearnerGroup.title);

    await page.filterByTitle('first');
    assert.equal(page.learnerGroupList.groups.length, 1);
    assert.equal(page.learnerGroupList.groups[0].title, firstLearnerGroup.title);

    await page.filterByTitle('second');
    assert.equal(page.learnerGroupList.groups.length, 1);
    assert.equal(page.learnerGroupList.groups[0].title, secondLearnerGroup.title);

    await page.filterByTitle('special');
    assert.equal(page.learnerGroupList.groups.length, 2);
    assert.equal(page.learnerGroupList.groups[0].title, firstLearnerGroup.title);
    assert.equal(page.learnerGroupList.groups[1].title, secondLearnerGroup.title);

    await page.filterByTitle('');
    assert.equal(page.learnerGroupList.groups.length, 3);
    assert.equal(page.learnerGroupList.groups[0].title, regularLearnerGroup.title);
    assert.equal(page.learnerGroupList.groups[1].title, firstLearnerGroup.title);
    assert.equal(page.learnerGroupList.groups[2].title, secondLearnerGroup.title);
  });

  test('add new learnergroup', async function (assert) {
    this.user.update({administeredSchools: [this.school]});
    assert.expect(9);

    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('programYear', { program });
    this.server.create('cohort', { programYear });

    const newTitle = 'A New Test Title';
    await page.visit();

    assert.equal(page.learnerGroupList.groups.length, 1);
    assert.equal(page.learnerGroupList.groups[0].title, 'None');
    await page.toggleNewLearnerGroupForm();
    assert.ok(page.newLearnerGroupForm.isVisible);
    await page.newLearnerGroupForm.title(newTitle);
    assert.notOk(page.newLearnerGroupForm.willFill);
    await page.newLearnerGroupForm.save();

    assert.equal(page.savedResult, `${newTitle} Saved Successfully`);
    assert.equal(page.learnerGroupList.groups.length, 1);
    assert.equal(page.learnerGroupList.groups[0].title, newTitle);
    assert.equal(page.learnerGroupList.groups[0].members, '0');
    assert.equal(page.learnerGroupList.groups[0].subgroups, '0');
  });

  test('cancel adding new learnergroup', async function (assert) {
    this.user.update({administeredSchools: [this.school]});
    assert.expect(6);
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('programYear', { program });
    const cohort = this.server.create('cohort', { programYear });
    this.server.create('learnerGroup', { cohort });

    await page.visit();

    assert.equal(page.learnerGroupList.groups.length, 1);
    assert.equal(page.learnerGroupList.groups[0].title, 'learner group 0');
    await page.toggleNewLearnerGroupForm();
    assert.ok(page.newLearnerGroupForm.isVisible);
    await page.newLearnerGroupForm.cancel();
    assert.notOk(page.newLearnerGroupForm.isVisible);

    assert.equal(page.learnerGroupList.groups.length, 1);
    assert.equal(page.learnerGroupList.groups[0].title, 'learner group 0');
  });

  test('remove learnergroup', async function (assert) {
    this.user.update({administeredSchools: [this.school]});
    assert.expect(6);

    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('programYear', { program });
    const cohort = this.server.create('cohort', { programYear });
    const parent = this.server.create('learnerGroup', { cohort });
    this.server.create('learnerGroup', { cohort, parent });

    await page.visit();
    assert.equal(page.learnerGroupList.groups.length, 1);
    assert.equal(page.learnerGroupList.groups[0].title, 'learner group 0');
    assert.equal(page.learnerGroupList.groups[0].subgroups, '1');
    assert.ok(page.learnerGroupList.groups[0].actions.canRemove);
    await page.learnerGroupList.groups[0].actions.remove();
    await page.learnerGroupList.confirmRemoval.confirm();

    assert.equal(page.learnerGroupList.groups.length, 1);
    assert.equal(page.learnerGroupList.groups[0].title, 'None');
  });

  test('cancel remove learnergroup', async function (assert) {
    this.user.update({administeredSchools: [this.school]});
    assert.expect(5);

    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('programYear', { program });
    const cohort = this.server.create('cohort', { programYear });
    this.server.create('learnerGroup', { cohort });
    await page.visit();
    assert.equal(page.learnerGroupList.groups.length, 1);
    assert.equal(page.learnerGroupList.groups[0].title, 'learner group 0');
    assert.ok(page.learnerGroupList.groups[0].actions.canRemove);
    await page.learnerGroupList.groups[0].actions.remove();
    await page.learnerGroupList.confirmRemoval.cancel();

    assert.equal(page.learnerGroupList.groups.length, 1);
    assert.equal(page.learnerGroupList.groups[0].title, 'learner group 0');
  });

  test('confirmation of remove message', async function (assert) {
    this.user.update({administeredSchools: [this.school]});

    this.server.createList('user', 5);
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('programYear', { program });
    const cohort = this.server.create('cohort', { programYear });
    const parent = this.server.create('learnerGroup', { cohort });
    this.server.createList('learnerGroup', 2, { parent });
    this.server.createList('offering', 2, {
      learnerGroups: [parent]
    });
    assert.expect(5);

    await page.visit();
    assert.equal(page.learnerGroupList.groups.length, 1);
    assert.equal(page.learnerGroupList.groups[0].title, 'learner group 0');
    assert.ok(page.learnerGroupList.groups[0].actions.canRemove);
    await page.learnerGroupList.groups[0].actions.remove();
    assert.ok(page.learnerGroupList.groups[0].hasRemoveStyle);
    assert.equal(page.learnerGroupList.confirmRemoval.confirmation, 'Are you sure you want to delete this learner group, with 2 subgroups? This action cannot be undone. Yes Cancel');
  });

  test('populated learner groups are not deletable', async function (assert) {
    this.user.update({administeredSchools: [this.school]});

    this.server.createList('user', 5);
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('programYear', { program });
    const cohort = this.server.create('cohort', { programYear });
    this.server.create('learnerGroup', {
      cohort,
      userIds: [2, 3, 4],
    });

    assert.expect(3);

    await page.visit();
    assert.equal(page.learnerGroupList.groups.length, 1);
    assert.equal(page.learnerGroupList.groups[0].title, 'learner group 0');
    assert.notOk(page.learnerGroupList.groups[0].actions.canRemove);
  });

  test('learner groups with courses cannot be deleted', async function (assert) {
    assert.expect(7);
    this.user.update({administeredSchools: [this.school]});

    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('programYear', { program });
    const cohort = this.server.create('cohort', { programYear });
    const course = this.server.create('course');
    const session = this.server.create('session', { course });
    const offering = this.server.create('offering', { session });
    this.server.create('learnerGroup', {
      cohort,
      offerings: [ offering ],
    });

    await page.visit();
    assert.equal(page.learnerGroupList.groups.length, 1);
    assert.equal(page.learnerGroupList.groups[0].title, 'learner group 0');
    assert.ok(page.learnerGroupList.groups[0].actions.canRemove);

    await page.learnerGroupList.groups[0].actions.remove();
    assert.equal(page.learnerGroupList.confirmRemoval.confirmation, 'This group is attached to one course and cannot be deleted. 2013 - 2014 course 0 OK');
    assert.notOk(page.learnerGroupList.confirmRemoval.canConfirm);
    assert.ok(page.learnerGroupList.confirmRemoval.canCancel);
    await page.learnerGroupList.confirmRemoval.cancel();
    assert.equal(page.learnerGroupList.groups.length, 1);
  });

  test('click title takes you to learnergroup route', async function (assert) {
    assert.expect(3);

    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('programYear', { program });
    const cohort = this.server.create('cohort', { programYear });
    this.server.create('learnerGroup', { cohort });

    await page.visit();
    assert.equal(page.learnerGroupList.groups.length, 1);
    assert.equal(page.learnerGroupList.groups[0].title, 'learner group 0');
    await page.learnerGroupList.groups[0].visit();
    assert.equal(currentURL(), '/learnergroups/1');
  });

  test('add new learnergroup with full cohort', async function (assert) {
    assert.expect(9);

    this.user.update({administeredSchools: [this.school]});
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('programYear', { program });
    const cohort = this.server.create('cohort', { programYear });
    this.server.createList('user', 5, {
      cohorts: [cohort]
    });

    const newTitle = 'A New Test Title';
    await page.visit();
    assert.equal(page.learnerGroupList.groups.length, 1);
    assert.equal(page.learnerGroupList.groups[0].title, 'None');
    await page.toggleNewLearnerGroupForm();
    assert.ok(page.newLearnerGroupForm.isVisible);
    await page.newLearnerGroupForm.title(newTitle);
    await page.newLearnerGroupForm.fillWithCohort();
    assert.ok(page.newLearnerGroupForm.willFill);
    await page.newLearnerGroupForm.save();

    assert.equal(page.savedResult, `${newTitle} Saved Successfully`);
    assert.equal(page.learnerGroupList.groups.length, 1);
    assert.equal(page.learnerGroupList.groups[0].title, newTitle);
    assert.equal(page.learnerGroupList.groups[0].members, '5');
    assert.equal(page.learnerGroupList.groups[0].subgroups, '0');
  });

  test('no add button when there is no cohort', async function (assert) {
    this.user.update({administeredSchools: [this.school]});

    await page.visit();
    assert.equal(currentRouteName(), 'learnerGroups');
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
    assert.equal(page.learnerGroupList.groups.length, 2);
    assert.equal(page.learnerGroupList.groups[0].title, 'learner group 0');
    assert.equal(page.learnerGroupList.groups[1].title, 'yes\\no');
    await page.filterByTitle('\\');
    assert.equal(page.learnerGroupList.groups.length, 1);
    assert.equal(page.learnerGroupList.groups[0].title, 'yes\\no');
  });

  test('copy learnergroup without learners', async function (assert) {
    this.user.update({administeredSchools: [this.school]});
    assert.expect(23);

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
      parent: parent2
    });

    await page.visit();

    assert.equal(page.learnerGroupList.groups.length, 1);
    assert.equal(page.learnerGroupList.groups[0].title, 'learner group 0');
    assert.equal(page.learnerGroupList.groups[0].members, '0');
    assert.equal(page.learnerGroupList.groups[0].subgroups, '2');
    assert.ok(page.learnerGroupList.groups[0].actions.canCopy);
    await page.learnerGroupList.groups[0].actions.copy();
    assert.ok(page.learnerGroupList.confirmCopy.canCopyWithoutLearners);
    assert.ok(page.learnerGroupList.confirmCopy.canCopyWithLearners);
    await page.learnerGroupList.confirmCopy.confirmWithoutLearners();

    assert.equal(page.learnerGroupList.groups.length, 2);
    assert.equal(page.learnerGroupList.groups[0].title, 'learner group 0');
    assert.equal(page.learnerGroupList.groups[0].members, '0');
    assert.equal(page.learnerGroupList.groups[0].subgroups, '2');
    assert.equal(page.learnerGroupList.groups[1].title, 'learner group 0 (Copy)');
    assert.equal(page.learnerGroupList.groups[1].members, '0');
    assert.equal(page.learnerGroupList.groups[1].subgroups, '2');

    await page.learnerGroupList.groups[0].visit();
    assert.equal(currentURL(), '/learnergroups/1');
    await page.visit();
    await page.learnerGroupList.groups[1].visit();
    assert.equal(currentURL(), '/learnergroups/5');

    assert.equal(learnerGroupPage.subgroups.groups.length, 2);
    assert.equal(learnerGroupPage.subgroups.groups[0].title, 'learner group 1');
    assert.equal(learnerGroupPage.subgroups.groups[0].members, '0');
    assert.equal(learnerGroupPage.subgroups.groups[0].subgroups, '1');
    assert.equal(learnerGroupPage.subgroups.groups[1].title, 'learner group 2');
    assert.equal(learnerGroupPage.subgroups.groups[1].members, '0');
    assert.equal(learnerGroupPage.subgroups.groups[1].subgroups, '0');
  });

  test('copy learnergroup with learners', async function (assert) {
    this.user.update({administeredSchools: [this.school]});
    assert.expect(23);

    this.server.createList('user', 10);
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('programYear', { program });
    const cohort = this.server.create('cohort', { programYear });
    const parent = this.server.create('learnerGroup', {
      cohort,
      userIds: [2, 3, 4, 5, 6, 7, 8]
    });
    const parent2 = this.server.create('learnerGroup', {
      cohort,
      parent,
      userIds: [8]
    });
    this.server.create('learnerGroup', {
      cohort,
      parent,
      userIds: [5, 6, 7]
    });
    this.server.create('learnerGroup', {
      cohort,
      parent: parent2,
      userIds: [8]
    });

    await page.visit();

    assert.equal(page.learnerGroupList.groups.length, 1);
    assert.equal(page.learnerGroupList.groups[0].title, 'learner group 0');
    assert.equal(page.learnerGroupList.groups[0].members, '7');
    assert.equal(page.learnerGroupList.groups[0].subgroups, '2');
    assert.ok(page.learnerGroupList.groups[0].actions.canCopy);
    await page.learnerGroupList.groups[0].actions.copy();
    assert.ok(page.learnerGroupList.confirmCopy.canCopyWithoutLearners);
    assert.ok(page.learnerGroupList.confirmCopy.canCopyWithLearners);
    await page.learnerGroupList.confirmCopy.confirmWithLearners();

    assert.equal(page.learnerGroupList.groups.length, 2);
    assert.equal(page.learnerGroupList.groups[0].title, 'learner group 0');
    assert.equal(page.learnerGroupList.groups[0].members, '7');
    assert.equal(page.learnerGroupList.groups[0].subgroups, '2');
    assert.equal(page.learnerGroupList.groups[1].title, 'learner group 0 (Copy)');
    assert.equal(page.learnerGroupList.groups[1].members, '7');
    assert.equal(page.learnerGroupList.groups[1].subgroups, '2');

    await page.learnerGroupList.groups[0].visit();
    assert.equal(currentURL(), '/learnergroups/1');
    await page.visit();
    await page.learnerGroupList.groups[1].visit();
    assert.equal(currentURL(), '/learnergroups/5');

    assert.equal(learnerGroupPage.subgroups.groups.length, 2);
    assert.equal(learnerGroupPage.subgroups.groups[0].title, 'learner group 1');
    assert.equal(learnerGroupPage.subgroups.groups[0].members, '1');
    assert.equal(learnerGroupPage.subgroups.groups[0].subgroups, '1');
    assert.equal(learnerGroupPage.subgroups.groups[1].title, 'learner group 2');
    assert.equal(learnerGroupPage.subgroups.groups[1].members, '3');
    assert.equal(learnerGroupPage.subgroups.groups[1].subgroups, '0');
  });
});
