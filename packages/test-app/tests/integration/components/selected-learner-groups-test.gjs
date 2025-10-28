import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { component } from 'ilios-common/page-objects/components/selected-learner-groups';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import SelectedLearnerGroups from 'ilios-common/components/selected-learner-groups';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | selected-learner-groups', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const users = this.server.createList('user', 5);
    const program = this.server.create('program');
    const programYear = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', { programYear });
    const tlg1 = this.server.create('learner-group', {
      title: 'tlg1',
      users: [users[0], users[1]],
      cohort,
    });
    const subGroup1 = this.server.create('learner-group', {
      title: 'sub group 1',
      parent: tlg1,
      users: [users[0], users[1], users[2]],
      cohort,
    });
    const subSubGroup1 = this.server.create('learner-group', {
      title: 'sub sub group 1',
      parent: subGroup1,
      users: [users[0]],
      cohort,
    });
    const tlg2 = this.server.create('learner-group', {
      title: 'tlg2',
      users: [users[0], users[1]],
      cohort,
    });
    const subGroup2 = this.server.create('learner-group', {
      title: 'sub group 2',
      parent: tlg2,
      cohort,
    });
    const store = this.owner.lookup('service:store');
    this.tlg1 = await store.findRecord('learner-group', tlg1.id);
    this.subGroup1 = await store.findRecord('learner-group', subGroup1.id);
    this.subSubGroup = await store.findRecord('learner-group', subSubGroup1.id);
    this.subGroup2 = await store.findRecord('learner-group', subGroup2.id);
  });

  test('it renders', async function (assert) {
    this.set('learnerGroups', [this.tlg1, this.subGroup1, this.subSubGroup, this.subGroup2]);
    await render(
      <template>
        <SelectedLearnerGroups
          @learnerGroups={{this.learnerGroups}}
          @remove={{(noop)}}
          @isManaging={{true}}
        />
      </template>,
    );
    assert.strictEqual(component.heading, 'Selected Learner Groups:');
    assert.strictEqual(component.detailLearnergroupsList.trees.length, 1);
    assert.strictEqual(component.detailLearnergroupsList.trees[0].title, 'program 0 cohort 0');
    assert.strictEqual(component.detailLearnergroupsList.trees[0].items.length, 4);
    assert.ok(component.detailLearnergroupsList.trees[0].items[0].text, 'tlg1 (2)');
    assert.ok(component.detailLearnergroupsList.trees[0].items[1].text, 'sub group 1 (3)');
    assert.ok(component.detailLearnergroupsList.trees[0].items[2].text, 'subsubgroup1(1)');
    assert.ok(component.detailLearnergroupsList.trees[0].items[3].text, 'sub group 2 (0)');
    assert.ok(component.detailLearnergroupsList.trees[0].items[0].isRemovable);
    assert.ok(component.detailLearnergroupsList.trees[0].items[1].isRemovable);
    assert.ok(component.detailLearnergroupsList.trees[0].items[2].isRemovable);
    assert.ok(component.detailLearnergroupsList.trees[0].items[3].isRemovable);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('read-only', async function (assert) {
    this.set('learnerGroups', [this.tlg1, this.subGroup1, this.subSubGroup, this.subGroup2]);
    await render(
      <template>
        <SelectedLearnerGroups @learnerGroups={{this.learnerGroups}} @remove={{(noop)}} />
      </template>,
    );
    assert.strictEqual(component.heading, 'Selected Learner Groups:');
    assert.strictEqual(component.detailLearnergroupsList.trees.length, 1);
    assert.strictEqual(component.detailLearnergroupsList.trees[0].title, 'program 0 cohort 0');
    assert.strictEqual(component.detailLearnergroupsList.trees[0].items.length, 4);
    assert.ok(component.detailLearnergroupsList.trees[0].items[0].text, 'tlg1 (2)');
    assert.ok(component.detailLearnergroupsList.trees[0].items[1].text, 'sub group 1 (3)');
    assert.ok(component.detailLearnergroupsList.trees[0].items[2].text, 'subsubgroup1(1)');
    assert.ok(component.detailLearnergroupsList.trees[0].items[3].text, 'sub group 2 (0)');
    assert.notOk(component.detailLearnergroupsList.trees[0].items[0].isRemovable);
    assert.notOk(component.detailLearnergroupsList.trees[0].items[1].isRemovable);
    assert.notOk(component.detailLearnergroupsList.trees[0].items[2].isRemovable);
    assert.notOk(component.detailLearnergroupsList.trees[0].items[3].isRemovable);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('remove', async function (assert) {
    this.set('learnerGroups', [this.tlg1, this.subGroup1, this.subSubGroup, this.subGroup2]);
    this.set('remove', (learnerGroup) => {
      assert.step('remove called');
      assert.strictEqual(this.subGroup2, learnerGroup);
    });
    await render(
      <template>
        <SelectedLearnerGroups
          @learnerGroups={{this.learnerGroups}}
          @remove={{this.remove}}
          @isManaging={{true}}
        />
      </template>,
    );
    await component.detailLearnergroupsList.trees[0].items[3].remove();
    assert.verifySteps(['remove called']);
  });
});
