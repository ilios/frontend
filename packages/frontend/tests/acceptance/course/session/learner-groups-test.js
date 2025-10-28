import { currentRouteName } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'frontend/tests/helpers';
import page from 'ilios-common/page-objects/session';
import { DateTime } from 'luxon';

module('Acceptance | Session - Learner Groups', function (hooks) {
  setupApplicationTest(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school }, true);
  });

  module('With Fixtures', function (hooks2) {
    hooks2.beforeEach(async function () {
      this.program = this.server.create('program', {
        school: this.school,
      });
      const programYear = this.server.create('program-year', {
        program: this.program,
      });
      this.server.create('cohort', {
        programYear,
      });
      this.server.create('course', {
        school: this.school,
        cohortIds: [1],
      });
      const sessionType = this.server.create('session-type', { school: this.school });
      this.server.createList('learner-group', 5, {
        cohortId: 1,
      });
      this.server.createList('learner-group', 2, {
        cohortId: 1,
        parentId: 4,
      });
      this.server.create('learner-group', {
        cohortId: 1,
        parentId: 5,
      });
      this.server.create('session', {
        courseId: 1,
        updatedAt: DateTime.fromObject({ year: 2019, month: 7, day: 9, hour: 17 }).toJSDate(),
        sessionType,
      });
      this.server.createList('user', 2);
      this.server.create('user', {
        firstName: 'joe',
        lastName: 'shmoe',
        middleName: 'unassigned',
      });
    });

    test('initial selected learner groups', async function (assert) {
      this.server.create('ilm-session', {
        sessionId: 1,
        learnerGroupIds: [1, 2, 4],
        learnerIds: [2, 3],
      });

      await page.visit({ courseId: 1, sessionId: 1 });

      assert.strictEqual(currentRouteName(), 'session.index');
      const { selectedLearners, selectedLearnerGroups } =
        page.details.detailLearnersAndLearnerGroups;
      assert.strictEqual(selectedLearners.learners.length, 2);
      assert.strictEqual(selectedLearners.learners[0].userNameInfo.fullName, '1 guy M. Mc1son');
      assert.strictEqual(selectedLearners.learners[1].userNameInfo.fullName, '2 guy M. Mc2son');
      assert.strictEqual(selectedLearnerGroups.detailLearnergroupsList.trees.length, 1);
      assert.strictEqual(selectedLearnerGroups.detailLearnergroupsList.trees[0].items.length, 3);
      assert.strictEqual(
        selectedLearnerGroups.detailLearnergroupsList.trees[0].title,
        'program 0 cohort 0',
      );
      assert.strictEqual(
        selectedLearnerGroups.detailLearnergroupsList.trees[0].items[0].text,
        'learner group 0',
      );
      assert.strictEqual(
        selectedLearnerGroups.detailLearnergroupsList.trees[0].items[1].text,
        'learner group 1',
      );
      assert.strictEqual(
        selectedLearnerGroups.detailLearnergroupsList.trees[0].items[2].text,
        'learner group 3',
      );
    });

    test('manager display', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('ilm-session', {
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
        '1 guy M. Mc1son',
      );
      assert.strictEqual(
        learnerSelectionManager.selectedLearners.learners[1].userNameInfo.fullName,
        '2 guy M. Mc2son',
      );
      assert.strictEqual(
        learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees.length,
        1,
      );
      assert.strictEqual(
        learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees[0].title,
        'program 0 cohort 0',
      );
      assert.strictEqual(
        learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees[0].items
          .length,
        3,
      );
      assert.strictEqual(
        learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees[0].items[0]
          .text,
        'learner group 0',
      );
      assert.strictEqual(
        learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees[0].items[1]
          .text,
        'learner group 1',
      );
      assert.strictEqual(
        learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees[0].items[2]
          .text,
        'learner group 3',
      );
      assert.strictEqual(learnergroupSelectionManager.availableGroups.cohorts.length, 1);
      assert.strictEqual(learnergroupSelectionManager.availableGroups.cohorts[0].trees.length, 5);
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].title,
        'learner group 0',
      );
      assert.ok(learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].isChecked);
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups.length,
        0,
      );
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[1].title,
        'learner group 1',
      );
      assert.ok(learnergroupSelectionManager.availableGroups.cohorts[0].trees[1].isChecked);
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[1].subgroups.length,
        0,
      );
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[2].title,
        'learner group 2',
      );
      assert.notOk(learnergroupSelectionManager.availableGroups.cohorts[0].trees[2].isChecked);
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[2].subgroups.length,
        0,
      );
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].title,
        'learner group 3',
      );
      assert.ok(learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].isChecked);
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].subgroups.length,
        2,
      );
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].subgroups[0].title,
        'learner group 5',
      );
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].subgroups[1].title,
        'learner group 6',
      );
      assert.notOk(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].subgroups[0].isChecked,
      );
      assert.notOk(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].subgroups[1].isChecked,
      );
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[4].title,
        'learner group 4',
      );
      assert.notOk(learnergroupSelectionManager.availableGroups.cohorts[0].trees[4].isChecked);
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[4].subgroups.length,
        1,
      );
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[4].subgroups[0].title,
        'learner group 7',
      );
      assert.notOk(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[4].subgroups[0].isChecked,
      );
    });

    test('learner group manager display with no selected groups or learners', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('ilm-session', {
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
      assert.strictEqual(learnergroupSelectionManager.selectedLearnerGroups.noGroups.text, 'None');
      assert.strictEqual(learnergroupSelectionManager.availableGroups.cohorts.length, 1);
      assert.strictEqual(learnergroupSelectionManager.availableGroups.cohorts[0].trees.length, 5);
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].title,
        'learner group 0',
      );
      assert.notOk(learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].isHidden);
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups.length,
        0,
      );
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[1].title,
        'learner group 1',
      );
      assert.notOk(learnergroupSelectionManager.availableGroups.cohorts[0].trees[1].isHidden);
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[1].subgroups.length,
        0,
      );
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[2].title,
        'learner group 2',
      );
      assert.notOk(learnergroupSelectionManager.availableGroups.cohorts[0].trees[2].isHidden);
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[2].subgroups.length,
        0,
      );
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].title,
        'learner group 3',
      );
      assert.notOk(learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].isHidden);
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].subgroups.length,
        2,
      );
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].subgroups[0].title,
        'learner group 5',
      );
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].subgroups[1].title,
        'learner group 6',
      );
      assert.notOk(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].subgroups[0].isHidden,
      );
      assert.notOk(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].subgroups[1].isHidden,
      );
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[4].title,
        'learner group 4',
      );
      assert.notOk(learnergroupSelectionManager.availableGroups.cohorts[0].trees[4].isHidden);
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[4].subgroups.length,
        1,
      );
      assert.strictEqual(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[4].subgroups[0].title,
        'learner group 7',
      );
      assert.notOk(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[4].subgroups[0].isHidden,
      );
    });

    test('filter learner groups by top group should include all subgroups', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('ilm-session', {
        sessionId: 1,
        learnerGroupIds: [1, 2, 4],
      });

      await page.visit({ courseId: 1, sessionId: 1 });

      assert.strictEqual(currentRouteName(), 'session.index');
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees.length,
        1,
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items.length,
        3,
      );

      await page.details.detailLearnersAndLearnerGroups.manage();

      const { selectedLearnerGroups, availableGroups } =
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager;

      assert.strictEqual(selectedLearnerGroups.detailLearnergroupsList.trees.length, 1);
      assert.strictEqual(selectedLearnerGroups.detailLearnergroupsList.trees[0].items.length, 3);
      assert.strictEqual(
        selectedLearnerGroups.detailLearnergroupsList.trees[0].title,
        'program 0 cohort 0',
      );
      await availableGroups.search.set('3');
      assert.strictEqual(availableGroups.cohorts.length, 1);
      assert.strictEqual(availableGroups.cohorts[0].title, 'program 0 cohort 0');
      assert.strictEqual(availableGroups.cohorts[0].trees.length, 5);
      assert.strictEqual(availableGroups.cohorts[0].trees[0].title, 'learner group 0');
      assert.ok(availableGroups.cohorts[0].trees[0].isHidden);
      assert.strictEqual(availableGroups.cohorts[0].trees[1].title, 'learner group 1');
      assert.ok(availableGroups.cohorts[0].trees[1].isHidden);
      assert.strictEqual(availableGroups.cohorts[0].trees[2].title, 'learner group 2');
      assert.ok(availableGroups.cohorts[0].trees[2].isHidden);
      assert.strictEqual(availableGroups.cohorts[0].trees[3].title, 'learner group 3');
      assert.notOk(availableGroups.cohorts[0].trees[3].isHidden);
      assert.strictEqual(availableGroups.cohorts[0].trees[3].subgroups.length, 2);
      assert.strictEqual(availableGroups.cohorts[0].trees[3].subgroups[0].title, 'learner group 5');
      assert.strictEqual(availableGroups.cohorts[0].trees[3].subgroups[1].title, 'learner group 6');
      assert.strictEqual(availableGroups.cohorts[0].trees[4].title, 'learner group 4');
      assert.ok(availableGroups.cohorts[0].trees[4].isHidden);
    });

    test('filter learner groups by subgroup should include top group', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('ilm-session', {
        sessionId: 1,
        learnerGroupIds: [1, 2, 4],
      });

      await page.visit({ courseId: 1, sessionId: 1 });

      assert.strictEqual(currentRouteName(), 'session.index');
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees.length,
        1,
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items.length,
        3,
      );

      await page.details.detailLearnersAndLearnerGroups.manage();

      const { selectedLearnerGroups, availableGroups } =
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager;

      assert.strictEqual(selectedLearnerGroups.detailLearnergroupsList.trees.length, 1);
      assert.strictEqual(selectedLearnerGroups.detailLearnergroupsList.trees[0].items.length, 3);
      assert.strictEqual(
        selectedLearnerGroups.detailLearnergroupsList.trees[0].title,
        'program 0 cohort 0',
      );
      await availableGroups.search.set('5');
      assert.strictEqual(availableGroups.cohorts.length, 1);
      assert.strictEqual(availableGroups.cohorts[0].title, 'program 0 cohort 0');
      assert.strictEqual(availableGroups.cohorts[0].trees.length, 5);
      assert.strictEqual(availableGroups.cohorts[0].trees[0].title, 'learner group 0');
      assert.ok(availableGroups.cohorts[0].trees[0].isHidden);
      assert.strictEqual(availableGroups.cohorts[0].trees[1].title, 'learner group 1');
      assert.ok(availableGroups.cohorts[0].trees[1].isHidden);
      assert.strictEqual(availableGroups.cohorts[0].trees[2].title, 'learner group 2');
      assert.ok(availableGroups.cohorts[0].trees[2].isHidden);
      assert.strictEqual(availableGroups.cohorts[0].trees[3].title, 'learner group 3');
      assert.notOk(availableGroups.cohorts[0].trees[3].isHidden);
      assert.strictEqual(availableGroups.cohorts[0].trees[3].subgroups.length, 2);
      assert.strictEqual(availableGroups.cohorts[0].trees[3].subgroups[0].title, 'learner group 5');
      assert.strictEqual(availableGroups.cohorts[0].trees[3].subgroups[1].title, 'learner group 6');
      assert.strictEqual(availableGroups.cohorts[0].trees[4].title, 'learner group 4');
      assert.ok(availableGroups.cohorts[0].trees[4].isHidden);
    });

    test('add learner group', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('ilm-session', {
        sessionId: 1,
        learnerGroupIds: [1, 2, 4],
      });

      await page.visit({ courseId: 1, sessionId: 1 });

      assert.strictEqual(currentRouteName(), 'session.index');
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees.length,
        1,
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items.length,
        3,
      );
      await page.details.detailLearnersAndLearnerGroups.manage();

      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees.length,
        1,
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items.length,
        3,
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items[0].text,
        'learner group 0',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items[1].text,
        'learner group 1',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items[2].text,
        'learner group 3',
      );
      await page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager.availableGroups.cohorts[0].trees[2].toggle();
      await page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].subgroups[0].toggle();

      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items.length,
        5,
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items.length,
        5,
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items[0].text,
        'learner group 0',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items[1].text,
        'learner group 1',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items[2].text,
        'learner group 2',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items[3].text,
        'learner group 3',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items[4].text,
        'learner group 3 » learner group 5 (0)',
      );
      await page.details.detailLearnersAndLearnerGroups.save();

      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees.length,
        1,
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items.length,
        5,
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].title,
        'program 0 cohort 0',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items[0].text,
        'learner group 0',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items[1].text,
        'learner group 1',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items[2].text,
        'learner group 2',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items[3].text,
        'learner group 3',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items[4].text,
        'learner group 3 » learner group 5 (0)',
      );
    });

    test('add learner sub group', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('ilm-session', {
        sessionId: 1,
        learnerGroupIds: [1, 2, 4],
      });

      await page.visit({ courseId: 1, sessionId: 1 });

      assert.strictEqual(currentRouteName(), 'session.index');
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items.length,
        3,
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items[0].text,
        'learner group 0',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items[1].text,
        'learner group 1',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items[2].text,
        'learner group 3',
      );
      await page.details.detailLearnersAndLearnerGroups.manage();

      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items.length,
        3,
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items[0].text,
        'learner group 0',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items[1].text,
        'learner group 1',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items[2].text,
        'learner group 3',
      );

      await page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].subgroups[0].toggle();

      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items.length,
        4,
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items[0].text,
        'learner group 0',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items[1].text,
        'learner group 1',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items[2].text,
        'learner group 3',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items[3].text,
        'learner group 3 » learner group 5 (0)',
      );

      await page.details.detailLearnersAndLearnerGroups.save();

      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees.length,
        1,
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items.length,
        4,
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items[0].text,
        'learner group 0',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items[1].text,
        'learner group 1',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items[2].text,
        'learner group 3',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items[3].text,
        'learner group 3 » learner group 5 (0)',
      );
    });

    test('add learner group with children', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('ilm-session', {
        sessionId: 1,
        learnerGroupIds: [1, 2],
      });

      await page.visit({ courseId: 1, sessionId: 1 });

      assert.strictEqual(currentRouteName(), 'session.index');
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items.length,
        2,
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items[0].text,
        'learner group 0',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items[1].text,
        'learner group 1',
      );
      await page.details.detailLearnersAndLearnerGroups.manage();

      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items.length,
        2,
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items[0].text,
        'learner group 0',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items[1].text,
        'learner group 1',
      );
      assert.notOk(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager.availableGroups
          .cohorts[0].trees[3].isChecked,
      );
      assert.notOk(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager.availableGroups
          .cohorts[0].trees[3].subgroups[0].isChecked,
      );
      assert.notOk(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager.availableGroups
          .cohorts[0].trees[3].subgroups[1].isChecked,
      );
      await page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].toggle();
      assert.ok(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager.availableGroups
          .cohorts[0].trees[3].isChecked,
      );
      assert.ok(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager.availableGroups
          .cohorts[0].trees[3].subgroups[0].isChecked,
      );
      assert.ok(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager.availableGroups
          .cohorts[0].trees[3].subgroups[1].isChecked,
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items.length,
        5,
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items[0].text,
        'learner group 0',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items[1].text,
        'learner group 1',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items[2].text,
        'learner group 3',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items[3].text,
        'learner group 3 » learner group 5 (0)',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items[4].text,
        'learner group 3 » learner group 6 (0)',
      );

      await page.details.detailLearnersAndLearnerGroups.save();

      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items.length,
        5,
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items[0].text,
        'learner group 0',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items[1].text,
        'learner group 1',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items[2].text,
        'learner group 3',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items[3].text,
        'learner group 3 » learner group 5 (0)',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items[4].text,
        'learner group 3 » learner group 6 (0)',
      );
    });

    test('add learner group with children and remove one child', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('ilm-session', {
        sessionId: 1,
        learnerGroupIds: [1, 2],
      });

      await page.visit({ courseId: 1, sessionId: 1 });

      assert.strictEqual(currentRouteName(), 'session.index');
      await page.details.detailLearnersAndLearnerGroups.manage();
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items.length,
        2,
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items[0].text,
        'learner group 0',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items[1].text,
        'learner group 1',
      );
      assert.notOk(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager.availableGroups
          .cohorts[0].trees[3].isChecked,
      );
      assert.notOk(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager.availableGroups
          .cohorts[0].trees[3].subgroups[0].isChecked,
      );
      assert.notOk(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager.availableGroups
          .cohorts[0].trees[3].subgroups[1].isChecked,
      );
      await page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].toggle();
      assert.ok(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager.availableGroups
          .cohorts[0].trees[3].isChecked,
      );
      assert.ok(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager.availableGroups
          .cohorts[0].trees[3].subgroups[0].isChecked,
      );
      assert.ok(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager.availableGroups
          .cohorts[0].trees[3].subgroups[1].isChecked,
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items.length,
        5,
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items[0].text,
        'learner group 0',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items[1].text,
        'learner group 1',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items[2].text,
        'learner group 3',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items[3].text,
        'learner group 3 » learner group 5 (0)',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items[4].text,
        'learner group 3 » learner group 6 (0)',
      );
      await page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees[0].items[3].remove();
      assert.ok(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager.availableGroups
          .cohorts[0].trees[3].isChecked,
      );
      assert.notOk(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager.availableGroups
          .cohorts[0].trees[3].subgroups[0].isChecked,
      );
      assert.ok(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager.availableGroups
          .cohorts[0].trees[3].subgroups[1].isChecked,
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items.length,
        4,
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items[0].text,
        'learner group 0',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items[1].text,
        'learner group 1',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items[2].text,
        'learner group 3',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items[3].text,
        'learner group 3 » learner group 6 (0)',
      );

      await page.details.detailLearnersAndLearnerGroups.save();

      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items.length,
        4,
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items[0].text,
        'learner group 0',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items[1].text,
        'learner group 1',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items[2].text,
        'learner group 3',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items[3].text,
        'learner group 3 » learner group 6 (0)',
      );
    });

    test('undo learner group change', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('ilm-session', {
        sessionId: 1,
        learnerGroupIds: [1, 2, 4],
      });

      await page.visit({ courseId: 1, sessionId: 1 });

      assert.strictEqual(currentRouteName(), 'session.index');
      assert.strictEqual(currentRouteName(), 'session.index');
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items.length,
        3,
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items[0].text,
        'learner group 0',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items[1].text,
        'learner group 1',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items[2].text,
        'learner group 3',
      );

      await page.details.detailLearnersAndLearnerGroups.manage();

      await page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager.availableGroups.cohorts[0].trees[2].toggle();
      await page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].toggle();
      await page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees[0].items[0].remove();

      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items.length,
        2,
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items[0].text,
        'learner group 1',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager
          .selectedLearnerGroups.detailLearnergroupsList.trees[0].items[1].text,
        'learner group 2',
      );

      await page.details.detailLearnersAndLearnerGroups.cancel();

      assert.strictEqual(currentRouteName(), 'session.index');
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items.length,
        3,
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items[0].text,
        'learner group 0',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items[1].text,
        'learner group 1',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearnerGroups.detailLearnergroupsList
          .trees[0].items[2].text,
        'learner group 3',
      );
    });

    test('add learner', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('ilm-session', {
        sessionId: 1,
        learnerIds: [2, 3],
      });

      await page.visit({ courseId: 1, sessionId: 1 });

      assert.strictEqual(currentRouteName(), 'session.index');

      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearners.learners.length,
        2,
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
        3,
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearners.learners[0].userNameInfo
          .fullName,
        '1 guy M. Mc1son',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearners.learners[1].userNameInfo
          .fullName,
        '2 guy M. Mc2son',
      );
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearners.learners[2].userNameInfo
          .fullName,
        'joe u. shmoe',
      );
    });

    test('remove learner', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('ilm-session', {
        sessionId: 1,
        learnerIds: [2, 3],
      });

      await page.visit({ courseId: 1, sessionId: 1 });

      assert.strictEqual(currentRouteName(), 'session.index');
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearners.learners.length,
        2,
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
        1,
      );
    });

    test('undo learner change', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('ilm-session', {
        sessionId: 1,
        learnerIds: [2, 3],
      });

      await page.visit({ courseId: 1, sessionId: 1 });

      assert.strictEqual(currentRouteName(), 'session.index');
      assert.strictEqual(
        page.details.detailLearnersAndLearnerGroups.selectedLearners.learners.length,
        2,
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
        2,
      );
    });
  });

  test('initial state with save works as expected #1773', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const sessionType = this.server.create('session-type', { school: this.school });
    this.server.create('program', {
      school: this.school,
    });
    this.server.create('program-year', {
      programId: 1,
    });
    this.server.create('cohort', {
      programYearId: 1,
    });
    this.server.create('course', {
      school: this.school,
      cohortIds: [1],
    });
    this.server.createList('learner-group', 2, {
      cohortId: 1,
    });
    this.server.create('session', {
      courseId: 1,
      sessionType,
    });
    this.server.create('ilm-session', {
      sessionId: 1,
    });
    await page.visit({ courseId: 1, sessionId: 1 });
    await page.details.detailLearnersAndLearnerGroups.manage();
    await page.details.detailLearnersAndLearnerGroups.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].toggle();
    await page.details.detailLearnersAndLearnerGroups.save();

    const { selectedLearnerGroups } = page.details.detailLearnersAndLearnerGroups;
    assert.strictEqual(selectedLearnerGroups.detailLearnergroupsList.trees.length, 1);
    assert.strictEqual(
      selectedLearnerGroups.detailLearnergroupsList.trees[0].title,
      'program 0 cohort 0',
    );
    assert.strictEqual(selectedLearnerGroups.detailLearnergroupsList.trees[0].items.length, 1);
    assert.strictEqual(
      selectedLearnerGroups.detailLearnergroupsList.trees[0].items[0].text,
      'learner group 0',
    );
  });
});
