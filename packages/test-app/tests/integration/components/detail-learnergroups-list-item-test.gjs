import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { click, render } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { component } from 'ilios-common/page-objects/components/detail-learnergroups-list-item';
import DetailLearnergroupsListItem from 'ilios-common/components/detail-learnergroups-list-item';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | detail-learnergroups-list-item', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const root = this.server.create('learner-group', {
      title: 'bar',
    });
    const parent = this.server.create('learner-group', {
      title: 'baz',
      parent: root,
    });
    const group = this.server.create('learner-group', {
      title: 'foo',
      parent,
      users: this.server.createList('user', 3),
    });
    this.group = await this.owner.lookup('service:store').findRecord('learner-group', group.id);
  });

  test('it renders', async function (assert) {
    this.set('group', this.group);
    await render(
      <template><DetailLearnergroupsListItem @group={{this.group}} @remove={{(noop)}} /></template>,
    );
    assert.strictEqual(component.text, 'bar » baz » foo (3)');
    assert.notOk(component.isRemovable);
    assert.notOk(component.needsAccommodation);
  });

  test('it renders in edit mode', async function (assert) {
    this.set('group', this.group);
    await render(
      <template>
        <DetailLearnergroupsListItem
          @group={{this.group}}
          @isManaging={{true}}
          @remove={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.text, 'bar » baz » foo (3)');
    assert.ok(component.isRemovable);
  });

  test('needs special accommodation', async function (assert) {
    this.group.set('needsAccommodation', true);
    this.set('group', this.group);
    await render(
      <template><DetailLearnergroupsListItem @group={{this.group}} @remove={{(noop)}} /></template>,
    );
    assert.ok(component.needsAccommodation);
    assert.strictEqual(
      component.text,
      'bar » baz » foo (3) Accommodation is required for learners in this group',
    );
  });

  test('click to remove', async function (assert) {
    assert.expect(2);
    this.set('group', this.group);
    this.set('remove', (group, cascade) => {
      assert.strictEqual(group.id, this.group.id);
      assert.ok(cascade);
    });
    await render(
      <template>
        <DetailLearnergroupsListItem
          @group={{this.group}}
          @isManaging={{true}}
          @remove={{this.remove}}
        />
      </template>,
    );
    await component.remove();
  });

  test('shift-click to remove', async function (assert) {
    assert.expect(2);
    this.set('group', this.group);
    this.set('remove', (group, cascade) => {
      assert.strictEqual(group.id, this.group.id);
      assert.notOk(cascade);
    });
    await render(
      <template>
        <DetailLearnergroupsListItem
          @group={{this.group}}
          @isManaging={{true}}
          @remove={{this.remove}}
        />
      </template>,
    );
    // key modifiers are not supported by ember-cli-page-objects clickable() [ST 2022/09/08]
    await click('[data-test-remove-learnergroup]', { shiftKey: true });
  });

  test('control-click to remove', async function (assert) {
    assert.expect(2);
    this.set('group', this.group);
    this.set('remove', (group, cascade) => {
      assert.strictEqual(group.id, this.group.id);
      assert.notOk(cascade);
    });

    await render(
      <template>
        <DetailLearnergroupsListItem
          @group={{this.group}}
          @isManaging={{true}}
          @remove={{this.remove}}
        />
      </template>,
    );
    // key modifiers are not supported by ember-cli-page-objects clickable() [ST 2022/09/08]
    await click('[data-test-remove-learnergroup]', { ctrlKey: true });
  });
});
