import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/detail-learners-and-learner-groups';

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
    const ilmSession = this.server.create('ilmSession', {
      learners: [learners[0], learners[1], learners[2]],
      learnerGroups: [secondLevelLearnerGroup1, secondLevelLearnerGroup2, topLevelLearnerGroup3],
    });

    const store = this.owner.lookup('service:store');
    this.cohort1 = await store.find('cohort', cohort1.id);
    this.cohort2 = await store.find('cohort', cohort2.id);
    this.topLevelLearnerGroup1 = await store.find('learner-group', topLevelLearnerGroup1.id);
    this.topLevelLearnerGroup2 = await store.find('learner-group', topLevelLearnerGroup2.id);
    this.topLevelLearnerGroup3 = await store.find('learner-group', topLevelLearnerGroup3.id);
    this.secondLevelLearnerGroup1 = await store.find('learner-group', secondLevelLearnerGroup1.id);
    this.secondLevelLearnerGroup2 = await store.find('learner-group', secondLevelLearnerGroup2.id);
    this.secondLevelLearnerGroup3 = await store.find('learner-group', secondLevelLearnerGroup3.id);
    this.learner1 = await store.find('user', learners[0].id);
    this.learner2 = await store.find('user', learners[1].id);
    this.learner3 = await store.find('user', learners[2].id);
    this.learner4 = await store.find('user', learners[3].id);
    this.ilmSession = await store.find('ilmSession', ilmSession.id);
  });

  test('it renders', async function (assert) {
    this.set('ilmSession', this.ilmSession);
    this.set('cohorts', [this.cohort1, this.cohort2]);
    await render(hbs`<DetailLearnersAndLearnerGroups
      @editable={{true}}
      @ilmSession={{this.ilmSession}}
      @cohorts={{this.cohorts}}
    />`);
    assert.strictEqual(component.title, 'Learners and Learner Groups (3/3)');
    assert.strictEqual(component.detailLearnerList.learners.length, 3);
    assert.strictEqual(
      component.detailLearnerList.learners[0].userNameInfo.fullName,
      '0 guy M. Mc0son'
    );
    assert.strictEqual(
      component.detailLearnerList.learners[1].userNameInfo.fullName,
      '1 guy M. Mc1son'
    );
    assert.strictEqual(
      component.detailLearnerList.learners[2].userNameInfo.fullName,
      '2 guy M. Mc2son'
    );
    assert.strictEqual(component.detailLearnergroupsList.trees.length, 2);
    assert.strictEqual(component.detailLearnergroupsList.trees[0].subgroups.length, 3);
    assert.strictEqual(
      component.detailLearnergroupsList.trees[0].subgroups[0].title,
      'Top Group 1 (0)'
    );
    assert.strictEqual(
      component.detailLearnergroupsList.trees[0].subgroups[1].title,
      'Second 1 (0)'
    );
    assert.strictEqual(
      component.detailLearnergroupsList.trees[0].subgroups[2].title,
      'Second 2 (0)'
    );
    assert.strictEqual(component.detailLearnergroupsList.trees[1].subgroups.length, 1);
    assert.strictEqual(
      component.detailLearnergroupsList.trees[1].subgroups[0].title,
      'Top Group 3 (0)'
    );
  });

  test('manage', async function (assert) {
    this.set('ilmSession', this.ilmSession);
    this.set('cohorts', [this.cohort1, this.cohort2]);
    await render(hbs`<DetailLearnersAndLearnerGroups
      @editable={{true}}
      @ilmSession={{this.ilmSession}}
      @cohorts={{this.cohorts}}
    />`);
    assert.ok(component.hasManageButton);
    assert.notOk(component.hasSaveButton);
    assert.notOk(component.hasCancelButton);
    await component.manage();
    assert.notOk(component.hasManageButton);
    assert.ok(component.hasSaveButton);
    assert.ok(component.hasCancelButton);
    assert.strictEqual(
      component.learnerSelectionManager.selectedLearners.detailLearnerList.learners.length,
      3
    );
    assert.strictEqual(
      component.learnerSelectionManager.selectedLearners.detailLearnerList.learners[0].userNameInfo
        .fullName,
      '0 guy M. Mc0son'
    );
    assert.strictEqual(
      component.learnerSelectionManager.selectedLearners.detailLearnerList.learners[1].userNameInfo
        .fullName,
      '1 guy M. Mc1son'
    );
    assert.strictEqual(
      component.learnerSelectionManager.selectedLearners.detailLearnerList.learners[2].userNameInfo
        .fullName,
      '2 guy M. Mc2son'
    );
    assert.strictEqual(component.learnergroupSelectionManager.selectedGroups.list.trees.length, 2);
    assert.strictEqual(
      component.learnergroupSelectionManager.selectedGroups.list.trees[0].subgroups.length,
      3
    );
    assert.strictEqual(
      component.learnergroupSelectionManager.selectedGroups.list.trees[0].subgroups[0].title,
      'Top Group 1 (0)'
    );
    assert.strictEqual(
      component.learnergroupSelectionManager.selectedGroups.list.trees[0].subgroups[1].title,
      'Second 1 (0)'
    );
    assert.strictEqual(
      component.learnergroupSelectionManager.selectedGroups.list.trees[0].subgroups[2].title,
      'Second 2 (0)'
    );
    assert.strictEqual(
      component.learnergroupSelectionManager.selectedGroups.list.trees[1].subgroups.length,
      1
    );
    assert.strictEqual(
      component.learnergroupSelectionManager.selectedGroups.list.trees[1].subgroups[0].title,
      'Top Group 3 (0)'
    );
    assert.strictEqual(component.learnergroupSelectionManager.availableGroups.cohorts.length, 2);
    assert.strictEqual(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].title,
      'program 0 cohort 0'
    );
    assert.strictEqual(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees.length,
      1
    );
    assert.strictEqual(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].title,
      'Top Group 1'
    );
    assert.notOk(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].isHidden
    );
    assert.strictEqual(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups.length,
      2
    );
    assert.strictEqual(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[0].title,
      'Second 1'
    );
    assert.ok(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[0]
        .isHidden
    );
    assert.strictEqual(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[1].title,
      'Second 2'
    );
    assert.ok(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[1]
        .isHidden
    );
    assert.strictEqual(
      component.learnergroupSelectionManager.availableGroups.cohorts[1].title,
      'program 0 cohort 1'
    );
    assert.strictEqual(
      component.learnergroupSelectionManager.availableGroups.cohorts[1].trees.length,
      2
    );
    assert.strictEqual(
      component.learnergroupSelectionManager.availableGroups.cohorts[1].trees[0].title,
      'Top Group 2'
    );
    assert.notOk(
      component.learnergroupSelectionManager.availableGroups.cohorts[1].trees[0].isHidden
    );
    assert.strictEqual(
      component.learnergroupSelectionManager.availableGroups.cohorts[1].trees[0].subgroups.length,
      1
    );
    assert.strictEqual(
      component.learnergroupSelectionManager.availableGroups.cohorts[1].trees[0].subgroups[0].title,
      'Second 3'
    );
    assert.notOk(
      component.learnergroupSelectionManager.availableGroups.cohorts[1].trees[0].subgroups[0]
        .isHidden
    );
    assert.strictEqual(
      component.learnergroupSelectionManager.availableGroups.cohorts[1].trees[1].title,
      'Top Group 3'
    );
    assert.ok(component.learnergroupSelectionManager.availableGroups.cohorts[1].trees[1].isHidden);
  });

  test('read-only', async function (assert) {
    this.set('ilmSession', this.ilmSession);
    this.set('cohorts', [this.cohort1, this.cohort2]);
    await render(hbs`<DetailLearnersAndLearnerGroups
      @editable={{false}}
      @ilmSession={{this.ilmSession}}
      @cohorts={{this.cohorts}}
    />`);
    assert.notOk(component.hasManageButton);
  });

  test('remove selected learner', async function (assert) {
    this.set('ilmSession', this.ilmSession);
    this.set('cohorts', [this.cohort1, this.cohort2]);
    await render(hbs`<DetailLearnersAndLearnerGroups
      @editable={{true}}
      @ilmSession={{this.ilmSession}}
      @cohorts={{this.cohorts}}
    />`);
    await component.manage();
    assert.strictEqual(
      component.learnerSelectionManager.selectedLearners.detailLearnerList.learners.length,
      3
    );
    await component.learnerSelectionManager.selectedLearners.detailLearnerList.learners[0].remove();
    assert.strictEqual(
      component.learnerSelectionManager.selectedLearners.detailLearnerList.learners.length,
      2
    );
  });

  test('remove selected learner-group', async function (assert) {
    this.set('ilmSession', this.ilmSession);
    this.set('cohorts', [this.cohort1, this.cohort2]);
    await render(hbs`<DetailLearnersAndLearnerGroups
      @editable={{true}}
      @ilmSession={{this.ilmSession}}
      @cohorts={{this.cohorts}}
    />`);
    await component.manage();
    assert.strictEqual(
      component.learnergroupSelectionManager.selectedGroups.list.trees[0].subgroups.length,
      3
    );
    assert.ok(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[0]
        .isHidden
    );
    await component.learnergroupSelectionManager.selectedGroups.list.trees[0].subgroups[1].remove();
    assert.strictEqual(
      component.learnergroupSelectionManager.selectedGroups.list.trees[0].subgroups.length,
      2
    );
    assert.notOk(
      component.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups[0]
        .isHidden
    );
  });

  test('add available learner-group', async function (assert) {
    this.set('ilmSession', this.ilmSession);
    this.set('cohorts', [this.cohort1, this.cohort2]);
    await render(hbs`<DetailLearnersAndLearnerGroups
      @editable={{true}}
      @ilmSession={{this.ilmSession}}
      @cohorts={{this.cohorts}}
    />`);
    await component.manage();
    assert.strictEqual(component.learnergroupSelectionManager.selectedGroups.list.trees.length, 2);
    assert.notOk(
      component.learnergroupSelectionManager.availableGroups.cohorts[1].trees[0].subgroups[0]
        .isHidden
    );
    await component.learnergroupSelectionManager.availableGroups.cohorts[1].trees[0].subgroups[0].add();
    assert.strictEqual(component.learnergroupSelectionManager.selectedGroups.list.trees.length, 3);
    assert.ok(
      component.learnergroupSelectionManager.availableGroups.cohorts[1].trees[0].subgroups[0]
        .isHidden
    );
  });

  test('add learner', async function (assert) {
    assert.expect(4);
    this.set('ilmSession', this.ilmSession);
    this.set('cohorts', [this.cohort1, this.cohort2]);

    this.server.get('api/users', (schema, { queryParams }) => {
      assert.strictEqual(queryParams['q'], 'does not matter');
      return schema.users.all();
    });
    await render(hbs`<DetailLearnersAndLearnerGroups
      @editable={{true}}
      @ilmSession={{this.ilmSession}}
      @cohorts={{this.cohorts}}
    />`);
    await component.manage();
    assert.strictEqual(
      component.learnerSelectionManager.selectedLearners.detailLearnerList.learners.length,
      3
    );
    await component.learnerSelectionManager.search('does not matter');
    assert.strictEqual(component.learnerSelectionManager.searchResults.length, 4);
    await component.learnerSelectionManager.searchResults[3].add();
    assert.strictEqual(
      component.learnerSelectionManager.selectedLearners.detailLearnerList.learners.length,
      4
    );
  });

  test('cancel', async function (assert) {
    this.set('ilmSession', this.ilmSession);
    this.set('cohorts', [this.cohort1, this.cohort2]);
    await render(hbs`<DetailLearnersAndLearnerGroups
      @editable={{true}}
      @ilmSession={{this.ilmSession}}
      @cohorts={{this.cohorts}}
    />`);
    assert.strictEqual(component.detailLearnerList.learners.length, 3);
    assert.strictEqual(component.detailLearnergroupsList.trees.length, 2);
    await component.manage();
    assert.strictEqual(component.learnergroupSelectionManager.selectedGroups.list.trees.length, 2);
    assert.notOk(
      component.learnergroupSelectionManager.availableGroups.cohorts[1].trees[0].subgroups[0]
        .isHidden
    );
    await component.learnergroupSelectionManager.availableGroups.cohorts[1].trees[0].subgroups[0].add();
    assert.strictEqual(component.learnergroupSelectionManager.selectedGroups.list.trees.length, 3);
    assert.ok(
      component.learnergroupSelectionManager.availableGroups.cohorts[1].trees[0].subgroups[0]
        .isHidden
    );
    assert.strictEqual(
      component.learnerSelectionManager.selectedLearners.detailLearnerList.learners.length,
      3
    );
    await component.learnerSelectionManager.selectedLearners.detailLearnerList.learners[0].remove();
    assert.strictEqual(
      component.learnerSelectionManager.selectedLearners.detailLearnerList.learners.length,
      2
    );
    await component.cancel();
    assert.strictEqual(component.detailLearnerList.learners.length, 3);
    assert.strictEqual(component.detailLearnergroupsList.trees.length, 2);
  });

  test('save', async function (assert) {
    this.set('ilmSession', this.ilmSession);
    this.set('cohorts', [this.cohort1, this.cohort2]);
    await render(hbs`<DetailLearnersAndLearnerGroups
      @editable={{true}}
      @ilmSession={{this.ilmSession}}
      @cohorts={{this.cohorts}}
    />`);
    assert.strictEqual(component.detailLearnerList.learners.length, 3);
    assert.strictEqual(component.detailLearnergroupsList.trees.length, 2);
    await component.manage();
    assert.strictEqual(component.learnergroupSelectionManager.selectedGroups.list.trees.length, 2);
    assert.notOk(
      component.learnergroupSelectionManager.availableGroups.cohorts[1].trees[0].subgroups[0]
        .isHidden
    );
    await component.learnergroupSelectionManager.availableGroups.cohorts[1].trees[0].subgroups[0].add();
    assert.strictEqual(component.learnergroupSelectionManager.selectedGroups.list.trees.length, 3);
    assert.ok(
      component.learnergroupSelectionManager.availableGroups.cohorts[1].trees[0].subgroups[0]
        .isHidden
    );
    assert.strictEqual(
      component.learnerSelectionManager.selectedLearners.detailLearnerList.learners.length,
      3
    );
    await component.learnerSelectionManager.selectedLearners.detailLearnerList.learners[0].remove();
    assert.strictEqual(
      component.learnerSelectionManager.selectedLearners.detailLearnerList.learners.length,
      2
    );
    await component.save();
    assert.strictEqual(component.detailLearnerList.learners.length, 2);
    assert.strictEqual(component.detailLearnergroupsList.trees.length, 3);
  });

  test('it updates when relationships change #1550', async function (assert) {
    this.set('ilmSession', this.ilmSession);
    await render(hbs`<DetailLearnersAndLearnerGroups
      @editable={{true}}
      @ilmSession={{this.ilmSession}}
      @cohorts={{array}}
    />`);
    assert.strictEqual(component.title, 'Learners and Learner Groups (3/3)');
    assert.strictEqual(component.detailLearnerList.learners.length, 3);
    assert.strictEqual(component.detailLearnergroupsList.trees.length, 2);
    this.ilmSession.set('learners', []);
    this.ilmSession.set('learnerGroups', []);
    await this.ilmSession.save();
    assert.strictEqual(component.title, 'Learners and Learner Groups (0/0)');
    assert.strictEqual(component.detailLearnerList.learners.length, 0);
    assert.strictEqual(component.detailLearnergroupsList.trees.length, 0);
  });
});
