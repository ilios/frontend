import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { component } from 'ilios-common/page-objects/components/session/objective-list-item-descriptors';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import ObjectiveListItemDescriptors from 'ilios-common/components/session/objective-list-item-descriptors';
import { array } from '@ember/helper';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | session/objective-list-item-descriptors', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const meshDescriptors = this.server.createList('mesh-descriptor', 2);
    this.meshDescriptor1 = await this.owner
      .lookup('service:store')
      .findRecord('mesh-descriptor', meshDescriptors[0].id);
    this.meshDescriptor2 = await this.owner
      .lookup('service:store')
      .findRecord('mesh-descriptor', meshDescriptors[1].id);
  });

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
          @sessionObjective={{(array)}}
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
    this.set('meshDescriptors', [this.meshDescriptor1, this.meshDescriptor2]);
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
    this.set('meshDescriptors', [this.meshDescriptor1, this.meshDescriptor2]);
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
    this.set('save', () => {
      assert.step('save called');
    });
    this.set('meshDescriptors', [this.meshDescriptor1, this.meshDescriptor2]);
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
    assert.verifySteps(['save called']);
  });

  test('clicking cancel fires cancel', async function (assert) {
    this.set('cancel', () => {
      assert.step('cancel called');
    });
    this.set('meshDescriptors', [this.meshDescriptor1, this.meshDescriptor2]);
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
    assert.verifySteps(['cancel called']);
  });

  test('clicking descriptor fires manage', async function (assert) {
    this.set('manage', () => {
      assert.step('manage called');
    });
    this.set('meshDescriptors', [this.meshDescriptor1, this.meshDescriptor2]);
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
    assert.verifySteps(['manage called']);
  });
});
