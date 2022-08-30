import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/selected-learner-groups';
import { a11yAudit } from 'ember-a11y-testing/test-support';

module('Integration | Component | selected-learner-groups', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const users = this.server.createList('user', 5);

    const tlg1 = this.server.create('learner-group', {
      title: 'tlg1',
      users: [users[0], users[1]],
    });
    const subGroup1 = this.server.create('learner-group', {
      title: 'sub group 1',
      parent: tlg1,
      users: [users[0], users[1], users[2]],
    });
    const subSubGroup1 = this.server.create('learner-group', {
      title: 'sub sub group 1',
      parent: subGroup1,
      users: [users[0]],
    });

    const tlg2 = this.server.create('learner-group', {
      title: 'tlg2',
      users: [users[0], users[1]],
    });
    const subGroup2 = this.server.create('learner-group', {
      title: 'sub group 2',
      parent: tlg2,
    });

    const store = this.owner.lookup('service:store');
    this.tlg1 = await store.findRecord('learner-group', tlg1.id);
    this.subGroup1 = await store.findRecord('learner-group', subGroup1.id);
    this.subSubGroup = await store.findRecord('learner-group', subSubGroup1.id);
    this.subGroup2 = await store.findRecord('learner-group', subGroup2.id);
  });

  test('it renders', async function (assert) {
    this.set('learnerGroups', [this.tlg1, this.subGroup1, this.subSubGroup, this.subGroup2]);
    await render(hbs`<SelectedLearnerGroups
      @learnerGroups={{this.learnerGroups}}
      @remove={{(noop)}}
      @isManaging={{true}}
    />`);

    assert.strictEqual(component.heading, 'Selected Learner Groups:');
    assert.strictEqual(component.detailLearnergroupsList.trees.length, 2);
    assert.ok(component.detailLearnergroupsList.trees[0].title, 'tlg1 ( )');
    assert.strictEqual(component.detailLearnergroupsList.trees[0].subgroups.length, 3);
    assert.ok(component.detailLearnergroupsList.trees[0].subgroups[0].title, 'tlg1 (2)');
    assert.ok(component.detailLearnergroupsList.trees[0].subgroups[1].title, 'sub group 1 (3)');
    assert.ok(component.detailLearnergroupsList.trees[0].subgroups[2].title, 'subsubgroup1(1)');
    assert.strictEqual(component.detailLearnergroupsList.trees[1].subgroups.length, 2);
    assert.ok(component.detailLearnergroupsList.trees[1].title, 'tlg2 ( )');
    assert.ok(component.detailLearnergroupsList.trees[1].subgroups[0].title, 'tlg2 (2)');
    assert.ok(component.detailLearnergroupsList.trees[1].subgroups[1].title, 'sub group 2 (0)');
    assert.ok(component.detailLearnergroupsList.trees[0].isRemovable);
    assert.notOk(component.detailLearnergroupsList.trees[0].subgroups[0].isRemovable);
    assert.ok(component.detailLearnergroupsList.trees[0].subgroups[1].isRemovable);
    assert.ok(component.detailLearnergroupsList.trees[0].subgroups[2].isRemovable);
    assert.ok(component.detailLearnergroupsList.trees[1].isRemovable);
    assert.notOk(component.detailLearnergroupsList.trees[1].subgroups[0].isRemovable);
    assert.ok(component.detailLearnergroupsList.trees[1].subgroups[1].isRemovable);
    await a11yAudit();
    assert.ok(true, 'no a11y errors found!');
  });

  test('read-only', async function (assert) {
    this.set('learnerGroups', [this.tlg1, this.subGroup1, this.subSubGroup, this.subGroup2]);
    await render(hbs`<SelectedLearnerGroups
      @learnerGroups={{this.learnerGroups}}
      @remove={{(noop)}}
    />`);

    assert.notOk(component.detailLearnergroupsList.trees[0].isRemovable);
    assert.notOk(component.detailLearnergroupsList.trees[0].subgroups[0].isRemovable);
    assert.notOk(component.detailLearnergroupsList.trees[0].subgroups[1].isRemovable);
    assert.notOk(component.detailLearnergroupsList.trees[0].subgroups[2].isRemovable);
    assert.notOk(component.detailLearnergroupsList.trees[1].isRemovable);
    assert.notOk(component.detailLearnergroupsList.trees[1].subgroups[0].isRemovable);
    assert.notOk(component.detailLearnergroupsList.trees[1].subgroups[1].isRemovable);
    await a11yAudit();
    assert.ok(true, 'no a11y errors found!');
  });

  test('remove', async function (assert) {
    assert.expect(1);
    this.set('learnerGroups', [this.tlg1, this.subGroup1, this.subSubGroup, this.subGroup2]);
    this.set('remove', (learnerGroup) => {
      assert.strictEqual(this.subGroup2, learnerGroup);
    });
    await render(hbs`<SelectedLearnerGroups
      @learnerGroups={{this.learnerGroups}}
      @remove={{this.remove}}
      @isManaging={{true}}
    />`);
    await component.detailLearnergroupsList.trees[1].subgroups[1].remove();
  });

  test('remove-all', async function (assert) {
    assert.expect(1);
    this.set('learnerGroups', [this.tlg1, this.subGroup1, this.subSubGroup, this.subGroup2]);
    this.set('remove', (learnerGroup) => {
      assert.strictEqual(this.tlg1, learnerGroup);
    });
    await render(hbs`<SelectedLearnerGroups
      @learnerGroups={{this.learnerGroups}}
      @remove={{this.remove}}
      @isManaging={{true}}
    />`);
    await component.detailLearnergroupsList.trees[0].removeAllSubgroups();
  });
});
