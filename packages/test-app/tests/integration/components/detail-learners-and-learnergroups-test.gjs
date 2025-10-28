import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { click, render } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { component } from 'ilios-common/page-objects/components/detail-learners-and-learner-groups';
import DetailLearnersAndLearnerGroups from 'ilios-common/components/detail-learners-and-learner-groups';
import { array } from '@ember/helper';

module('Integration | Component | detail-learners-and-learner-groups', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const learners = this.server.createList('user', 4);
    const program = this.server.create('program');
    const programYear1 = this.server.create('program-year', { program });
    const programYear2 = this.server.create('program-year', { program });
    const cohort1 = this.server.create('cohort', {
      programYear: programYear1,
    });
    const cohort2 = this.server.create('cohort', {
      programYear: programYear2,
    });
    const secondLevelLearnerGroup1 = this.server.create('learner-group', {
      title: 'Second 1',
      cohort: cohort1,
    });
    const secondLevelLearnerGroup2 = this.server.create('learner-group', {
      title: 'Second 2',
      cohort: cohort1,
    });
    const secondLevelLearnerGroup3 = this.server.create('learner-group', {
      title: 'Second 3',
      cohort: cohort2,
    });
    const topLevelLearnerGroup1 = this.server.create('learner-group', {
      title: 'Top Group 1',
      children: [secondLevelLearnerGroup1, secondLevelLearnerGroup2],
      cohort: cohort1,
    });
    const topLevelLearnerGroup2 = this.server.create('learner-group', {
      title: 'Top Group 2',
      children: [secondLevelLearnerGroup3],
      cohort: cohort2,
    });
    const topLevelLearnerGroup3 = this.server.create('learner-group', {
      title: 'Top Group 3',
      cohort: cohort2,
    });

    const course = this.server.create('course', {
      cohorts: [cohort1, cohort2],
    });
    const session = this.server.create('session', {
      course,
    });
    const ilmSession = this.server.create('ilm-session', {
      session,
      learners: [learners[0], learners[1], learners[2]],
      learnerGroups: [secondLevelLearnerGroup1, secondLevelLearnerGroup2, topLevelLearnerGroup3],
    });

    const store = this.owner.lookup('service:store');
    this.cohort1 = await store.findRecord('cohort', cohort1.id);
    this.cohort2 = await store.findRecord('cohort', cohort2.id);
    this.topLevelLearnerGroup1 = await store.findRecord('learner-group', topLevelLearnerGroup1.id);
    this.topLevelLearnerGroup2 = await store.findRecord('learner-group', topLevelLearnerGroup2.id);
    this.topLevelLearnerGroup3 = await store.findRecord('learner-group', topLevelLearnerGroup3.id);
    this.secondLevelLearnerGroup1 = await store.findRecord(
      'learner-group',
      secondLevelLearnerGroup1.id,
    );
    this.secondLevelLearnerGroup2 = await store.findRecord(
      'learner-group',
      secondLevelLearnerGroup2.id,
    );
    this.secondLevelLearnerGroup3 = await store.findRecord(
      'learner-group',
      secondLevelLearnerGroup3.id,
    );
    this.learner1 = await store.findRecord('user', learners[0].id);
    this.learner2 = await store.findRecord('user', learners[1].id);
    this.learner3 = await store.findRecord('user', learners[2].id);
    this.learner4 = await store.findRecord('user', learners[3].id);
    this.session = await store.findRecord('session', session.id);
    this.ilmSession = await store.findRecord('ilm-session', ilmSession.id);
  });

  test('it renders', async function (assert) {
    this.set('session', this.session);
    this.set('cohorts', [this.cohort1, this.cohort2]);
    await render(
      <template>
        <DetailLearnersAndLearnerGroups
          @editable={{true}}
          @session={{this.session}}
          @cohorts={{this.cohorts}}
        />
      </template>,
    );
    assert.strictEqual(component.title, 'Learners (3) and Learner Groups (3)');
    assert.strictEqual(component.selectedLearners.learners.length, 3);
    assert.strictEqual(
      component.selectedLearners.learners[0].userNameInfo.fullName,
      '0 guy M. Mc0son',
    );
    assert.strictEqual(
      component.selectedLearners.learners[1].userNameInfo.fullName,
      '1 guy M. Mc1son',
    );
    assert.strictEqual(
      component.selectedLearners.learners[2].userNameInfo.fullName,
      '2 guy M. Mc2son',
    );
    assert.strictEqual(component.selectedLearnerGroups.detailLearnergroupsList.trees.length, 2);
    assert.strictEqual(
      component.selectedLearnerGroups.detailLearnergroupsList.trees[0].title,
      'program 0 cohort 0',
    );
    assert.strictEqual(
      component.selectedLearnerGroups.detailLearnergroupsList.trees[0].items.length,
      2,
    );
    assert.strictEqual(
      component.selectedLearnerGroups.detailLearnergroupsList.trees[0].items[0].text,
      'Top Group 1 » Second 1 (0)',
    );
    assert.strictEqual(
      component.selectedLearnerGroups.detailLearnergroupsList.trees[0].items[1].text,
      'Top Group 1 » Second 2 (0)',
    );
    assert.strictEqual(
      component.selectedLearnerGroups.detailLearnergroupsList.trees[1].title,
      'program 0 cohort 1',
    );
    assert.strictEqual(
      component.selectedLearnerGroups.detailLearnergroupsList.trees[1].items.length,
      1,
    );
    assert.strictEqual(
      component.selectedLearnerGroups.detailLearnergroupsList.trees[1].items[0].text,
      'Top Group 3',
    );
  });

  test('manage', async function (assert) {
    this.set('session', this.session);
    this.set('cohorts', [this.cohort1, this.cohort2]);
    await render(
      <template>
        <DetailLearnersAndLearnerGroups
          @editable={{true}}
          @session={{this.session}}
          @cohorts={{this.cohorts}}
        />
      </template>,
    );
    assert.ok(component.hasManageButton);
    assert.notOk(component.hasSaveButton);
    assert.notOk(component.hasCancelButton);
    await component.manage();
    assert.notOk(component.hasManageButton);
    assert.ok(component.hasSaveButton);
    assert.ok(component.hasCancelButton);
    assert.strictEqual(component.learnerSelectionManager.selectedLearners.learners.length, 3);
    assert.strictEqual(
      component.learnerSelectionManager.selectedLearners.learners[0].userNameInfo.fullName,
      '0 guy M. Mc0son',
    );
    assert.strictEqual(
      component.learnerSelectionManager.selectedLearners.learners[1].userNameInfo.fullName,
      '1 guy M. Mc1son',
    );
    assert.strictEqual(
      component.learnerSelectionManager.selectedLearners.learners[2].userNameInfo.fullName,
      '2 guy M. Mc2son',
    );
    assert.strictEqual(component.selectedLearnerGroups.detailLearnergroupsList.trees.length, 2);
    assert.strictEqual(
      component.selectedLearnerGroups.detailLearnergroupsList.trees[0].title,
      'program 0 cohort 0',
    );
    assert.strictEqual(
      component.selectedLearnerGroups.detailLearnergroupsList.trees[0].items.length,
      2,
    );
    assert.strictEqual(
      component.selectedLearnerGroups.detailLearnergroupsList.trees[0].items[0].text,
      'Top Group 1 » Second 1 (0)',
    );
    assert.notOk(
      component.selectedLearnerGroups.detailLearnergroupsList.trees[0].items[0].isChecked,
    );
    assert.strictEqual(
      component.selectedLearnerGroups.detailLearnergroupsList.trees[0].items[1].text,
      'Top Group 1 » Second 2 (0)',
    );
    assert.notOk(
      component.selectedLearnerGroups.detailLearnergroupsList.trees[0].items[1].isChecked,
    );
    assert.strictEqual(
      component.selectedLearnerGroups.detailLearnergroupsList.trees[1].title,
      'program 0 cohort 1',
    );
    assert.strictEqual(
      component.selectedLearnerGroups.detailLearnergroupsList.trees[1].items.length,
      1,
    );
    assert.strictEqual(
      component.selectedLearnerGroups.detailLearnergroupsList.trees[1].items[0].text,
      'Top Group 3',
    );
    assert.strictEqual(component.learnergroupSelectionManager.availableGroups.cohorts.length, 2);
    assert.strictEqual(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].title,
      'program 0 cohort 0',
    );
    assert.strictEqual(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees.length,
      1,
    );
    assert.strictEqual(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].title,
      'Top Group 1',
    );
    assert.notOk(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].isChecked,
    );
    assert.strictEqual(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups.length,
      2,
    );
    assert.strictEqual(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[0].title,
      'Second 1',
    );
    assert.ok(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[0]
        .isChecked,
    );
    assert.strictEqual(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[1].title,
      'Second 2',
    );
    assert.ok(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[1]
        .isChecked,
    );
    assert.strictEqual(
      component.learnergroupSelectionManager.availableGroups.cohorts[1].title,
      'program 0 cohort 1',
    );
    assert.strictEqual(
      component.learnergroupSelectionManager.availableGroups.cohorts[1].trees.length,
      2,
    );
    assert.strictEqual(
      component.learnergroupSelectionManager.availableGroups.cohorts[1].trees[0].title,
      'Top Group 2',
    );
    assert.notOk(
      component.learnergroupSelectionManager.availableGroups.cohorts[1].trees[0].isChecked,
    );
    assert.strictEqual(
      component.learnergroupSelectionManager.availableGroups.cohorts[1].trees[0].subgroups.length,
      1,
    );
    assert.strictEqual(
      component.learnergroupSelectionManager.availableGroups.cohorts[1].trees[0].subgroups[0].title,
      'Second 3',
    );
    assert.notOk(
      component.learnergroupSelectionManager.availableGroups.cohorts[1].trees[0].subgroups[0]
        .isChecked,
    );
    assert.strictEqual(
      component.learnergroupSelectionManager.availableGroups.cohorts[1].trees[1].title,
      'Top Group 3',
    );
    assert.ok(component.learnergroupSelectionManager.availableGroups.cohorts[1].trees[1].isChecked);
  });

  test('read-only', async function (assert) {
    this.set('session', this.session);
    this.set('cohorts', [this.cohort1, this.cohort2]);
    await render(
      <template>
        <DetailLearnersAndLearnerGroups
          @editable={{false}}
          @session={{this.session}}
          @cohorts={{this.cohorts}}
        />
      </template>,
    );
    assert.notOk(component.hasManageButton);
  });

  test('remove selected learner', async function (assert) {
    this.set('session', this.session);
    this.set('cohorts', [this.cohort1, this.cohort2]);
    await render(
      <template>
        <DetailLearnersAndLearnerGroups
          @editable={{true}}
          @session={{this.session}}
          @cohorts={{this.cohorts}}
        />
      </template>,
    );
    await component.manage();
    assert.strictEqual(component.learnerSelectionManager.selectedLearners.learners.length, 3);
    await component.learnerSelectionManager.selectedLearners.learners[0].remove();
    assert.strictEqual(component.learnerSelectionManager.selectedLearners.learners.length, 2);
  });

  test('remove learner-group from list', async function (assert) {
    this.set('session', this.session);
    this.set('cohorts', [this.cohort1, this.cohort2]);
    await render(
      <template>
        <DetailLearnersAndLearnerGroups
          @editable={{true}}
          @session={{this.session}}
          @cohorts={{this.cohorts}}
        />
      </template>,
    );
    await component.manage();
    assert.strictEqual(
      component.learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees[0]
        .items.length,
      2,
    );
    assert.ok(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[0]
        .isChecked,
    );
    await component.learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees[0].items[0].remove();
    assert.strictEqual(
      component.learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees[0]
        .items.length,
      1,
    );
    assert.notOk(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[0]
        .isChecked,
    );
  });

  test('remove learner-group from picker', async function (assert) {
    this.set('session', this.session);
    this.set('cohorts', [this.cohort1, this.cohort2]);
    await render(
      <template>
        <DetailLearnersAndLearnerGroups
          @editable={{true}}
          @session={{this.session}}
          @cohorts={{this.cohorts}}
        />
      </template>,
    );
    await component.manage();
    assert.strictEqual(
      component.learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees[0]
        .items.length,
      2,
    );
    assert.ok(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[0]
        .isChecked,
    );
    await component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[0].toggle();
    assert.strictEqual(
      component.learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees[0]
        .items.length,
      1,
    );
    assert.notOk(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[0]
        .isChecked,
    );
  });

  test('add available learner-group', async function (assert) {
    this.set('session', this.session);
    this.set('cohorts', [this.cohort1, this.cohort2]);
    await render(
      <template>
        <DetailLearnersAndLearnerGroups
          @editable={{true}}
          @session={{this.session}}
          @cohorts={{this.cohorts}}
        />
      </template>,
    );
    await component.manage();
    assert.strictEqual(
      component.learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees[1]
        .items.length,
      1,
    );
    assert.notOk(
      component.learnergroupSelectionManager.availableGroups.cohorts[1].trees[0].subgroups[0]
        .isChecked,
    );
    await component.learnergroupSelectionManager.availableGroups.cohorts[1].trees[0].subgroups[0].toggle();
    assert.strictEqual(
      component.learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees[1]
        .items.length,
      2,
    );
    assert.ok(
      component.learnergroupSelectionManager.availableGroups.cohorts[1].trees[0].subgroups[0]
        .isChecked,
    );
  });

  test('add learner', async function (assert) {
    this.set('session', this.session);
    this.set('cohorts', [this.cohort1, this.cohort2]);

    this.server.get('api/users', (schema, { queryParams }) => {
      assert.step('API called');
      assert.strictEqual(queryParams['q'], 'does not matter');
      return schema.users.all();
    });
    await render(
      <template>
        <DetailLearnersAndLearnerGroups
          @editable={{true}}
          @session={{this.session}}
          @cohorts={{this.cohorts}}
        />
      </template>,
    );
    await component.manage();
    assert.strictEqual(component.learnerSelectionManager.selectedLearners.learners.length, 3);
    await component.learnerSelectionManager.search.searchBox.set('does not matter');
    assert.strictEqual(component.learnerSelectionManager.search.results.items.length, 4);
    await component.learnerSelectionManager.search.results.items[3].click();
    assert.strictEqual(component.learnerSelectionManager.selectedLearners.learners.length, 4);
    assert.verifySteps(['API called']);
  });

  test('cancel', async function (assert) {
    this.set('session', this.session);
    this.set('cohorts', [this.cohort1, this.cohort2]);
    await render(
      <template>
        <DetailLearnersAndLearnerGroups
          @editable={{true}}
          @session={{this.session}}
          @cohorts={{this.cohorts}}
        />
      </template>,
    );
    assert.strictEqual(component.selectedLearners.learners.length, 3);
    assert.strictEqual(
      component.selectedLearnerGroups.detailLearnergroupsList.trees[1].items.length,
      1,
    );
    await component.manage();
    assert.strictEqual(
      component.learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees[1]
        .items.length,
      1,
    );
    assert.notOk(
      component.learnergroupSelectionManager.availableGroups.cohorts[1].trees[0].subgroups[0]
        .isChecked,
    );
    await component.learnergroupSelectionManager.availableGroups.cohorts[1].trees[0].subgroups[0].toggle();
    assert.strictEqual(
      component.learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees[1]
        .items.length,
      2,
    );
    assert.ok(
      component.learnergroupSelectionManager.availableGroups.cohorts[1].trees[0].subgroups[0]
        .isChecked,
    );
    assert.strictEqual(component.learnerSelectionManager.selectedLearners.learners.length, 3);
    await component.learnerSelectionManager.selectedLearners.learners[0].remove();
    assert.strictEqual(component.learnerSelectionManager.selectedLearners.learners.length, 2);
    await component.cancel();
    assert.strictEqual(component.selectedLearners.learners.length, 3);
    assert.strictEqual(
      component.selectedLearnerGroups.detailLearnergroupsList.trees[1].items.length,
      1,
    );
  });

  test('save', async function (assert) {
    this.set('session', this.session);
    this.set('cohorts', [this.cohort1, this.cohort2]);
    await render(
      <template>
        <DetailLearnersAndLearnerGroups
          @editable={{true}}
          @session={{this.session}}
          @cohorts={{this.cohorts}}
        />
      </template>,
    );
    assert.strictEqual(component.selectedLearners.learners.length, 3);
    assert.strictEqual(
      component.selectedLearnerGroups.detailLearnergroupsList.trees[1].items.length,
      1,
    );
    await component.manage();
    assert.strictEqual(
      component.learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees[1]
        .items.length,
      1,
    );
    assert.notOk(
      component.learnergroupSelectionManager.availableGroups.cohorts[1].trees[0].subgroups[0]
        .isChecked,
    );
    await component.learnergroupSelectionManager.availableGroups.cohorts[1].trees[0].subgroups[0].toggle();
    assert.strictEqual(
      component.learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees[1]
        .items.length,
      2,
    );
    assert.ok(
      component.learnergroupSelectionManager.availableGroups.cohorts[1].trees[0].subgroups[0]
        .isChecked,
    );
    assert.strictEqual(component.learnerSelectionManager.selectedLearners.learners.length, 3);
    await component.learnerSelectionManager.selectedLearners.learners[0].remove();
    assert.strictEqual(component.learnerSelectionManager.selectedLearners.learners.length, 2);
    await component.save();
    assert.strictEqual(component.selectedLearners.learners.length, 2);
    assert.strictEqual(
      component.selectedLearnerGroups.detailLearnergroupsList.trees[1].items.length,
      2,
    );
  });

  test('it updates when relationships change #1550', async function (assert) {
    this.set('session', this.session);
    await render(
      <template>
        <DetailLearnersAndLearnerGroups
          @editable={{true}}
          @session={{this.session}}
          @cohorts={{(array)}}
        />
      </template>,
    );
    assert.strictEqual(component.title, 'Learners (3) and Learner Groups (3)');
    assert.strictEqual(component.selectedLearners.learners.length, 3);
    assert.strictEqual(component.selectedLearnerGroups.detailLearnergroupsList.trees.length, 2);
    this.ilmSession.set('learners', []);
    this.ilmSession.set('learnerGroups', []);
    await this.ilmSession.save();
    assert.strictEqual(component.title, 'Learners (0) and Learner Groups (0)');
    assert.strictEqual(component.selectedLearners.learners.length, 0);
    assert.strictEqual(component.selectedLearnerGroups.detailLearnergroupsList.trees.length, 0);
  });

  test('adding a group with children adds them as well', async function (assert) {
    this.ilmSession.set('learnerGroups', []);
    this.set('session', this.session);
    this.set('cohorts', [this.cohort1, this.cohort2]);
    await render(
      <template>
        <DetailLearnersAndLearnerGroups
          @editable={{true}}
          @session={{this.session}}
          @cohorts={{this.cohorts}}
        />
      </template>,
    );
    await component.manage();
    assert.strictEqual(
      component.learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees
        .length,
      0,
    );
    assert.notOk(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].isChecked,
    );
    assert.notOk(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[0]
        .isChecked,
    );
    assert.notOk(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[1]
        .isChecked,
    );
    await component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].toggle();
    assert.strictEqual(
      component.learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees
        .length,
      1,
    );
    assert.strictEqual(
      component.learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees[0]
        .items.length,
      3,
    );
    assert.ok(component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].isChecked);
    assert.ok(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[0]
        .isChecked,
    );
    assert.ok(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[1]
        .isChecked,
    );
  });

  test('removing a group with children from the picker removes them as well', async function (assert) {
    this.ilmSession.set('learnerGroups', [
      this.topLevelLearnerGroup1,
      this.secondLevelLearnerGroup1,
      this.secondLevelLearnerGroup2,
    ]);
    this.set('session', this.session);
    this.set('cohorts', [this.cohort1, this.cohort2]);
    await render(
      <template>
        <DetailLearnersAndLearnerGroups
          @editable={{true}}
          @session={{this.session}}
          @cohorts={{this.cohorts}}
        />
      </template>,
    );
    await component.manage();
    assert.strictEqual(
      component.learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees
        .length,
      1,
    );
    assert.strictEqual(
      component.learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees[0]
        .items.length,
      3,
    );
    assert.ok(component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].isChecked);
    assert.ok(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[0]
        .isChecked,
    );
    assert.ok(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[1]
        .isChecked,
    );
    await component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].toggle();
    assert.strictEqual(
      component.learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees
        .length,
      0,
    );
    assert.notOk(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].isChecked,
    );
    assert.notOk(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[0]
        .isChecked,
    );
    assert.notOk(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[1]
        .isChecked,
    );
  });

  test('removing a group with children from the list removes them as well', async function (assert) {
    this.ilmSession.set('learnerGroups', [
      this.topLevelLearnerGroup1,
      this.secondLevelLearnerGroup1,
      this.secondLevelLearnerGroup2,
    ]);
    this.set('session', this.session);
    this.set('cohorts', [this.cohort1, this.cohort2]);
    await render(
      <template>
        <DetailLearnersAndLearnerGroups
          @editable={{true}}
          @session={{this.session}}
          @cohorts={{this.cohorts}}
        />
      </template>,
    );
    await component.manage();
    assert.strictEqual(
      component.learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees
        .length,
      1,
    );
    assert.strictEqual(
      component.learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees[0]
        .items.length,
      3,
    );
    assert.ok(component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].isChecked);
    assert.ok(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[0]
        .isChecked,
    );
    assert.ok(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[1]
        .isChecked,
    );
    await component.learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees[0].items[0].remove();
    assert.strictEqual(
      component.learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees
        .length,
      0,
    );
    assert.notOk(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].isChecked,
    );
    assert.notOk(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[0]
        .isChecked,
    );
    assert.notOk(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[1]
        .isChecked,
    );
  });

  test('selectively adding a group with children does not add the children', async function (assert) {
    this.ilmSession.set('learnerGroups', []);
    this.set('session', this.session);
    this.set('cohorts', [this.cohort1, this.cohort2]);
    await render(
      <template>
        <DetailLearnersAndLearnerGroups
          @editable={{true}}
          @session={{this.session}}
          @cohorts={{this.cohorts}}
        />
      </template>,
    );
    await component.manage();
    assert.strictEqual(
      component.learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees
        .length,
      0,
    );
    assert.notOk(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].isChecked,
    );
    assert.notOk(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[0]
        .isChecked,
    );
    assert.notOk(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[1]
        .isChecked,
    );
    await click('[data-test-learnergroup-tree-root=true] > [data-test-checkbox]', {
      shiftKey: true,
    });
    assert.strictEqual(
      component.learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees
        .length,
      1,
    );
    assert.strictEqual(
      component.learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees[0]
        .items.length,
      1,
    );
    assert.ok(component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].isChecked);
    assert.notOk(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[0]
        .isChecked,
    );
    assert.notOk(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[1]
        .isChecked,
    );
  });

  test('selectively removing a group with children from the picker does not remove the children', async function (assert) {
    this.ilmSession.set('learnerGroups', [
      this.topLevelLearnerGroup1,
      this.secondLevelLearnerGroup1,
      this.secondLevelLearnerGroup2,
    ]);
    this.set('session', this.session);
    this.set('cohorts', [this.cohort1, this.cohort2]);
    await render(
      <template>
        <DetailLearnersAndLearnerGroups
          @editable={{true}}
          @session={{this.session}}
          @cohorts={{this.cohorts}}
        />
      </template>,
    );
    await component.manage();
    assert.strictEqual(
      component.learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees
        .length,
      1,
    );
    assert.strictEqual(
      component.learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees[0]
        .items.length,
      3,
    );
    assert.ok(component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].isChecked);
    assert.ok(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[0]
        .isChecked,
    );
    assert.ok(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[1]
        .isChecked,
    );
    await click('[data-test-learnergroup-tree-root=true] > [data-test-checkbox]', {
      shiftKey: true,
    });
    assert.notOk(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].isChecked,
    );
    assert.ok(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[0]
        .isChecked,
    );
    assert.ok(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[1]
        .isChecked,
    );
  });

  test('selectively removing a group with children from the list does not remove the children', async function (assert) {
    this.ilmSession.set('learnerGroups', [
      this.topLevelLearnerGroup1,
      this.secondLevelLearnerGroup1,
      this.secondLevelLearnerGroup2,
    ]);
    this.set('session', this.session);
    this.set('cohorts', [this.cohort1, this.cohort2]);
    await render(
      <template>
        <DetailLearnersAndLearnerGroups
          @editable={{true}}
          @session={{this.session}}
          @cohorts={{this.cohorts}}
        />
      </template>,
    );
    await component.manage();
    assert.strictEqual(
      component.learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees
        .length,
      1,
    );
    assert.strictEqual(
      component.learnergroupSelectionManager.selectedLearnerGroups.detailLearnergroupsList.trees[0]
        .items.length,
      3,
    );
    assert.ok(component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].isChecked);
    assert.ok(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[0]
        .isChecked,
    );
    assert.ok(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[1]
        .isChecked,
    );
    await click('[data-test-remove-learnergroup]', { at: 0, shiftKey: true });
    assert.notOk(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].isChecked,
    );
    assert.ok(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[0]
        .isChecked,
    );
    assert.ok(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[1]
        .isChecked,
    );
  });
});
