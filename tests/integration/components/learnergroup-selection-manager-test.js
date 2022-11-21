import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/learnergroup-selection-manager';

module('Integration | Component | learnergroup-selection-manager', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
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
      needsAccommodation: true,
    });
    const secondLevelLearnerGroup3 = this.server.create('learner-group', {
      title: 'Second 10',
      cohort: cohort2,
      needsAccommodation: true,
    });
    const topLevelLearnerGroup1 = this.server.create('learner-group', {
      title: 'Top Group 1',
      children: [secondLevelLearnerGroup1, secondLevelLearnerGroup2],
      cohort: cohort1,
      needsAccommodation: true,
    });
    const topLevelLearnerGroup2 = this.server.create('learner-group', {
      title: 'Top Group 2',
      children: [secondLevelLearnerGroup3],
      cohort: cohort2,
    });
    const topLevelLearnerGroup3 = this.server.create('learner-group', {
      title: 'Top Group 10',
      cohort: cohort2,
    });

    const store = this.owner.lookup('service:store');
    this.cohort1 = await store.findRecord('cohort', cohort1.id);
    this.cohort2 = await store.findRecord('cohort', cohort2.id);
    this.topLevelLearnerGroup1 = await store.findRecord('learner-group', topLevelLearnerGroup1.id);
    this.topLevelLearnerGroup2 = await store.findRecord('learner-group', topLevelLearnerGroup2.id);
    this.topLevelLearnerGroup3 = await store.findRecord('learner-group', topLevelLearnerGroup3.id);
    this.secondLevelLearnerGroup1 = await store.findRecord(
      'learner-group',
      secondLevelLearnerGroup1.id
    );
    this.secondLevelLearnerGroup2 = await store.findRecord(
      'learner-group',
      secondLevelLearnerGroup2.id
    );
    this.secondLevelLearnerGroup3 = await store.findRecord(
      'learner-group',
      secondLevelLearnerGroup3.id
    );
  });

  test('it renders', async function (assert) {
    this.set('learnerGroups', [this.secondLevelLearnerGroup1, this.secondLevelLearnerGroup3]);
    this.set('cohorts', [this.cohort1, this.cohort2]);
    await render(hbs`<LearnergroupSelectionManager
      @learnerGroups={{this.learnerGroups}}
      @cohorts={{this.cohorts}}
      @add={{(noop)}}
      @remove={{(noop)}}
    />
`);
    assert.strictEqual(component.selectedLearnerGroups.heading, 'Selected Learner Groups:');
    assert.strictEqual(component.selectedLearnerGroups.detailLearnergroupsList.trees.length, 2);
    assert.strictEqual(
      component.selectedLearnerGroups.detailLearnergroupsList.trees[0].title,
      'program 0 cohort 0'
    );
    assert.strictEqual(
      component.selectedLearnerGroups.detailLearnergroupsList.trees[0].items.length,
      1
    );
    assert.strictEqual(
      component.selectedLearnerGroups.detailLearnergroupsList.trees[0].items[0].text,
      'Top Group 1 » Second 1 (0)'
    );
    assert.notOk(
      component.selectedLearnerGroups.detailLearnergroupsList.trees[0].items[0].needsAccommodation
    );
    assert.strictEqual(
      component.selectedLearnerGroups.detailLearnergroupsList.trees[1].title,
      'program 0 cohort 1'
    );
    assert.strictEqual(
      component.selectedLearnerGroups.detailLearnergroupsList.trees[1].items.length,
      1
    );
    assert.strictEqual(
      component.selectedLearnerGroups.detailLearnergroupsList.trees[1].items[0].text,
      'Top Group 2 » Second 10 (0) members of this group require accommodation'
    );
    assert.ok(
      component.selectedLearnerGroups.detailLearnergroupsList.trees[1].items[0].needsAccommodation
    );
    assert.strictEqual(component.availableGroups.heading, 'Available Learner Groups:');
    assert.strictEqual(component.availableGroups.cohorts.length, 2);
    assert.strictEqual(component.availableGroups.cohorts[0].title, 'program 0 cohort 0');
    assert.strictEqual(component.availableGroups.cohorts[0].trees.length, 1);
    assert.strictEqual(component.availableGroups.cohorts[0].trees[0].title, 'Top Group 1');
    assert.ok(component.availableGroups.cohorts[0].trees[0].needsAccommodation);
    assert.notOk(component.availableGroups.cohorts[0].trees[0].isHidden);
    assert.strictEqual(component.availableGroups.cohorts[0].trees[0].subgroups.length, 2);
    assert.strictEqual(
      component.availableGroups.cohorts[0].trees[0].subgroups[0].title,
      'Second 1'
    );
    assert.notOk(component.availableGroups.cohorts[0].trees[0].subgroups[0].isHidden);
    assert.ok(component.availableGroups.cohorts[0].trees[0].subgroups[0].isChecked);
    assert.strictEqual(
      component.availableGroups.cohorts[0].trees[0].subgroups[1].title,
      'Second 2'
    );
    assert.ok(component.availableGroups.cohorts[0].trees[0].subgroups[1].needsAccommodation);
    assert.notOk(component.availableGroups.cohorts[0].trees[0].subgroups[1].isHidden);
    assert.notOk(component.availableGroups.cohorts[0].trees[0].subgroups[1].isChecked);
    assert.strictEqual(component.availableGroups.cohorts[1].title, 'program 0 cohort 1');
    assert.strictEqual(component.availableGroups.cohorts[1].trees.length, 2);
    assert.strictEqual(component.availableGroups.cohorts[1].trees[0].title, 'Top Group 2');
    assert.notOk(component.availableGroups.cohorts[1].trees[0].needsAccommodation);
    assert.notOk(component.availableGroups.cohorts[1].trees[0].isHidden);
    assert.notOk(component.availableGroups.cohorts[1].trees[0].isChecked);
    assert.strictEqual(component.availableGroups.cohorts[1].trees[0].subgroups.length, 1);
    assert.strictEqual(
      component.availableGroups.cohorts[1].trees[0].subgroups[0].title,
      'Second 10'
    );
    assert.notOk(component.availableGroups.cohorts[1].trees[0].subgroups[0].isHidden);
    assert.ok(component.availableGroups.cohorts[1].trees[0].subgroups[0].isChecked);
    assert.strictEqual(component.availableGroups.cohorts[1].trees[1].title, 'Top Group 10');
    assert.notOk(component.availableGroups.cohorts[1].trees[1].needsAccommodation);
    assert.notOk(component.availableGroups.cohorts[1].trees[1].isHidden);
    assert.notOk(component.availableGroups.cohorts[1].trees[1].isChecked);
    assert.strictEqual(component.availableGroups.cohorts[1].trees[1].subgroups.length, 0);
  });

  test('remove group from selected list', async function (assert) {
    assert.expect(1);
    this.set('remove', (learnerGroup) => {
      assert.ok(this.secondLevelLearnerGroup1, learnerGroup);
    });
    this.set('learnerGroups', [this.secondLevelLearnerGroup1]);
    this.set('cohorts', [this.cohort1]);
    await render(hbs`<LearnergroupSelectionManager
      @learnerGroups={{this.learnerGroups}}
      @cohorts={{this.cohorts}}
      @add={{(noop)}}
      @remove={{this.remove}}
    />
`);
    await component.selectedLearnerGroups.detailLearnergroupsList.trees[0].items[0].remove();
  });

  test('remove group in picker', async function (assert) {
    assert.expect(2);
    this.set('remove', (learnerGroup) => {
      assert.ok(this.secondLevelLearnerGroup1, learnerGroup);
    });
    this.set('learnerGroups', [this.secondLevelLearnerGroup1]);
    this.set('cohorts', [this.cohort1]);
    await render(hbs`<LearnergroupSelectionManager
      @learnerGroups={{this.learnerGroups}}
      @cohorts={{this.cohorts}}
      @add={{(noop)}}
      @remove={{this.remove}}
    />
`);
    assert.ok(component.availableGroups.cohorts[0].trees[0].subgroups[0].isChecked);
    await component.availableGroups.cohorts[0].trees[0].subgroups[0].toggle();
  });

  test('add available group', async function (assert) {
    assert.expect(2);
    this.set('add', (learnerGroup) => {
      assert.ok(this.secondLevelLearnerGroup1, learnerGroup);
    });
    this.set('learnerGroups', []);
    this.set('cohorts', [this.cohort1]);
    await render(hbs`<LearnergroupSelectionManager
      @learnerGroups={{this.learnerGroups}}
      @cohorts={{this.cohorts}}
      @add={{this.add}}
      @remove={{(noop)}}
    />
`);
    assert.notOk(component.availableGroups.cohorts[0].trees[0].subgroups[0].isChecked);
    await component.availableGroups.cohorts[0].trees[0].subgroups[0].toggle();
  });
});
