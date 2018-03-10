import { currentRouteName } from '@ember/test-helpers';
import {
  module,
  test
} from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from 'ilios/tests/pages/session';

module('Acceptance: Session - Learner Groups', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    await setupAuthentication({ school: this.school });
  });

  module('With Fixtures', function (hooks) {
    hooks.beforeEach(async function () {
      this.server.create('program', {
        school: this.school
      });
      this.server.create('programYear', {
        programId: 1
      });
      this.server.create('cohort', {
        programYearId: 1
      });
      this.server.create('course', {
        school: this.school,
        cohortIds: [1],
      });
      this.server.create('sessionType');
      this.server.createList('learnerGroup', 5, {
        cohortId: 1
      });
      this.server.createList('learnerGroup', 2, {
        cohortId: 1,
        parentId: 4
      });
      this.server.create('learnerGroup', {
        cohortId: 1,
        parentId: 5
      });
      this.server.create('session', {
        courseId: 1,
      });
    });

    test('initial selected learner groups', async function(assert) {
      this.server.create('ilmSession', {
        sessionId: 1,
        learnerGroupIds: [1, 2, 4]
      });
      await page.visit({ courseId: 1, sessionId: 1, sessionLearnergroupDetails: true });
      assert.equal(currentRouteName(), 'session.index');
      assert.equal(page.learnerGroups.current().count, 3);
      assert.equal(page.learnerGroups.current(0).title, 'learner group 0 (program 0 cohort 0)');
      assert.equal(page.learnerGroups.current(1).title, 'learner group 1 (program 0 cohort 0)');
      assert.equal(page.learnerGroups.current(2).title, 'learner group 3 (program 0 cohort 0)');

      assert.equal(page.learnerGroups.current(0).groups().count, 1);
      assert.equal(page.learnerGroups.current(0).groups(0).title, 'learner group 0 (0)');
      assert.ok(page.learnerGroups.current(0).groups(0).isTopLevelGroup);
      assert.equal(page.learnerGroups.current(1).groups().count, 1);
      assert.equal(page.learnerGroups.current(1).groups(0).title, 'learner group 1 (0)');
      assert.ok(page.learnerGroups.current(1).groups(0).isTopLevelGroup);
      assert.equal(page.learnerGroups.current(2).groups().count, 1);
      assert.equal(page.learnerGroups.current(2).groups(0).title, 'learner group 3 (0)');
      assert.ok(page.learnerGroups.current(2).groups(0).isTopLevelGroup);
    });

    test('learner group manager display', async function(assert) {
      this.server.create('ilmSession', {
        sessionId: 1,
        learnerGroupIds: [1, 2, 4]
      });
      await page.visit({ courseId: 1, sessionId: 1, sessionLearnergroupDetails: true });
      assert.equal(currentRouteName(), 'session.index');
      assert.equal(page.learnerGroups.current().count, 3);
      await page.learnerGroups.manage();

      const { selectedLearnerGroups, availableLearnerGroups } = page.learnerGroups.manager;

      assert.equal(selectedLearnerGroups().count, 3);
      assert.equal(selectedLearnerGroups(0).title, 'learner group 0 (program 0 cohort 0)');
      assert.equal(selectedLearnerGroups(1).title, 'learner group 1 (program 0 cohort 0)');
      assert.equal(selectedLearnerGroups(2).title, 'learner group 3 (program 0 cohort 0)');

      assert.equal(selectedLearnerGroups(0).groups().count, 1);
      assert.equal(selectedLearnerGroups(0).groups(0).title, 'learner group 0 (0)');
      assert.ok(selectedLearnerGroups(0).groups(0).isTopLevelGroup);
      assert.equal(selectedLearnerGroups(1).groups().count, 1);
      assert.equal(selectedLearnerGroups(1).groups(0).title, 'learner group 1 (0)');
      assert.ok(selectedLearnerGroups(1).groups(0).isTopLevelGroup);
      assert.equal(selectedLearnerGroups(2).groups().count, 1);
      assert.equal(selectedLearnerGroups(2).groups(0).title, 'learner group 3 (0)');
      assert.ok(selectedLearnerGroups(2).groups(0).isTopLevelGroup);

      assert.equal(availableLearnerGroups.cohorts().count, 1);
      assert.equal(availableLearnerGroups.cohorts(0).title, 'program 0 cohort 0');
      assert.equal(availableLearnerGroups.cohorts(0).topLevelGroups().count, 5);
      assert.equal(availableLearnerGroups.cohorts(0).topLevelGroups(0).title, 'learner group 0');
      assert.ok(availableLearnerGroups.cohorts(0).topLevelGroups(0).disabled);
      assert.notOk(availableLearnerGroups.cohorts(0).topLevelGroups(0).isVisible);
      assert.equal(availableLearnerGroups.cohorts(0).topLevelGroups(1).title, 'learner group 1');
      assert.ok(availableLearnerGroups.cohorts(0).topLevelGroups(1).disabled);
      assert.notOk(availableLearnerGroups.cohorts(0).topLevelGroups(1).isVisible);
      assert.equal(availableLearnerGroups.cohorts(0).topLevelGroups(2).title, 'learner group 2');
      assert.ok(availableLearnerGroups.cohorts(0).topLevelGroups(2).enabled);
      assert.ok(availableLearnerGroups.cohorts(0).topLevelGroups(2).isVisible);

      assert.equal(availableLearnerGroups.cohorts(0).topLevelGroups(3).title, 'learner group 3');
      assert.ok(availableLearnerGroups.cohorts(0).topLevelGroups(3).enabled);
      assert.ok(availableLearnerGroups.cohorts(0).topLevelGroups(3).isVisible);
      assert.equal(availableLearnerGroups.cohorts(0).topLevelGroups(3).groups().count, 2);
      assert.equal(availableLearnerGroups.cohorts(0).topLevelGroups(3).groups(0).title, 'learner group 5');
      assert.equal(availableLearnerGroups.cohorts(0).topLevelGroups(3).groups(1).title, 'learner group 6');

      assert.equal(availableLearnerGroups.cohorts(0).topLevelGroups(4).title, 'learner group 4');
      assert.ok(availableLearnerGroups.cohorts(0).topLevelGroups(4).enabled);
      assert.ok(availableLearnerGroups.cohorts(0).topLevelGroups(4).isVisible);
      assert.equal(availableLearnerGroups.cohorts(0).topLevelGroups(4).groups().count, 1);
      assert.equal(availableLearnerGroups.cohorts(0).topLevelGroups(4).groups(0).title, 'learner group 7');
    });

    test('learner group manager display with no selected groups', async function(assert) {
      this.server.create('ilmSession', {
        sessionId: 1,
        learnerGroupIds: []
      });
      await page.visit({ courseId: 1, sessionId: 1, sessionLearnergroupDetails: true });
      assert.equal(currentRouteName(), 'session.index');
      assert.equal(page.learnerGroups.current().count, 0);
      await page.learnerGroups.manage();

      const { selectedLearnerGroups, availableLearnerGroups } = page.learnerGroups.manager;
      assert.equal(selectedLearnerGroups().count, 0);

      assert.equal(availableLearnerGroups.cohorts().count, 1);
      assert.equal(availableLearnerGroups.cohorts(0).title, 'program 0 cohort 0');
      assert.equal(availableLearnerGroups.cohorts(0).topLevelGroups().count, 5);
      assert.equal(availableLearnerGroups.cohorts(0).topLevelGroups(0).title, 'learner group 0');
      assert.ok(availableLearnerGroups.cohorts(0).topLevelGroups(0).enabled);
      assert.ok(availableLearnerGroups.cohorts(0).topLevelGroups(0).isVisible);
      assert.equal(availableLearnerGroups.cohorts(0).topLevelGroups(1).title, 'learner group 1');
      assert.ok(availableLearnerGroups.cohorts(0).topLevelGroups(1).enabled);
      assert.ok(availableLearnerGroups.cohorts(0).topLevelGroups(1).isVisible);
      assert.equal(availableLearnerGroups.cohorts(0).topLevelGroups(2).title, 'learner group 2');
      assert.ok(availableLearnerGroups.cohorts(0).topLevelGroups(2).enabled);
      assert.ok(availableLearnerGroups.cohorts(0).topLevelGroups(2).isVisible);

      assert.equal(availableLearnerGroups.cohorts(0).topLevelGroups(3).title, 'learner group 3');
      assert.ok(availableLearnerGroups.cohorts(0).topLevelGroups(3).enabled);
      assert.ok(availableLearnerGroups.cohorts(0).topLevelGroups(3).isVisible);
      assert.equal(availableLearnerGroups.cohorts(0).topLevelGroups(3).groups().count, 2);
      assert.equal(availableLearnerGroups.cohorts(0).topLevelGroups(3).groups(0).title, 'learner group 5');
      assert.equal(availableLearnerGroups.cohorts(0).topLevelGroups(3).groups(1).title, 'learner group 6');

      assert.equal(availableLearnerGroups.cohorts(0).topLevelGroups(4).title, 'learner group 4');
      assert.ok(availableLearnerGroups.cohorts(0).topLevelGroups(4).enabled);
      assert.ok(availableLearnerGroups.cohorts(0).topLevelGroups(4).isVisible);
    });

    test('filter learner groups by top group should include all subgroups', async function(assert) {
      this.server.create('ilmSession', {
        sessionId: 1,
        learnerGroupIds: [1, 2, 4]
      });
      await page.visit({ courseId: 1, sessionId: 1, sessionLearnergroupDetails: true });
      assert.equal(currentRouteName(), 'session.index');
      assert.equal(page.learnerGroups.current().count, 3);
      await page.learnerGroups.manage();

      const { selectedLearnerGroups, availableLearnerGroups } = page.learnerGroups.manager;

      assert.equal(selectedLearnerGroups().count, 3);
      assert.equal(selectedLearnerGroups(0).title, 'learner group 0 (program 0 cohort 0)');
      assert.equal(selectedLearnerGroups(1).title, 'learner group 1 (program 0 cohort 0)');
      assert.equal(selectedLearnerGroups(2).title, 'learner group 3 (program 0 cohort 0)');

      await page.learnerGroups.manager.search(3);


      assert.equal(availableLearnerGroups.cohorts().count, 1);
      assert.equal(availableLearnerGroups.cohorts(0).title, 'program 0 cohort 0');
      assert.equal(availableLearnerGroups.cohorts(0).topLevelGroups().count, 5);
      assert.equal(availableLearnerGroups.cohorts(0).topLevelGroups(0).title, 'learner group 0');
      assert.ok(availableLearnerGroups.cohorts(0).topLevelGroups(0).disabled);
      assert.notOk(availableLearnerGroups.cohorts(0).topLevelGroups(0).isVisible);
      assert.equal(availableLearnerGroups.cohorts(0).topLevelGroups(1).title, 'learner group 1');
      assert.ok(availableLearnerGroups.cohorts(0).topLevelGroups(1).disabled);
      assert.notOk(availableLearnerGroups.cohorts(0).topLevelGroups(1).isVisible);
      assert.equal(availableLearnerGroups.cohorts(0).topLevelGroups(2).title, 'learner group 2');
      assert.ok(availableLearnerGroups.cohorts(0).topLevelGroups(2).enabled);
      assert.notOk(availableLearnerGroups.cohorts(0).topLevelGroups(2).isVisible);

      assert.equal(availableLearnerGroups.cohorts(0).topLevelGroups(3).title, 'learner group 3');
      assert.ok(availableLearnerGroups.cohorts(0).topLevelGroups(3).enabled);
      assert.ok(availableLearnerGroups.cohorts(0).topLevelGroups(3).isVisible);
      assert.equal(availableLearnerGroups.cohorts(0).topLevelGroups(3).groups().count, 2);
      assert.equal(availableLearnerGroups.cohorts(0).topLevelGroups(3).groups(0).title, 'learner group 5');
      assert.equal(availableLearnerGroups.cohorts(0).topLevelGroups(3).groups(1).title, 'learner group 6');

      assert.equal(availableLearnerGroups.cohorts(0).topLevelGroups(4).title, 'learner group 4');
      assert.ok(availableLearnerGroups.cohorts(0).topLevelGroups(4).enabled);
      assert.notOk(availableLearnerGroups.cohorts(0).topLevelGroups(4).isVisible);
    });

    test('filter learner groups by subgroup should include top group', async function(assert) {
      this.server.create('ilmSession', {
        sessionId: 1,
        learnerGroupIds: [1, 2, 4]
      });
      await page.visit({ courseId: 1, sessionId: 1, sessionLearnergroupDetails: true });
      assert.equal(currentRouteName(), 'session.index');
      assert.equal(page.learnerGroups.current().count, 3);
      await page.learnerGroups.manage();

      const { selectedLearnerGroups, availableLearnerGroups } = page.learnerGroups.manager;

      assert.equal(selectedLearnerGroups().count, 3);
      assert.equal(selectedLearnerGroups(0).title, 'learner group 0 (program 0 cohort 0)');
      assert.equal(selectedLearnerGroups(1).title, 'learner group 1 (program 0 cohort 0)');
      assert.equal(selectedLearnerGroups(2).title, 'learner group 3 (program 0 cohort 0)');

      await page.learnerGroups.manager.search(5);


      assert.equal(availableLearnerGroups.cohorts().count, 1);
      assert.equal(availableLearnerGroups.cohorts(0).title, 'program 0 cohort 0');
      assert.equal(availableLearnerGroups.cohorts(0).topLevelGroups().count, 5);
      assert.equal(availableLearnerGroups.cohorts(0).topLevelGroups(0).title, 'learner group 0');
      assert.ok(availableLearnerGroups.cohorts(0).topLevelGroups(0).disabled);
      assert.notOk(availableLearnerGroups.cohorts(0).topLevelGroups(0).isVisible);
      assert.equal(availableLearnerGroups.cohorts(0).topLevelGroups(1).title, 'learner group 1');
      assert.ok(availableLearnerGroups.cohorts(0).topLevelGroups(1).disabled);
      assert.notOk(availableLearnerGroups.cohorts(0).topLevelGroups(1).isVisible);
      assert.equal(availableLearnerGroups.cohorts(0).topLevelGroups(2).title, 'learner group 2');
      assert.ok(availableLearnerGroups.cohorts(0).topLevelGroups(2).enabled);
      assert.notOk(availableLearnerGroups.cohorts(0).topLevelGroups(2).isVisible);

      assert.equal(availableLearnerGroups.cohorts(0).topLevelGroups(3).title, 'learner group 3');
      assert.ok(availableLearnerGroups.cohorts(0).topLevelGroups(3).enabled);
      assert.ok(availableLearnerGroups.cohorts(0).topLevelGroups(3).isVisible);
      assert.equal(availableLearnerGroups.cohorts(0).topLevelGroups(3).groups().count, 2);
      assert.equal(availableLearnerGroups.cohorts(0).topLevelGroups(3).groups(0).title, 'learner group 5');
      assert.equal(availableLearnerGroups.cohorts(0).topLevelGroups(3).groups(1).title, 'learner group 6');

      assert.equal(availableLearnerGroups.cohorts(0).topLevelGroups(4).title, 'learner group 4');
      assert.ok(availableLearnerGroups.cohorts(0).topLevelGroups(4).enabled);
      assert.notOk(availableLearnerGroups.cohorts(0).topLevelGroups(4).isVisible);
    });

    test('add learner group', async function(assert) {
      this.server.create('ilmSession', {
        sessionId: 1,
        learnerGroupIds: [1, 2, 4]
      });

      await page.visit({ courseId: 1, sessionId: 1, sessionLearnergroupDetails: true });
      assert.equal(currentRouteName(), 'session.index');
      assert.equal(page.learnerGroups.current().count, 3);

      await page.learnerGroups.manage();
      const { selectedLearnerGroups, availableLearnerGroups } = page.learnerGroups.manager;
      assert.equal(selectedLearnerGroups().count, 3);
      await availableLearnerGroups.cohorts(0).topLevelGroups(2).add();
      await availableLearnerGroups.cohorts(0).topLevelGroups(3).groups(0).add();

      assert.equal(selectedLearnerGroups().count, 4);
      assert.equal(selectedLearnerGroups(0).title, 'learner group 0 (program 0 cohort 0)');
      assert.equal(selectedLearnerGroups(1).title, 'learner group 1 (program 0 cohort 0)');
      assert.equal(selectedLearnerGroups(3).title, 'learner group 3 (program 0 cohort 0)');

      await page.learnerGroups.save();
      assert.equal(page.learnerGroups.current().count, 4);
      assert.equal(page.learnerGroups.current(0).title, 'learner group 0 (program 0 cohort 0)');
      assert.equal(page.learnerGroups.current(1).title, 'learner group 1 (program 0 cohort 0)');
      assert.equal(page.learnerGroups.current(2).title, 'learner group 2 (program 0 cohort 0)');
      assert.equal(page.learnerGroups.current(3).title, 'learner group 3 (program 0 cohort 0)');
    });

    test('add learner sub group', async function(assert) {
      this.server.create('ilmSession', {
        sessionId: 1,
        learnerGroupIds: [1, 2, 4]
      });

      await page.visit({ courseId: 1, sessionId: 1, sessionLearnergroupDetails: true });
      assert.equal(currentRouteName(), 'session.index');
      assert.equal(page.learnerGroups.current().count, 3);

      await page.learnerGroups.manage();
      const { selectedLearnerGroups, availableLearnerGroups } = page.learnerGroups.manager;

      assert.equal(selectedLearnerGroups().count, 3);
      assert.equal(selectedLearnerGroups(2).groups(0).title, 'learner group 3 (0)');
      assert.ok(selectedLearnerGroups(2).groups(0).isTopLevelGroup);
      assert.equal(selectedLearnerGroups(2).groups().count, 1);

      await availableLearnerGroups.cohorts(0).topLevelGroups(3).groups(0).add();
      assert.equal(selectedLearnerGroups().count, 3);
      assert.equal(selectedLearnerGroups(0).title, 'learner group 0 (program 0 cohort 0)');
      assert.equal(selectedLearnerGroups(1).title, 'learner group 1 (program 0 cohort 0)');
      assert.equal(selectedLearnerGroups(2).title, 'learner group 3 (program 0 cohort 0)');
      assert.equal(selectedLearnerGroups(2).groups().count, 2);
      assert.equal(selectedLearnerGroups(2).groups(0).title, 'learner group 3 (0)');
      assert.equal(selectedLearnerGroups(2).groups(1).title, 'learner group 5 (0)');

      await page.learnerGroups.save();
      assert.equal(page.learnerGroups.current().count, 3);
      assert.equal(page.learnerGroups.current(0).title, 'learner group 0 (program 0 cohort 0)');
      assert.equal(page.learnerGroups.current(1).title, 'learner group 1 (program 0 cohort 0)');
      assert.equal(page.learnerGroups.current(2).title, 'learner group 3 (program 0 cohort 0)');
      assert.equal(page.learnerGroups.current(2).groups().count, 2);
      assert.equal(page.learnerGroups.current(2).groups(0).title, 'learner group 3 (0)');
      assert.ok(page.learnerGroups.current(2).groups(0).isTopLevelGroup);
      assert.equal(page.learnerGroups.current(2).groups(1).title, 'learner group 5 (0)');
      assert.notOk(page.learnerGroups.current(2).groups(1).isTopLevelGroup);
    });

    test('add learner group with children', async function(assert) {
      this.server.create('ilmSession', {
        sessionId: 1,
        learnerGroupIds: [1, 2, 4]
      });

      await page.visit({ courseId: 1, sessionId: 1, sessionLearnergroupDetails: true });
      assert.equal(currentRouteName(), 'session.index');
      assert.equal(page.learnerGroups.current().count, 3);

      await page.learnerGroups.manage();
      const { selectedLearnerGroups, availableLearnerGroups } = page.learnerGroups.manager;

      assert.equal(selectedLearnerGroups().count, 3);
      assert.equal(selectedLearnerGroups(2).groups(0).title, 'learner group 3 (0)');
      assert.ok(selectedLearnerGroups(2).groups(0).isTopLevelGroup);
      assert.equal(selectedLearnerGroups(2).groups().count, 1);

      await availableLearnerGroups.cohorts(0).topLevelGroups(3).add();
      assert.ok(availableLearnerGroups.cohorts(0).topLevelGroups(3).disabled);
      assert.notOk(availableLearnerGroups.cohorts(0).topLevelGroups(3).isVisible);

      assert.equal(selectedLearnerGroups().count, 3);
      assert.equal(selectedLearnerGroups(0).title, 'learner group 0 (program 0 cohort 0)');
      assert.equal(selectedLearnerGroups(1).title, 'learner group 1 (program 0 cohort 0)');
      assert.equal(selectedLearnerGroups(2).title, 'learner group 3 (program 0 cohort 0)');
      assert.equal(selectedLearnerGroups(2).groups().count, 3);
      assert.equal(selectedLearnerGroups(2).groups(0).title, 'learner group 3 (0)');
      assert.equal(selectedLearnerGroups(2).groups(1).title, 'learner group 5 (0)');
      assert.equal(selectedLearnerGroups(2).groups(2).title, 'learner group 6 (0)');

      await page.learnerGroups.save();
      assert.equal(page.learnerGroups.current().count, 3);
      assert.equal(page.learnerGroups.current(0).title, 'learner group 0 (program 0 cohort 0)');
      assert.equal(page.learnerGroups.current(1).title, 'learner group 1 (program 0 cohort 0)');
      assert.equal(page.learnerGroups.current(2).title, 'learner group 3 (program 0 cohort 0)');
      assert.equal(page.learnerGroups.current(2).groups().count, 3);
      assert.equal(page.learnerGroups.current(2).groups(0).title, 'learner group 3 (0)');
      assert.ok(page.learnerGroups.current(2).groups(0).isTopLevelGroup);
      assert.equal(page.learnerGroups.current(2).groups(1).title, 'learner group 5 (0)');
      assert.notOk(page.learnerGroups.current(2).groups(1).isTopLevelGroup);
      assert.equal(page.learnerGroups.current(2).groups(2).title, 'learner group 6 (0)');
      assert.notOk(page.learnerGroups.current(2).groups(2).isTopLevelGroup);
    });

    test('add learner group with children and remove one child', async function(assert) {
      this.server.create('ilmSession', {
        sessionId: 1,
        learnerGroupIds: [1, 2, 4]
      });

      await page.visit({ courseId: 1, sessionId: 1, sessionLearnergroupDetails: true });
      assert.equal(currentRouteName(), 'session.index');
      assert.equal(page.learnerGroups.current().count, 3);

      await page.learnerGroups.manage();
      const { selectedLearnerGroups, availableLearnerGroups } = page.learnerGroups.manager;

      assert.equal(selectedLearnerGroups().count, 3);
      assert.equal(selectedLearnerGroups(2).groups(0).title, 'learner group 3 (0)');
      assert.ok(selectedLearnerGroups(2).groups(0).isTopLevelGroup);
      assert.equal(selectedLearnerGroups(2).groups().count, 1);

      await availableLearnerGroups.cohorts(0).topLevelGroups(3).add();
      await selectedLearnerGroups(2).groups(1).remove();
      assert.ok(availableLearnerGroups.cohorts(0).topLevelGroups(3).enabled);
      assert.ok(availableLearnerGroups.cohorts(0).topLevelGroups(3).isVisible);

      assert.equal(selectedLearnerGroups().count, 3);
      assert.equal(selectedLearnerGroups(0).title, 'learner group 0 (program 0 cohort 0)');
      assert.equal(selectedLearnerGroups(1).title, 'learner group 1 (program 0 cohort 0)');
      assert.equal(selectedLearnerGroups(2).title, 'learner group 3 (program 0 cohort 0)');
      assert.equal(selectedLearnerGroups(2).groups().count, 2);
      assert.equal(selectedLearnerGroups(2).groups(0).title, 'learner group 3 (0)');
      assert.equal(selectedLearnerGroups(2).groups(1).title, 'learner group 6 (0)');

      await page.learnerGroups.save();
      assert.equal(page.learnerGroups.current().count, 3);
      assert.equal(page.learnerGroups.current(0).title, 'learner group 0 (program 0 cohort 0)');
      assert.equal(page.learnerGroups.current(1).title, 'learner group 1 (program 0 cohort 0)');
      assert.equal(page.learnerGroups.current(2).title, 'learner group 3 (program 0 cohort 0)');
      assert.equal(page.learnerGroups.current(2).groups().count, 2);
      assert.equal(page.learnerGroups.current(2).groups(0).title, 'learner group 3 (0)');
      assert.ok(page.learnerGroups.current(2).groups(0).isTopLevelGroup);
      assert.equal(page.learnerGroups.current(2).groups(1).title, 'learner group 6 (0)');
      assert.notOk(page.learnerGroups.current(2).groups(1).isTopLevelGroup);
    });

    test('undo learner group change', async function(assert) {
      this.server.create('ilmSession', {
        sessionId: 1,
        learnerGroupIds: [1, 2, 4]
      });

      await page.visit({ courseId: 1, sessionId: 1, sessionLearnergroupDetails: true });
      assert.equal(currentRouteName(), 'session.index');
      assert.equal(page.learnerGroups.current().count, 3);

      await page.learnerGroups.manage();
      const { selectedLearnerGroups, availableLearnerGroups } = page.learnerGroups.manager;
      await availableLearnerGroups.cohorts(0).topLevelGroups(2).add();
      await availableLearnerGroups.cohorts(0).topLevelGroups(3).add();
      await selectedLearnerGroups(3).groups(1).remove();

      await page.learnerGroups.cancel();
      assert.equal(page.learnerGroups.current().count, 3);
      assert.equal(page.learnerGroups.current(0).title, 'learner group 0 (program 0 cohort 0)');
      assert.equal(page.learnerGroups.current(1).title, 'learner group 1 (program 0 cohort 0)');
      assert.equal(page.learnerGroups.current(2).title, 'learner group 3 (program 0 cohort 0)');
      assert.equal(page.learnerGroups.current(2).groups().count, 1);
      assert.equal(page.learnerGroups.current(2).groups(0).title, 'learner group 3 (0)');
      assert.ok(page.learnerGroups.current(2).groups(0).isTopLevelGroup);
    });

    test('collapsed learner groups', async function (assert) {
      this.server.create('programYear', {
        programId: 1
      });
      this.server.create('cohort', {
        programYearId: 2
      });
      this.server.createList('learnerGroup', 2, {
        cohortId: 2
      });
      this.server.create('ilmSession', {
        sessionId: 1,
        learnerGroupIds: [1, 2, 4, 9, 10]
      });

      await page.visit({ courseId: 1, sessionId: 1 });

      assert.equal(page.collapseLearnerGroups.title, 'Learner Groups (5)');
      assert.equal(page.collapseLearnerGroups.headers().count, 2);
      assert.equal(page.collapseLearnerGroups.headers(0).title, 'Cohort');
      assert.equal(page.collapseLearnerGroups.headers(1).title, 'Learner Groups');

      assert.equal(page.collapseLearnerGroups.cohorts().count, 2);
      assert.equal(page.collapseLearnerGroups.cohorts(0).name, 'program 0 cohort 0');
      assert.equal(page.collapseLearnerGroups.cohorts(0).learnerGroups, 3);
      assert.equal(page.collapseLearnerGroups.cohorts(1).name, 'program 0 cohort 1');
      assert.equal(page.collapseLearnerGroups.cohorts(1).learnerGroups, 2);
    });

  });

  test('initial state with save works as expected #1773', async function(assert) {
    this.server.create('sessionType');
    this.server.create('program', {
      school: this.school
    });
    this.server.create('programYear', {
      programId: 1
    });
    this.server.create('cohort', {
      programYearId: 1
    });
    this.server.create('course', {
      school: this.school,
      cohortIds: [1],
    });
    this.server.createList('learnerGroup', 2, {
      cohortId: 1
    });
    this.server.create('session', {
      courseId: 1,
    });
    this.server.create('ilmSession', {
      sessionId: 1,
    });
    await page.visit({ courseId: 1, sessionId: 1 });
    await page.learnerGroups.manage();
    await page.learnerGroups.manager.availableLearnerGroups.cohorts(0).topLevelGroups(0).add();
    await page.learnerGroups.save();

    assert.equal(page.learnerGroups.current().count, 1);
    assert.equal(page.learnerGroups.current(0).title, 'learner group 0 (program 0 cohort 0)');
    assert.equal(page.learnerGroups.current(0).groups().count, 1);
    assert.equal(page.learnerGroups.current(0).groups(0).title, 'learner group 0 (0)');
    assert.ok(page.learnerGroups.current(0).groups(0).isTopLevelGroup);
  });
});
