import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/detail-learnergroups-list-item';

module('Integration | Component | detail-learnergroups-list-item', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
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
    await render(hbs`<DetailLearnergroupsListItem @group={{this.group}} @remove={{(noop)}} />
`);
    assert.strictEqual(component.text, 'bar » baz » foo (3)');
    assert.notOk(component.isRemovable);
    assert.notOk(component.needsAccommodation);
  });

  test('it renders in edit mode', async function (assert) {
    this.set('group', this.group);
    await render(
      hbs`<DetailLearnergroupsListItem @group={{this.group}} @isManaging={{true}} @remove={{(noop)}} />
`
    );
    assert.strictEqual(component.text, 'bar » baz » foo (3)');
    assert.ok(component.isRemovable);
  });

  test('needs special accommodation', async function (assert) {
    this.group.set('needsAccommodation', true);
    this.set('group', this.group);
    await render(hbs`<DetailLearnergroupsListItem @group={{this.group}} @remove={{(noop)}} />
`);
    assert.ok(component.needsAccommodation);
    assert.strictEqual(
      component.text,
      'bar » baz » foo (3) members of this group require accommodation'
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
      hbs`<DetailLearnergroupsListItem @group={{this.group}} @isManaging={{true}} @remove={{this.remove}} />
`
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
      hbs`<DetailLearnergroupsListItem @group={{this.group}} @isManaging={{true}} @remove={{this.remove}} />
`
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
      hbs`<DetailLearnergroupsListItem @group={{this.group}} @isManaging={{true}} @remove={{this.remove}} />
`
    );
    // key modifiers are not supported by ember-cli-page-objects clickable() [ST 2022/09/08]
    await click('[data-test-remove-learnergroup]', { ctrlKey: true });
  });
});
