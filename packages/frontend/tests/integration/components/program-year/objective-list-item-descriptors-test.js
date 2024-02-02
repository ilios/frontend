import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'frontend/tests/pages/components/program-year/objective-list-item-descriptors';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | program-year/objective-list-item-descriptors', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders and is accessible when managing', async function (assert) {
    await render(hbs`<ProgramYear::ObjectiveListItemDescriptors
      @meshDescriptors={{(array)}}
      @editable={{false}}
      @manage={{(noop)}}
      @isManaging={{true}}
      @save={{(noop)}}
      @isSaving={{false}}
      @cancel={{(noop)}}
    />`);
    assert.ok(component.canSave);
    assert.ok(component.canCancel);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders and is accessible empty and un-editable', async function (assert) {
    await render(hbs`<ProgramYear::ObjectiveListItemDescriptors
      @meshDescriptors={{(array)}}
      @editable={{false}}
      @manage={{(noop)}}
      @isManaging={{false}}
      @save={{(noop)}}
      @isSaving={{false}}
      @cancel={{(noop)}}
    />`);
    assert.strictEqual(component.text, 'None');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders and is accessible un-editable', async function (assert) {
    const meshDescriptors = this.server.createList('mesh-descriptor', 2);
    const meshDescriptorModel1 = await this.owner
      .lookup('service:store')
      .findRecord('mesh-descriptor', meshDescriptors[0].id);
    const meshDescriptorModel2 = await this.owner
      .lookup('service:store')
      .findRecord('mesh-descriptor', meshDescriptors[1].id);
    this.set('meshDescriptors', [meshDescriptorModel1, meshDescriptorModel2]);
    await render(hbs`<ProgramYear::ObjectiveListItemDescriptors
      @meshDescriptors={{this.meshDescriptors}}
      @editable={{false}}
      @manage={{(noop)}}
      @isManaging={{false}}
      @save={{(noop)}}
      @isSaving={{false}}
      @cancel={{(noop)}}
    />`);
    assert.strictEqual(component.list.length, 2);
    assert.strictEqual(component.list[0].title, 'descriptor 0');
    assert.strictEqual(component.list[1].title, 'descriptor 1');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders and is accessible editable', async function (assert) {
    const meshDescriptors = this.server.createList('mesh-descriptor', 2);
    const meshDescriptorModel1 = await this.owner
      .lookup('service:store')
      .findRecord('mesh-descriptor', meshDescriptors[0].id);
    const meshDescriptorModel2 = await this.owner
      .lookup('service:store')
      .findRecord('mesh-descriptor', meshDescriptors[1].id);
    this.set('meshDescriptors', [meshDescriptorModel1, meshDescriptorModel2]);
    await render(hbs`<ProgramYear::ObjectiveListItemDescriptors
      @meshDescriptors={{this.meshDescriptors}}
      @editable={{true}}
      @manage={{(noop)}}
      @isManaging={{false}}
      @save={{(noop)}}
      @isSaving={{false}}
      @cancel={{(noop)}}
    />`);
    assert.strictEqual(component.list.length, 2);
    assert.strictEqual(component.list[0].title, 'descriptor 0');
    assert.strictEqual(component.list[1].title, 'descriptor 1');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('clicking save fires save', async function (assert) {
    assert.expect(1);
    const meshDescriptors = this.server.createList('mesh-descriptor', 2);
    const meshDescriptorModel1 = await this.owner
      .lookup('service:store')
      .findRecord('mesh-descriptor', meshDescriptors[0].id);
    const meshDescriptorModel2 = await this.owner
      .lookup('service:store')
      .findRecord('mesh-descriptor', meshDescriptors[1].id);
    this.set('meshDescriptors', [meshDescriptorModel1, meshDescriptorModel2]);
    this.set('save', () => {
      assert.ok(true);
    });
    await render(hbs`<ProgramYear::ObjectiveListItemDescriptors
      @meshDescriptors={{this.meshDescriptors}}
      @editable={{true}}
      @manage={{(noop)}}
      @isManaging={{true}}
      @save={{this.save}}
      @isSaving={{false}}
      @cancel={{(noop)}}
    />`);
    await component.save();
  });

  test('clicking cancel fires cancel', async function (assert) {
    assert.expect(1);
    const meshDescriptors = this.server.createList('mesh-descriptor', 2);
    const meshDescriptorModel1 = await this.owner
      .lookup('service:store')
      .findRecord('mesh-descriptor', meshDescriptors[0].id);
    const meshDescriptorModel2 = await this.owner
      .lookup('service:store')
      .findRecord('mesh-descriptor', meshDescriptors[1].id);
    this.set('meshDescriptors', [meshDescriptorModel1, meshDescriptorModel2]);
    this.set('cancel', () => {
      assert.ok(true);
    });
    await render(hbs`<ProgramYear::ObjectiveListItemDescriptors
      @meshDescriptors={{this.meshDescriptors}}
      @editable={{true}}
      @manage={{(noop)}}
      @isManaging={{true}}
      @save={{(noop)}}
      @isSaving={{false}}
      @cancel={{this.cancel}}
    />`);
    await component.cancel();
  });

  test('clicking descriptor fires manage', async function (assert) {
    assert.expect(1);
    const meshDescriptors = this.server.createList('mesh-descriptor', 2);
    const meshDescriptorModel1 = await this.owner
      .lookup('service:store')
      .findRecord('mesh-descriptor', meshDescriptors[0].id);
    const meshDescriptorModel2 = await this.owner
      .lookup('service:store')
      .findRecord('mesh-descriptor', meshDescriptors[1].id);
    this.set('meshDescriptors', [meshDescriptorModel1, meshDescriptorModel2]);
    this.set('manage', () => {
      assert.ok(true);
    });
    await render(hbs`<ProgramYear::ObjectiveListItemDescriptors
      @meshDescriptors={{this.meshDescriptors}}
      @editable={{true}}
      @manage={{this.manage}}
      @isManaging={{false}}
      @save={{(noop)}}
      @isSaving={{false}}
      @cancel={{(noop)}}
    />`);
    await component.list[0].manage();
  });
});
