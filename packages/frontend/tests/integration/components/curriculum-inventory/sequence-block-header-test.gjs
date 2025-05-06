import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { component } from 'frontend/tests/pages/components/curriculum-inventory/sequence-block-header';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import SequenceBlockHeader from 'frontend/components/curriculum-inventory/sequence-block-header';

module('Integration | Component | curriculum-inventory/sequence-block-header', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const block = this.server.create('curriculum-inventory-sequence-block', {
      title: 'Block title',
    });
    this.blockModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-sequence-block', block.id);
  });

  test('it renders', async function (assert) {
    this.set('sequenceBlock', this.blockModel);
    await render(
      <template>
        <SequenceBlockHeader @sequenceBlock={{this.sequenceBlock}} @canUpdate={{true}} />
      </template>,
    );
    assert.ok(component.title.isVisible);
    assert.strictEqual(component.title.value, this.blockModel.title);
    assert.ok(component.title.isEditable);
  });

  test('read-only mode for block in when it can not be updated', async function (assert) {
    this.set('sequenceBlock', this.blockModel);
    await render(
      <template>
        <SequenceBlockHeader @sequenceBlock={{this.sequenceBlock}} @canUpdate={{false}} />
      </template>,
    );
    assert.notOk(component.title.isEditable, 'Block title is not editable.');
  });

  test('change title', async function (assert) {
    const newTitle = 'new title';
    this.set('sequenceBlock', this.blockModel);
    await render(
      <template>
        <SequenceBlockHeader @sequenceBlock={{this.sequenceBlock}} @canUpdate={{true}} />
      </template>,
    );
    await component.title.edit();
    assert.notOk(component.title.hasError);
    await component.title.set(newTitle);
    await component.title.save();
    assert.notOk(component.title.hasError);
    assert.strictEqual(component.title.value, newTitle);
  });

  test('change title fails on empty value', async function (assert) {
    this.set('sequenceBlock', this.blockModel);
    await render(
      <template>
        <SequenceBlockHeader @sequenceBlock={{this.sequenceBlock}} @canUpdate={{true}} />
      </template>,
    );
    await component.title.edit();
    assert.notOk(component.title.hasError);
    await component.title.set('');
    await component.title.save();
    assert.ok(component.title.hasError);
  });

  test('change title fails on too-short value', async function (assert) {
    this.set('sequenceBlock', this.blockModel);
    await render(
      <template>
        <SequenceBlockHeader @sequenceBlock={{this.sequenceBlock}} @canUpdate={{true}} />
      </template>,
    );
    await component.title.edit();
    assert.notOk(component.title.hasError);
    await component.title.set('ab');
    await component.title.save();
    assert.ok(component.title.hasError);
  });

  test('change title fails on overlong value', async function (assert) {
    this.set('sequenceBlock', this.blockModel);
    await render(
      <template>
        <SequenceBlockHeader @sequenceBlock={{this.sequenceBlock}} @canUpdate={{true}} />
      </template>,
    );
    await component.title.edit();
    assert.notOk(component.title.hasError);
    await component.title.set('0123456789'.repeat(21));
    await component.title.save();
    assert.ok(component.title.hasError);
  });

  test('cancel title changes', async function (assert) {
    this.set('sequenceBlock', this.blockModel);
    await render(
      <template>
        <SequenceBlockHeader @sequenceBlock={{this.sequenceBlock}} @canUpdate={{true}} />
      </template>,
    );
    await component.title.edit();
    await component.title.set('some other title');
    await component.title.cancel();
    assert.strictEqual(component.title.value, this.blockModel.title);
  });
});
