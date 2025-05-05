import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'frontend/tests/pages/components/program-year/objective-list-item-descriptors';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import ObjectiveListItemDescriptors from 'frontend/components/program-year/objective-list-item-descriptors';
import { array } from '@ember/helper';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | program-year/objective-list-item-descriptors', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders and is accessible when managing', async function (assert) {
    await render(
      <template>
        <ObjectiveListItemDescriptors
          @meshDescriptors={{(array)}}
          @editable={{false}}
          @manage={{(noop)}}
          @isManaging={{true}}
          @save={{(noop)}}
          @isSaving={{false}}
          @cancel={{(noop)}}
        />
      </template>,
    );
    assert.ok(component.canSave);
    assert.ok(component.canCancel);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders and is accessible empty and un-editable', async function (assert) {
    await render(
      <template>
        <ObjectiveListItemDescriptors
          @meshDescriptors={{(array)}}
          @editable={{false}}
          @manage={{(noop)}}
          @isManaging={{false}}
          @save={{(noop)}}
          @isSaving={{false}}
          @cancel={{(noop)}}
        />
      </template>,
    );
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
    await render(
      <template>
        <ObjectiveListItemDescriptors
          @meshDescriptors={{this.meshDescriptors}}
          @editable={{false}}
          @manage={{(noop)}}
          @isManaging={{false}}
          @save={{(noop)}}
          @isSaving={{false}}
          @cancel={{(noop)}}
        />
      </template>,
    );
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
    await render(
      <template>
        <ObjectiveListItemDescriptors
          @meshDescriptors={{this.meshDescriptors}}
          @editable={{true}}
          @manage={{(noop)}}
          @isManaging={{false}}
          @save={{(noop)}}
          @isSaving={{false}}
          @cancel={{(noop)}}
        />
      </template>,
    );
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
    await render(
      <template>
        <ObjectiveListItemDescriptors
          @meshDescriptors={{this.meshDescriptors}}
          @editable={{true}}
          @manage={{(noop)}}
          @isManaging={{true}}
          @save={{this.save}}
          @isSaving={{false}}
          @cancel={{(noop)}}
        />
      </template>,
    );
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
    await render(
      <template>
        <ObjectiveListItemDescriptors
          @meshDescriptors={{this.meshDescriptors}}
          @editable={{true}}
          @manage={{(noop)}}
          @isManaging={{true}}
          @save={{(noop)}}
          @isSaving={{false}}
          @cancel={{this.cancel}}
        />
      </template>,
    );
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
    await render(
      <template>
        <ObjectiveListItemDescriptors
          @meshDescriptors={{this.meshDescriptors}}
          @editable={{true}}
          @manage={{this.manage}}
          @isManaging={{false}}
          @save={{(noop)}}
          @isSaving={{false}}
          @cancel={{(noop)}}
        />
      </template>,
    );
    await component.list[0].manage();
  });
});
