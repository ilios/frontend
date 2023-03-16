import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/learnergroup-selection-cohort-manager';

module('Integration | Component | learnergroup-selection-cohort-manager', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const program = this.server.create('program');
    const programYear1 = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', {
      programYear: programYear1,
    });
    const secondLevelLearnerGroup1 = this.server.create('learner-group', {
      title: 'Second 1',
      cohort,
    });
    const secondLevelLearnerGroup2 = this.server.create('learner-group', {
      title: 'Second 2',
      cohort,
      needsAccommodation: true,
    });
    const topLevelLearnerGroup1 = this.server.create('learner-group', {
      title: 'Top Group 1',
      children: [secondLevelLearnerGroup1, secondLevelLearnerGroup2],
      cohort,
      needsAccommodation: true,
    });
    const store = this.owner.lookup('service:store');
    this.cohort = await store.findRecord('cohort', cohort.id);
    this.topLevelLearnerGroup1 = await store.findRecord('learner-group', topLevelLearnerGroup1.id);
    this.secondLevelLearnerGroup1 = await store.findRecord(
      'learner-group',
      secondLevelLearnerGroup1.id
    );
    this.secondLevelLearnerGroup2 = await store.findRecord(
      'learner-group',
      secondLevelLearnerGroup2.id
    );
  });

  test('it renders', async function (assert) {
    this.set('learnerGroups', [this.secondLevelLearnerGroup1, this.secondLevelLearnerGroup3]);
    this.set('cohorts', this.cohort);
    this.set('filter', '');
    await render(hbs`<LearnergroupSelectionCohortManager
      @learnerGroups={{this.learnerGroups}}
      @cohort={{this.cohort}}
      @add={{(noop)}}
      @remove={{(noop)}}
      @filter={{this.filter}}
    />
`);
    assert.strictEqual(component.title, 'program 0 cohort 0');
    assert.strictEqual(component.trees.length, 1);
    assert.strictEqual(component.trees[0].title, 'Top Group 1');
    assert.ok(component.trees[0].needsAccommodation);
    assert.notOk(component.trees[0].isHidden);
    assert.strictEqual(component.trees[0].subgroups.length, 2);
    assert.strictEqual(component.trees[0].subgroups[0].title, 'Second 1');
    assert.notOk(component.trees[0].subgroups[0].isHidden);
    assert.ok(component.trees[0].subgroups[0].isChecked);
    assert.strictEqual(component.trees[0].subgroups[1].title, 'Second 2');
    assert.ok(component.trees[0].subgroups[1].needsAccommodation);
    assert.notOk(component.trees[0].subgroups[1].isHidden);
    assert.notOk(component.trees[0].subgroups[1].isChecked);
  });

  test('remove group in picker', async function (assert) {
    assert.expect(2);
    this.set('filter', '');
    this.set('remove', (learnerGroup) => {
      assert.ok(this.secondLevelLearnerGroup1, learnerGroup);
    });
    this.set('learnerGroups', [this.secondLevelLearnerGroup1]);
    this.set('cohort', this.cohort);
    await render(hbs`<LearnergroupSelectionCohortManager
      @learnerGroups={{this.learnerGroups}}
      @cohort={{this.cohort}}
      @add={{(noop)}}
      @remove={{this.remove}}
      @filter={{this.filter}}
    />
`);
    assert.ok(component.trees[0].subgroups[0].isChecked);
    await component.trees[0].subgroups[0].toggle();
  });

  test('add available group', async function (assert) {
    assert.expect(2);
    this.set('filter', '');
    this.set('add', (learnerGroup) => {
      assert.ok(this.secondLevelLearnerGroup1, learnerGroup);
    });
    this.set('learnerGroups', []);
    this.set('cohorts', this.cohort);
    await render(hbs`<LearnergroupSelectionCohortManager
      @learnerGroups={{this.learnerGroups}}
      @cohort={{this.cohort}}
      @add={{this.add}}
      @remove={{(noop)}}
      @filter={{this.filter}}
    />
`);
    assert.notOk(component.trees[0].subgroups[0].isChecked);
    await component.trees[0].subgroups[0].toggle();
  });

  test('filter applies', async function (assert) {
    this.set('filter', 'Second 2');
    this.set('learnerGroups', [this.secondLevelLearnerGroup1, this.secondLevelLearnerGroup2]);
    this.set('cohort', this.cohort);
    await render(hbs`<LearnergroupSelectionCohortManager
      @learnerGroups={{this.learnerGroups}}
      @cohort={{this.cohort}}
      @add={{(noop)}}
      @remove={{this.remove}}
      @filter={{this.filter}}
    />
`);
    assert.strictEqual(component.trees[0].title, 'Top Group 1');
    assert.notOk(component.trees[0].isHidden);
    assert.strictEqual(component.trees[0].subgroups.length, 2);
    assert.strictEqual(component.trees[0].subgroups[0].title, 'Second 1');
    assert.ok(component.trees[0].subgroups[0].isHidden);
    assert.strictEqual(component.trees[0].subgroups[1].title, 'Second 2');
    assert.notOk(component.trees[0].subgroups[1].isHidden);
  });
});
