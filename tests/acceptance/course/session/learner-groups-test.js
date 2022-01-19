import { currentRouteName } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import page from 'ilios-common/page-objects/session';

module('Acceptance | Session - Learner Groups', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
  });

  module('With Fixtures', function (hooks2) {
    hooks2.beforeEach(async function () {
      this.program = this.server.create('program', {
        school: this.school,
      });
      const programYear = this.server.create('programYear', {
        program: this.program,
      });
      this.server.create('cohort', {
        programYear,
      });
      this.server.create('course', {
        school: this.school,
        cohortIds: [1],
      });
      this.server.create('sessionType');
      this.server.createList('learnerGroup', 5, {
        cohortId: 1,
      });
      this.server.createList('learnerGroup', 2, {
        cohortId: 1,
        parentId: 4,
      });
      this.server.create('learnerGroup', {
        cohortId: 1,
        parentId: 5,
      });
      this.server.create('session', {
        courseId: 1,
      });
      this.server.createList('user', 2);
      this.server.create('user', {
        firstName: 'joe',
        lastName: 'shmoe',
        middleName: 'unassigned',
      });
    });

    test('initial selected learner groups', async function (assert) {
      this.server.create('ilmSession', {
        sessionId: 1,
        learnerGroupIds: [1, 2, 4],
        learnerIds: [2, 3],
      });

      await page.visit({ courseId: 1, sessionId: 1 });

      assert.strictEqual(currentRouteName(), 'session.index');
      const { selectedLearners, detailLearnergroupsList } =
        page.details.detailLearnersAndLearnerGroups;
      assert.strictEqual(selectedLearners.learners.length, 2);
      assert.strictEqual(selectedLearners.learners[0].userNameInfo.fullName, '1 guy M. Mc1son');
      assert.strictEqual(selectedLearners.learners[1].userNameInfo.fullName, '2 guy M. Mc2son');
      assert.strictEqual(detailLearnergroupsList.trees.length, 3);
      assert.strictEqual(
        detailLearnergroupsList.trees[0].title,
        'learner group 0 (program 0 cohort 0)'
      );
      assert.strictEqual(
        detailLearnergroupsList.trees[1].title,
        'learner group 1 (program 0 cohort 0)'
      );
      assert.strictEqual(
        detailLearnergroupsList.trees[2].title,
        'learner group 3 (program 0 cohort 0)'
      );
      assert.strictEqual(detailLearnergroupsList.trees[0].subgroups.length, 1);
      assert.strictEqual(
        detailLearnergroupsList.trees[0].subgroups[0].title,
        'learner group 0 (0)'
      );
      assert.strictEqual(detailLearnergroupsList.trees[1].subgroups.length, 1);
      assert.strictEqual(
        detailLearnergroupsList.trees[1].subgroups[0].title,
        'learner group 1 (0)'
      );
      assert.strictEqual(detailLearnergroupsList.trees[2].subgroups.length, 1);
      assert.strictEqual(
        detailLearnergroupsList.trees[2].subgroups[0].title,
        'learner group 3 (0)'
      );
    });

    test('manager display', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('ilmSession', {
        sessionId: 1,
        learnerGroupIds: [1, 2, 4],
        learnerIds: [2, 3],
      });

      await page.visit({ courseId: 1, sessionId: 1 });

      assert.strictEqual(currentRouteName(), 'session.index');

      await page.details.detailLearnersAndLearnerGroups.manage();

      const { learnerSelectionManager, learnergroupSelectionManager } =
        page.details.detailLearnersAndLearnerGroups;
      assert.strictEqual(learnerSelectionManager.selectedLearners.learners.length, 2);
      assert.strictEqual(
        learnerSelectionManager.selectedLearners.learners[0].userNameInfo.fullName,
        '1 guy M. Mc1son'
      );
      assert.strictEqual(
        learnerSelectionManager.selectedLearners.learners[1].userNameInfo.fullName,
        '2 guy M. Mc2son'
      );
      assert.strictEqual(learnergroupSelectionManager.selectedGroups.list.trees.length, 3);
      assert.strictEqual(
        learnergroupSelectionManager.selectedGroups.list.trees[0].title,
        'learner group 0 (program 0 cohort 0)'
      );
      assert.strictEqual(
        learnergroupSelectionManager.selectedGroups.list.trees[0].subgroups.length,
        1
      );
      assert.strictEqual(
        learnergroupSelectionManager.selectedGroups.list.trees[0].subgroups[0].title,
        'learner group 0 (0)'
      );
      assert.strictEqual(
        learnergroupSelectionManager.selectedGroups.list.trees[1].title,
        'learner group 1 (program 0 cohort 0)'
      );
      assert.strictEqual(
        learnergroupSelectionManager.selectedGroups.list.trees[1].subgroups.length,
        1
      );
      assert.strictEqual(
        learnergroupSelectionManager.selectedGroups.list.trees[1].subgroups[0].title,
        'learner group 1 (0)'
      );
      assert.strictEqual(
        learnergroupSelectionManager.selectedGroups.list.trees[2].title,
        'learner group 3 (program 0 cohort 0)'
      );
      assert.strictEqual(
        learnergroupSelectionManager.selectedGroups.list.trees[2].subgroups.length,
        1
      );
      assert.strictEqual(
        learnergroupSelectionManager.selectedGroups.list.trees[2].subgroups[0].title,
        'learner group 3 (0)'
      );
      assert.strictEqual(learnergroupSelectionManager.availableGroups.cohorts.length, 1);
      assert.strictEqual(learnergroupSelectionManager.availableGroups.cohorts[0].trees.length, 5);
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].title,
        'learner group 0'
      );
      assert.ok(learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].isHidden);
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups.length,
        0
      );
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[1].title,
        'learner group 1'
      );
      assert.ok(learnergroupSelectionManager.availableGroups.cohorts[0].trees[1].isHidden);
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[1].subgroups.length,
        0
      );
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[2].title,
        'learner group 2'
      );
      assert.notOk(learnergroupSelectionManager.availableGroups.cohorts[0].trees[2].isHidden);
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[2].subgroups.length,
        0
      );
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].title,
        'learner group 3'
      );
      assert.notOk(learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].isHidden);
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].subgroups.length,
        2
      );
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].subgroups[0].title,
        'learner group 5'
      );
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].subgroups[1].title,
        'learner group 6'
      );
      assert.notOk(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].subgroups[0].isHidden
      );
      assert.notOk(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].subgroups[1].isHidden
      );
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[4].title,
        'learner group 4'
      );
      assert.notOk(learnergroupSelectionManager.availableGroups.cohorts[0].trees[4].isHidden);
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[4].subgroups.length,
        1
      );
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[4].subgroups[0].title,
        'learner group 7'
      );
      assert.notOk(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[4].subgroups[0].isHidden
      );
    });

    test('learner group manager display with no selected groups or learners', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('ilmSession', {
        sessionId: 1,
        learnerGroupIds: [],
        learnerIds: [],
      });

      await page.visit({ courseId: 1, sessionId: 1 });

      assert.strictEqual(currentRouteName(), 'session.index');

      await page.details.detailLearnersAndLearnerGroups.manage();

      const { learnerSelectionManager, learnergroupSelectionManager } =
        page.details.detailLearnersAndLearnerGroups;
      assert.strictEqual(learnerSelectionManager.selectedLearners.noLearners.text, 'None');
      assert.strictEqual(learnergroupSelectionManager.selectedGroups.noGroups.text, 'None');
      assert.strictEqual(learnergroupSelectionManager.availableGroups.cohorts.length, 1);
      assert.strictEqual(learnergroupSelectionManager.availableGroups.cohorts[0].trees.length, 5);
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].title,
        'learner group 0'
      );
      assert.notOk(learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].isHidden);
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups.length,
        0
      );
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[1].title,
        'learner group 1'
      );
      assert.notOk(learnergroupSelectionManager.availableGroups.cohorts[0].trees[1].isHidden);
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[1].subgroups.length,
        0
      );
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[2].title,
        'learner group 2'
      );
      assert.notOk(learnergroupSelectionManager.availableGroups.cohorts[0].trees[2].isHidden);
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[2].subgroups.length,
        0
      );
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].title,
        'learner group 3'
      );
      assert.notOk(learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].isHidden);
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].subgroups.length,
        2
      );
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].subgroups[0].title,
        'learner group 5'
      );
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].subgroups[1].title,
        'learner group 6'
      );
      assert.notOk(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].subgroups[0].isHidden
      );
      assert.notOk(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].subgroups[1].isHidden
      );
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[4].title,
        'learner group 4'
      );
      assert.notOk(learnergroupSelectionManager.availableGroups.cohorts[0].trees[4].isHidden);
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[4].subgroups.length,
        1
      );
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[4].subgroups[0].title,
        'learner group 7'
      );
      assert.notOk(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[4].subgroups[0].isHidden
      );
    });

    test('filter learner groups by top group should include all subgroups', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('ilmSession', {
        sessionId: 1,
        learnerGroupIds: [1, 2, 4],
      });

      await page.visit({ courseId: 1, sessionId: 1 });

      assert.strictEqual(currentRouteName(), 'session.index');
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.detailLearnergroupsList.trees.length,
        3
      );

      await page.details.detailLearnersAndLearnerGroups.manage();

      const { selectedGroups, availableGroups } =
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager;

      assert.strictEqual(selectedGroups.list.trees.length, 3);
      assert.strictEqual(
        selectedGroups.list.trees[0].title,
        'learner group 0 (program 0 cohort 0)'
      );
      assert.strictEqual(
        selectedGroups.list.trees[1].title,
        'learner group 1 (program 0 cohort 0)'
      );
      assert.strictEqual(
        selectedGroups.list.trees[2].title,
        'learner group 3 (program 0 cohort 0)'
      );

      await availableGroups.search.set('3');

      assert.strictEqual(availableGroups.cohorts.length, 1);
      assert.strictEqual(availableGroups.cohorts[0].title, 'program 0 cohort 0');
      assert.strictEqual(availableGroups.cohorts[0].trees.length, 5);
      assert.strictEqual(availableGroups.cohorts[0].trees[0].title, 'learner group 0');
      assert.ok(availableGroups.cohorts[0].trees[0].isDisabled);
      assert.ok(availableGroups.cohorts[0].trees[0].isHidden);
      assert.strictEqual(availableGroups.cohorts[0].trees[1].title, 'learner group 1');
      assert.ok(availableGroups.cohorts[0].trees[1].isDisabled);
      assert.ok(availableGroups.cohorts[0].trees[1].isHidden);
      assert.strictEqual(availableGroups.cohorts[0].trees[2].title, 'learner group 2');
      assert.notOk(availableGroups.cohorts[0].trees[2].isDisabled);
      assert.ok(availableGroups.cohorts[0].trees[2].isHidden);
      assert.strictEqual(availableGroups.cohorts[0].trees[3].title, 'learner group 3');
      assert.notOk(availableGroups.cohorts[0].trees[3].isDisabled);
      assert.notOk(availableGroups.cohorts[0].trees[3].isHidden);
      assert.strictEqual(availableGroups.cohorts[0].trees[3].subgroups.length, 2);
      assert.strictEqual(availableGroups.cohorts[0].trees[3].subgroups[0].title, 'learner group 5');
      assert.strictEqual(availableGroups.cohorts[0].trees[3].subgroups[1].title, 'learner group 6');
      assert.strictEqual(availableGroups.cohorts[0].trees[4].title, 'learner group 4');
      assert.notOk(availableGroups.cohorts[0].trees[4].isDisabled);
      assert.ok(availableGroups.cohorts[0].trees[4].isHidden);
    });

    test('filter learner groups by subgroup should include top group', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('ilmSession', {
        sessionId: 1,
        learnerGroupIds: [1, 2, 4],
      });

      await page.visit({ courseId: 1, sessionId: 1 });

      assert.strictEqual(currentRouteName(), 'session.index');
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.detailLearnergroupsList.trees.length,
        3
      );

      await page.details.detailLearnersAndLearnerGroups.manage();

      const { selectedGroups, availableGroups } =
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager;

      assert.strictEqual(selectedGroups.list.trees.length, 3);
      assert.strictEqual(
        selectedGroups.list.trees[0].title,
        'learner group 0 (program 0 cohort 0)'
      );
      assert.strictEqual(
        selectedGroups.list.trees[1].title,
        'learner group 1 (program 0 cohort 0)'
      );
      assert.strictEqual(
        selectedGroups.list.trees[2].title,
        'learner group 3 (program 0 cohort 0)'
      );

      await availableGroups.search.set('5');

      assert.strictEqual(availableGroups.cohorts.length, 1);
      assert.strictEqual(availableGroups.cohorts[0].title, 'program 0 cohort 0');
      assert.strictEqual(availableGroups.cohorts[0].trees.length, 5);
      assert.strictEqual(availableGroups.cohorts[0].trees[0].title, 'learner group 0');
      assert.ok(availableGroups.cohorts[0].trees[0].isDisabled);
      assert.ok(availableGroups.cohorts[0].trees[0].isHidden);
      assert.strictEqual(availableGroups.cohorts[0].trees[1].title, 'learner group 1');
      assert.ok(availableGroups.cohorts[0].trees[1].isDisabled);
      assert.ok(availableGroups.cohorts[0].trees[1].isHidden);
      assert.strictEqual(availableGroups.cohorts[0].trees[2].title, 'learner group 2');
      assert.notOk(availableGroups.cohorts[0].trees[2].isDisabled);
      assert.ok(availableGroups.cohorts[0].trees[2].isHidden);
      assert.strictEqual(availableGroups.cohorts[0].trees[3].title, 'learner group 3');
      assert.notOk(availableGroups.cohorts[0].trees[3].isDisabled);
      assert.notOk(availableGroups.cohorts[0].trees[3].isHidden);
      assert.strictEqual(availableGroups.cohorts[0].trees[3].subgroups.length, 2);
      assert.strictEqual(availableGroups.cohorts[0].trees[3].subgroups[0].title, 'learner group 5');
      assert.strictEqual(availableGroups.cohorts[0].trees[3].subgroups[1].title, 'learner group 6');
      assert.strictEqual(availableGroups.cohorts[0].trees[4].title, 'learner group 4');
      assert.notOk(availableGroups.cohorts[0].trees[4].isDisabled);
      assert.ok(availableGroups.cohorts[0].trees[4].isHidden);
    });

    test('add learner group', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('ilmSession', {
        sessionId: 1,
        learnerGroupIds: [1, 2, 4],
      });

      await page.visit({ courseId: 1, sessionId: 1 });

      assert.strictEqual(currentRouteName(), 'session.index');
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.detailLearnergroupsList.trees.length,
        3
      );

      await page.details.detailLearnersAndLearnerGroups.manage();

      const { selectedGroups, availableGroups } =
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager;

      assert.strictEqual(selectedGroups.list.trees.length, 3);

      await availableGroups.cohorts[0].trees[2].add();
      await availableGroups.cohorts[0].trees[3].subgroups[0].add();

      assert.strictEqual(selectedGroups.list.trees.length, 4);
      assert.strictEqual(
        selectedGroups.list.trees[0].title,
        'learner group 0 (program 0 cohort 0)'
      );
      assert.strictEqual(
        selectedGroups.list.trees[1].title,
        'learner group 1 (program 0 cohort 0)'
      );
      assert.strictEqual(
        selectedGroups.list.trees[2].title,
        'learner group 2 (program 0 cohort 0)'
      );
      assert.strictEqual(
        selectedGroups.list.trees[3].title,
        'learner group 3 (program 0 cohort 0)'
      );

      await page.details.detailLearnersAndLearnerGroups.save();

      const { detailLearnergroupsList } = page.details.detailLearnersAndLearnerGroups;
      assert.strictEqual(detailLearnergroupsList.trees.length, 4);
      assert.strictEqual(
        detailLearnergroupsList.trees[0].title,
        'learner group 0 (program 0 cohort 0)'
      );
      assert.strictEqual(
        detailLearnergroupsList.trees[1].title,
        'learner group 1 (program 0 cohort 0)'
      );
      assert.strictEqual(
        detailLearnergroupsList.trees[2].title,
        'learner group 2 (program 0 cohort 0)'
      );
      assert.strictEqual(
        detailLearnergroupsList.trees[3].title,
        'learner group 3 (program 0 cohort 0)'
      );
    });

    test('add learner sub group', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('ilmSession', {
        sessionId: 1,
        learnerGroupIds: [1, 2, 4],
      });

      await page.visit({ courseId: 1, sessionId: 1 });

      assert.strictEqual(currentRouteName(), 'session.index');
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.detailLearnergroupsList.trees.length,
        3
      );

      await page.details.detailLearnersAndLearnerGroups.manage();

      const { selectedGroups, availableGroups } =
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager;

      assert.strictEqual(selectedGroups.list.trees.length, 3);
      assert.strictEqual(selectedGroups.list.trees[2].subgroups.length, 1);
      assert.strictEqual(selectedGroups.list.trees[2].subgroups[0].title, 'learner group 3 (0)');
      assert.ok(selectedGroups.list.trees[2].subgroups[0].isTopLevel);

      await availableGroups.cohorts[0].trees[3].subgroups[0].add();

      assert.strictEqual(selectedGroups.list.trees.length, 3);
      assert.strictEqual(
        selectedGroups.list.trees[0].title,
        'learner group 0 (program 0 cohort 0)'
      );
      assert.strictEqual(
        selectedGroups.list.trees[1].title,
        'learner group 1 (program 0 cohort 0)'
      );
      assert.strictEqual(
        selectedGroups.list.trees[2].title,
        'learner group 3 (program 0 cohort 0)'
      );
      assert.strictEqual(selectedGroups.list.trees[2].subgroups.length, 2);
      assert.strictEqual(selectedGroups.list.trees[2].subgroups[0].title, 'learner group 3 (0)');
      assert.strictEqual(selectedGroups.list.trees[2].subgroups[1].title, 'learner group 5 (0)');

      await page.details.detailLearnersAndLearnerGroups.save();

      const { detailLearnergroupsList } = page.details.detailLearnersAndLearnerGroups;
      assert.strictEqual(detailLearnergroupsList.trees.length, 3);
      assert.strictEqual(
        detailLearnergroupsList.trees[0].title,
        'learner group 0 (program 0 cohort 0)'
      );
      assert.strictEqual(
        detailLearnergroupsList.trees[1].title,
        'learner group 1 (program 0 cohort 0)'
      );
      assert.strictEqual(
        detailLearnergroupsList.trees[2].title,
        'learner group 3 (program 0 cohort 0)'
      );
      assert.strictEqual(detailLearnergroupsList.trees[2].subgroups.length, 2);
      assert.strictEqual(
        detailLearnergroupsList.trees[2].subgroups[0].title,
        'learner group 3 (0)'
      );
      assert.ok(detailLearnergroupsList.trees[2].subgroups[0].isTopLevel);
      assert.strictEqual(
        detailLearnergroupsList.trees[2].subgroups[1].title,
        'learner group 5 (0)'
      );
      assert.notOk(detailLearnergroupsList.trees[2].subgroups[1].isTopLevel);
    });

    test('add learner group with children', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('ilmSession', {
        sessionId: 1,
        learnerGroupIds: [1, 2, 4],
      });

      await page.visit({ courseId: 1, sessionId: 1 });

      assert.strictEqual(currentRouteName(), 'session.index');
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.detailLearnergroupsList.trees.length,
        3
      );

      await page.details.detailLearnersAndLearnerGroups.manage();

      const { selectedGroups, availableGroups } =
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager;

      assert.strictEqual(selectedGroups.list.trees.length, 3);
      assert.strictEqual(selectedGroups.list.trees[2].subgroups.length, 1);
      assert.strictEqual(selectedGroups.list.trees[2].subgroups[0].title, 'learner group 3 (0)');
      assert.ok(selectedGroups.list.trees[2].subgroups[0].isTopLevel);

      await availableGroups.cohorts[0].trees[3].add();

      assert.ok(availableGroups.cohorts[0].trees[3].isDisabled);
      assert.ok(availableGroups.cohorts[0].trees[3].isHidden);

      assert.strictEqual(selectedGroups.list.trees.length, 3);
      assert.strictEqual(
        selectedGroups.list.trees[0].title,
        'learner group 0 (program 0 cohort 0)'
      );
      assert.strictEqual(
        selectedGroups.list.trees[1].title,
        'learner group 1 (program 0 cohort 0)'
      );
      assert.strictEqual(
        selectedGroups.list.trees[2].title,
        'learner group 3 (program 0 cohort 0)'
      );
      assert.strictEqual(selectedGroups.list.trees[2].subgroups.length, 3);
      assert.strictEqual(selectedGroups.list.trees[2].subgroups[0].title, 'learner group 3 (0)');
      assert.strictEqual(selectedGroups.list.trees[2].subgroups[1].title, 'learner group 5 (0)');
      assert.strictEqual(selectedGroups.list.trees[2].subgroups[2].title, 'learner group 6 (0)');

      await page.details.detailLearnersAndLearnerGroups.save();

      const { detailLearnergroupsList } = page.details.detailLearnersAndLearnerGroups;
      assert.strictEqual(detailLearnergroupsList.trees.length, 3);
      assert.strictEqual(
        detailLearnergroupsList.trees[0].title,
        'learner group 0 (program 0 cohort 0)'
      );
      assert.strictEqual(
        detailLearnergroupsList.trees[1].title,
        'learner group 1 (program 0 cohort 0)'
      );
      assert.strictEqual(
        detailLearnergroupsList.trees[2].title,
        'learner group 3 (program 0 cohort 0)'
      );
      assert.strictEqual(detailLearnergroupsList.trees[2].subgroups.length, 3);
      assert.strictEqual(
        detailLearnergroupsList.trees[2].subgroups[0].title,
        'learner group 3 (0)'
      );
      assert.ok(detailLearnergroupsList.trees[2].subgroups[0].isTopLevel);
      assert.strictEqual(
        detailLearnergroupsList.trees[2].subgroups[1].title,
        'learner group 5 (0)'
      );
      assert.notOk(detailLearnergroupsList.trees[2].subgroups[1].isTopLevel);
      assert.strictEqual(
        detailLearnergroupsList.trees[2].subgroups[2].title,
        'learner group 6 (0)'
      );
      assert.notOk(detailLearnergroupsList.trees[2].subgroups[2].isTopLevel);
    });

    test('add learner group with children and remove one child', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('ilmSession', {
        sessionId: 1,
        learnerGroupIds: [1, 2, 4],
      });

      await page.visit({ courseId: 1, sessionId: 1 });

      assert.strictEqual(currentRouteName(), 'session.index');
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.detailLearnergroupsList.trees.length,
        3
      );

      await page.details.detailLearnersAndLearnerGroups.manage();

      const { selectedGroups, availableGroups } =
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager;

      assert.strictEqual(selectedGroups.list.trees.length, 3);
      assert.strictEqual(selectedGroups.list.trees[2].subgroups[0].title, 'learner group 3 (0)');
      assert.ok(selectedGroups.list.trees[2].subgroups[0].isTopLevel);
      assert.strictEqual(selectedGroups.list.trees[2].subgroups.length, 1);

      await availableGroups.cohorts[0].trees[3].add();
      await selectedGroups.list.trees[2].subgroups[1].remove();

      assert.notOk(availableGroups.cohorts[0].trees[3].isDisabled);
      assert.notOk(availableGroups.cohorts[0].trees[3].isHidden);

      assert.strictEqual(selectedGroups.list.trees.length, 3);
      assert.strictEqual(
        selectedGroups.list.trees[0].title,
        'learner group 0 (program 0 cohort 0)'
      );
      assert.strictEqual(
        selectedGroups.list.trees[1].title,
        'learner group 1 (program 0 cohort 0)'
      );
      assert.strictEqual(
        selectedGroups.list.trees[2].title,
        'learner group 3 (program 0 cohort 0)'
      );
      assert.strictEqual(selectedGroups.list.trees[2].subgroups.length, 2);
      assert.strictEqual(selectedGroups.list.trees[2].subgroups[0].title, 'learner group 3 (0)');
      assert.strictEqual(selectedGroups.list.trees[2].subgroups[1].title, 'learner group 6 (0)');

      await page.details.detailLearnersAndLearnerGroups.save();

      const { detailLearnergroupsList } = page.details.detailLearnersAndLearnerGroups;
      assert.strictEqual(detailLearnergroupsList.trees.length, 3);
      assert.strictEqual(
        detailLearnergroupsList.trees[0].title,
        'learner group 0 (program 0 cohort 0)'
      );
      assert.strictEqual(
        detailLearnergroupsList.trees[1].title,
        'learner group 1 (program 0 cohort 0)'
      );
      assert.strictEqual(
        detailLearnergroupsList.trees[2].title,
        'learner group 3 (program 0 cohort 0)'
      );
      assert.strictEqual(detailLearnergroupsList.trees[2].subgroups.length, 2);
      assert.strictEqual(
        detailLearnergroupsList.trees[2].subgroups[0].title,
        'learner group 3 (0)'
      );
      assert.ok(detailLearnergroupsList.trees[2].subgroups[0].isTopLevel);
      assert.strictEqual(
        detailLearnergroupsList.trees[2].subgroups[1].title,
        'learner group 6 (0)'
      );
      assert.notOk(detailLearnergroupsList.trees[2].subgroups[1].isTopLevel);
    });

    test('undo learner group change', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('ilmSession', {
        sessionId: 1,
        learnerGroupIds: [1, 2, 4],
      });

      await page.visit({ courseId: 1, sessionId: 1 });

      assert.strictEqual(currentRouteName(), 'session.index');
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.detailLearnergroupsList.trees.length,
        3
      );

      await page.details.detailLearnersAndLearnerGroups.manage();

      const { selectedGroups, availableGroups } =
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager;

      await availableGroups.cohorts[0].trees[2].add();
      await availableGroups.cohorts[0].trees[3].add();
      await selectedGroups.list.trees[3].subgroups[1].remove();

      await page.details.detailLearnersAndLearnerGroups.cancel();

      const { detailLearnergroupsList } = page.details.detailLearnersAndLearnerGroups;
      assert.strictEqual(detailLearnergroupsList.trees.length, 3);

      assert.strictEqual(
        detailLearnergroupsList.trees[0].title,
        'learner group 0 (program 0 cohort 0)'
      );
      assert.strictEqual(
        detailLearnergroupsList.trees[1].title,
        'learner group 1 (program 0 cohort 0)'
      );
      assert.strictEqual(
        detailLearnergroupsList.trees[2].title,
        'learner group 3 (program 0 cohort 0)'
      );
      assert.strictEqual(detailLearnergroupsList.trees[2].subgroups.length, 1);
      assert.strictEqual(
        detailLearnergroupsList.trees[2].subgroups[0].title,
        'learner group 3 (0)'
      );
      assert.ok(detailLearnergroupsList.trees[2].subgroups[0].isTopLevel);
    });

    test('add learner', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('ilmSession', {
        sessionId: 1,
        learnerIds: [2, 3],
      });

      await page.visit({ courseId: 1, sessionId: 1 });

      assert.strictEqual(currentRouteName(), 'session.index');

      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearners.learners.length,
        2
      );

      await page.details.detailLearnersAndLearnerGroups.manage();

      const { learnerSelectionManager } = page.details.detailLearnersAndLearnerGroups;

      await learnerSelectionManager.search.searchBox.set('shmoe');

      assert.strictEqual(learnerSelectionManager.search.results.items.length, 1);

      await learnerSelectionManager.search.results.items[0].click();

      assert.strictEqual(learnerSelectionManager.selectedLearners.learners.length, 3);

      await page.details.detailLearnersAndLearnerGroups.save();

      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearners.learners.length,
        3
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearners.learners[0].userNameInfo
          .fullName,
        '1 guy M. Mc1son'
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearners.learners[1].userNameInfo
          .fullName,
        '2 guy M. Mc2son'
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearners.learners[2].userNameInfo
          .fullName,
        'joe u. shmoe'
      );
    });

    test('remove learner', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('ilmSession', {
        sessionId: 1,
        learnerIds: [2, 3],
      });

      await page.visit({ courseId: 1, sessionId: 1 });

      assert.strictEqual(currentRouteName(), 'session.index');
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearners.learners.length,
        2
      );

      await page.details.detailLearnersAndLearnerGroups.manage();

      const { selectedLearners } =
        page.details.detailLearnersAndLearnerGroups.learnerSelectionManager;

      assert.strictEqual(selectedLearners.learners.length, 2);

      await selectedLearners.learners[0].remove();

      assert.strictEqual(selectedLearners.learners.length, 1);

      await page.details.detailLearnersAndLearnerGroups.save();

      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearners.learners.length,
        1
      );
    });

    test('undo learner change', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('ilmSession', {
        sessionId: 1,
        learnerIds: [2, 3],
      });

      await page.visit({ courseId: 1, sessionId: 1 });

      assert.strictEqual(currentRouteName(), 'session.index');
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearners.learners.length,
        2
      );

      await page.details.detailLearnersAndLearnerGroups.manage();

      const { selectedLearners } =
        page.details.detailLearnersAndLearnerGroups.learnerSelectionManager;

      assert.strictEqual(selectedLearners.learners.length, 2);

      await selectedLearners.learners[0].remove();

      assert.strictEqual(selectedLearners.learners.length, 1);

      await page.details.detailLearnersAndLearnerGroups.cancel();

      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearners.learners.length,
        2
      );
    });
  });

  test('initial state with save works as expected #1773', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('sessionType');
    this.server.create('program', {
      school: this.school,
    });
    this.server.create('programYear', {
      programId: 1,
    });
    this.server.create('cohort', {
      programYearId: 1,
    });
    this.server.create('course', {
      school: this.school,
      cohortIds: [1],
    });
    this.server.createList('learnerGroup', 2, {
      cohortId: 1,
    });
    this.server.create('session', {
      courseId: 1,
    });
    this.server.create('ilmSession', {
      sessionId: 1,
    });
    await page.visit({ courseId: 1, sessionId: 1 });
    await page.details.detailLearnersAndLearnerGroups.manage();
    await page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].add();
    await page.details.detailLearnersAndLearnerGroups.save();

    const { detailLearnergroupsList } = page.details.detailLearnersAndLearnerGroups;
    assert.strictEqual(detailLearnergroupsList.trees.length, 1);
    assert.strictEqual(
      detailLearnergroupsList.trees[0].title,
      'learner group 0 (program 0 cohort 0)'
    );
    assert.strictEqual(detailLearnergroupsList.trees[0].subgroups.length, 1);
    assert.strictEqual(detailLearnergroupsList.trees[0].subgroups[0].title, 'learner group 0 (0)');
    assert.ok(detailLearnergroupsList.trees[0].subgroups[0].isTopLevel);
  });
});
