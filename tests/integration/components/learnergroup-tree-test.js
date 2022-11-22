import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/learnergroup-tree';

module('Integration | Component | learnergroup-tree', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const thirdLevelLearnerGroup1 = this.server.create('learner-group', {
      title: 'Third 1',
    });
    const thirdLevelLearnerGroup2 = this.server.create('learner-group', {
      title: 'Third 2',
    });
    const thirdLevelLearnerGroup3 = this.server.create('learner-group', {
      title: 'Third 10',
      needsAccommodation: true,
    });

    const secondLevelLearnerGroup1 = this.server.create('learner-group', {
      title: 'Second 1',
      children: [thirdLevelLearnerGroup1, thirdLevelLearnerGroup2],
    });
    const secondLevelLearnerGroup2 = this.server.create('learner-group', {
      title: 'Second 2',
      children: [thirdLevelLearnerGroup3],
    });
    const secondLevelLearnerGroup3 = this.server.create('learner-group', {
      title: 'Second 10',
    });
    const topLevelLearnerGroup = this.server.create('learner-group', {
      title: 'Top Group',
      children: [secondLevelLearnerGroup1, secondLevelLearnerGroup2, secondLevelLearnerGroup3],
      needsAccommodation: true,
    });

    this.topLevelLearnerGroup = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', topLevelLearnerGroup.id);
    this.secondLevelLearnerGroup1 = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', secondLevelLearnerGroup1.id);
    this.secondLevelLearnerGroup2 = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', secondLevelLearnerGroup2.id);
    this.secondLevelLearnerGroup3 = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', secondLevelLearnerGroup3.id);
    this.thirdLevelLearnerGroup1 = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', thirdLevelLearnerGroup1.id);
    this.thirdLevelLearnerGroup2 = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', thirdLevelLearnerGroup2.id);
    this.thirdLevelLearnerGroup3 = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', thirdLevelLearnerGroup3.id);
  });

  test('the group tree renders', async function (assert) {
    this.set('learnerGroup', this.topLevelLearnerGroup);
    this.set('selectedGroups', [
      this.thirdLevelLearnerGroup2,
      this.thirdLevelLearnerGroup3,
      this.secondLevelLearnerGroup2,
    ]);
    await render(
      hbs`<LearnergroupTree @learnerGroup={{this.learnerGroup}} @selectedGroups={{this.selectedGroups}} @add={{(noop)}} />
`
    );
    assert.strictEqual(component.title, 'Top Group');
    assert.ok(component.needsAccommodation);
    assert.strictEqual(component.subgroups.length, 3);
    assert.strictEqual(component.subgroups[0].title, 'Second 1');
    assert.notOk(component.subgroups[0].isChecked);
    assert.notOk(component.subgroups[0].needsAccommodation);
    assert.strictEqual(component.subgroups[0].subgroups.length, 2);
    assert.strictEqual(component.subgroups[0].subgroups[0].title, 'Third 1');
    assert.notOk(component.subgroups[0].subgroups[0].isChecked);
    assert.notOk(component.subgroups[0].subgroups[0].needsAccommodation);
    assert.strictEqual(component.subgroups[0].subgroups[1].title, 'Third 2');
    assert.ok(component.subgroups[0].subgroups[1].isChecked);
    assert.notOk(component.subgroups[0].subgroups[1].needsAccommodation);
    assert.strictEqual(component.subgroups[0].subgroups.length, 2);
    assert.strictEqual(component.subgroups[1].subgroups[0].title, 'Third 10');
    assert.ok(component.subgroups[1].subgroups[0].isChecked);
    assert.ok(component.subgroups[1].subgroups[0].needsAccommodation);
    assert.strictEqual(component.subgroups[1].title, 'Second 2');
    assert.notOk(component.subgroups[0].isChecked);
    assert.notOk(component.subgroups[1].needsAccommodation);
    assert.strictEqual(component.subgroups[2].title, 'Second 10');
    assert.notOk(component.subgroups[2].isChecked);
    assert.notOk(component.subgroups[2].needsAccommodation);
  });

  test('branches and leaves are styled accordingly', async function (assert) {
    this.set('learnerGroup', this.topLevelLearnerGroup);
    this.set('selectedGroups', []);
    await render(
      hbs`<LearnergroupTree @learnerGroup={{this.learnerGroup}} @selectedGroups={{this.selectedGroups}} @add={{(noop)}} />
`
    );
    assert.ok(component.isStyledAsBranch);
    assert.notOk(component.isStyledAsLeaf);
    assert.ok(component.subgroups[0].isStyledAsBranch);
    assert.notOk(component.subgroups[0].isStyledAsLeaf);
    assert.ok(component.subgroups[1].isStyledAsBranch);
    assert.notOk(component.subgroups[1].isStyledAsLeaf);
    assert.notOk(component.subgroups[2].isStyledAsBranch);
    assert.ok(component.subgroups[2].isStyledAsLeaf);
  });

  test('filter by learner group title', async function (assert) {
    this.set('learnerGroup', this.topLevelLearnerGroup);
    this.set('selectedGroups', []);
    this.set('filter', 'Second 2');
    await render(
      hbs`<LearnergroupTree @learnerGroup={{this.learnerGroup}} @selectedGroups={{this.selectedGroups}} @filter={{this.filter}} @add={{(noop)}} />
`
    );
    assert.notOk(component.isHidden);
    assert.ok(component.subgroups[0].isHidden);
    assert.ok(component.subgroups[0].subgroups[0].isHidden);
    assert.ok(component.subgroups[0].subgroups[1].isHidden);
    assert.notOk(component.subgroups[1].isHidden);
    assert.notOk(component.subgroups[1].subgroups[0].isHidden);
    assert.ok(component.subgroups[2].isHidden);
  });

  test('add group by clicking on checkbox', async function (assert) {
    assert.expect(2);
    this.set('learnerGroup', this.topLevelLearnerGroup);
    this.set('selectedGroups', []);
    this.set('add', (learnerGroup, cascade) => {
      assert.ok(cascade);
      assert.strictEqual(learnerGroup, this.thirdLevelLearnerGroup2);
    });
    await render(
      hbs`<LearnergroupTree @learnerGroup={{this.learnerGroup}} @selectedGroups={{this.selectedGroups}} @add={{this.add}} />
`
    );
    await component.subgroups[0].subgroups[1].toggle();
  });

  test('add group by clicking on checkbox label', async function (assert) {
    assert.expect(2);
    this.set('learnerGroup', this.topLevelLearnerGroup);
    this.set('selectedGroups', []);
    this.set('add', (learnerGroup, cascade) => {
      assert.ok(cascade);
      assert.strictEqual(learnerGroup, this.thirdLevelLearnerGroup2);
    });
    await render(
      hbs`<LearnergroupTree @learnerGroup={{this.learnerGroup}} @selectedGroups={{this.selectedGroups}} @add={{this.add}} />
`
    );
    await component.subgroups[0].subgroups[1].toggleTitle();
  });

  test('shift-click on checkbox to add group without cascading selection', async function (assert) {
    assert.expect(2);
    this.set('learnerGroup', this.topLevelLearnerGroup);
    this.set('selectedGroups', []);
    this.set('add', (learnerGroup, cascade) => {
      assert.notOk(cascade);
      assert.strictEqual(learnerGroup, this.topLevelLearnerGroup);
    });
    await render(
      hbs`<LearnergroupTree @learnerGroup={{this.learnerGroup}} @selectedGroups={{this.selectedGroups}} @add={{this.add}} />
`
    );
    await click('[data-test-learnergroup-tree-root=true] > [data-test-checkbox]', {
      shiftKey: true,
    });
  });

  test('ctrl-click on checkbox to add group without cascading selection', async function (assert) {
    assert.expect(2);
    this.set('learnerGroup', this.topLevelLearnerGroup);
    this.set('selectedGroups', []);
    this.set('add', (learnerGroup, cascade) => {
      assert.notOk(cascade);
      assert.strictEqual(learnerGroup, this.topLevelLearnerGroup);
    });
    await render(
      hbs`<LearnergroupTree @learnerGroup={{this.learnerGroup}} @selectedGroups={{this.selectedGroups}} @add={{this.add}} />
`
    );
    await click('[data-test-learnergroup-tree-root=true] > [data-test-checkbox]', {
      ctrlKey: true,
    });
  });

  test('shift-click on label to add group without cascading selection', async function (assert) {
    assert.expect(2);
    this.set('learnerGroup', this.topLevelLearnerGroup);
    this.set('selectedGroups', []);
    this.set('add', (learnerGroup, cascade) => {
      assert.notOk(cascade);
      assert.strictEqual(learnerGroup, this.topLevelLearnerGroup);
    });
    await render(
      hbs`<LearnergroupTree @learnerGroup={{this.learnerGroup}} @selectedGroups={{this.selectedGroups}} @add={{this.add}} />
`
    );
    await click('[data-test-learnergroup-tree-root=true] > [data-test-checkbox-title]', {
      shiftKey: true,
    });
  });

  test('ctrl-click on label to add group without cascading selection', async function (assert) {
    assert.expect(2);
    this.set('learnerGroup', this.topLevelLearnerGroup);
    this.set('selectedGroups', []);
    this.set('add', (learnerGroup, cascade) => {
      assert.notOk(cascade);
      assert.strictEqual(learnerGroup, this.topLevelLearnerGroup);
    });
    await render(
      hbs`<LearnergroupTree @learnerGroup={{this.learnerGroup}} @selectedGroups={{this.selectedGroups}} @add={{this.add}} />
`
    );
    await click('[data-test-learnergroup-tree-root=true] > [data-test-checkbox-title]', {
      ctrlKey: true,
    });
  });

  test('remove group by clicking on checkbox', async function (assert) {
    assert.expect(2);
    this.set('learnerGroup', this.topLevelLearnerGroup);
    this.set('selectedGroups', [this.thirdLevelLearnerGroup2]);
    this.set('remove', (learnerGroup, cascade) => {
      assert.ok(cascade);
      assert.strictEqual(learnerGroup, this.thirdLevelLearnerGroup2);
    });
    await render(
      hbs`<LearnergroupTree @learnerGroup={{this.learnerGroup}} @selectedGroups={{this.selectedGroups}} @remove={{this.remove}} />
`
    );
    await component.subgroups[0].subgroups[1].toggle();
  });

  test('remove group by clicking on checkbox label', async function (assert) {
    assert.expect(2);
    this.set('learnerGroup', this.topLevelLearnerGroup);
    this.set('selectedGroups', [this.thirdLevelLearnerGroup2]);
    this.set('remove', (learnerGroup, cascade) => {
      assert.ok(cascade);
      assert.strictEqual(learnerGroup, this.thirdLevelLearnerGroup2);
    });
    await render(
      hbs`<LearnergroupTree @learnerGroup={{this.learnerGroup}} @selectedGroups={{this.selectedGroups}} @remove={{this.remove}} />
`
    );
    await component.subgroups[0].subgroups[1].toggleTitle();
  });

  test('shift-click on checkbox to remove group without cascading selection', async function (assert) {
    assert.expect(2);
    this.set('learnerGroup', this.topLevelLearnerGroup);
    this.set('selectedGroups', [this.topLevelLearnerGroup]);
    this.set('remove', (learnerGroup, cascade) => {
      assert.notOk(cascade);
      assert.strictEqual(learnerGroup, this.topLevelLearnerGroup);
    });
    await render(
      hbs`<LearnergroupTree @learnerGroup={{this.learnerGroup}} @selectedGroups={{this.selectedGroups}} @remove={{this.remove}} />
`
    );
    await click('[data-test-learnergroup-tree-root=true] > [data-test-checkbox]', {
      shiftKey: true,
    });
  });

  test('ctrl-click on checkbox to remove group without cascading selection', async function (assert) {
    assert.expect(2);
    this.set('learnerGroup', this.topLevelLearnerGroup);
    this.set('selectedGroups', [this.topLevelLearnerGroup]);
    this.set('remove', (learnerGroup, cascade) => {
      assert.notOk(cascade);
      assert.strictEqual(learnerGroup, this.topLevelLearnerGroup);
    });
    await render(
      hbs`<LearnergroupTree @learnerGroup={{this.learnerGroup}} @selectedGroups={{this.selectedGroups}} @remove={{this.remove}} />
`
    );
    await click('[data-test-learnergroup-tree-root=true] > [data-test-checkbox]', {
      ctrlKey: true,
    });
  });

  test('shift-click on label to remove group without cascading selection', async function (assert) {
    assert.expect(2);
    this.set('learnerGroup', this.topLevelLearnerGroup);
    this.set('selectedGroups', [this.topLevelLearnerGroup]);
    this.set('remove', (learnerGroup, cascade) => {
      assert.notOk(cascade);
      assert.strictEqual(learnerGroup, this.topLevelLearnerGroup);
    });
    await render(
      hbs`<LearnergroupTree @learnerGroup={{this.learnerGroup}} @selectedGroups={{this.selectedGroups}} @remove={{this.remove}} />
`
    );
    await click('[data-test-learnergroup-tree-root=true] > [data-test-checkbox-title]', {
      shiftKey: true,
    });
  });

  test('ctrl-click on label to remove group without cascading selection', async function (assert) {
    assert.expect(2);
    this.set('learnerGroup', this.topLevelLearnerGroup);
    this.set('selectedGroups', [this.topLevelLearnerGroup]);
    this.set('remove', (learnerGroup, cascade) => {
      assert.notOk(cascade);
      assert.strictEqual(learnerGroup, this.topLevelLearnerGroup);
    });
    await render(
      hbs`<LearnergroupTree @learnerGroup={{this.learnerGroup}} @selectedGroups={{this.selectedGroups}} @remove={{this.remove}} />
`
    );
    await click('[data-test-learnergroup-tree-root=true] > [data-test-checkbox-title]', {
      ctrlKey: true,
    });
  });
});
