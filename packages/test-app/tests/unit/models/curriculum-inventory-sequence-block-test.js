import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | CurriculumInventorySequenceBlock ', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');
  });

  test('get all ancestors of nested sequence block', async function (assert) {
    const model = this.store.createRecord('curriculum-inventory-sequence-block');

    const parentBlock = this.store.createRecord('curriculum-inventory-sequence-block', {
      children: [model],
    });
    const grandParent = this.store.createRecord('curriculum-inventory-sequence-block', {
      children: [parentBlock],
    });
    parentBlock.set('parent', grandParent);
    model.set('parent', parentBlock);
    const ancestors = await model.getAllParents();
    assert.strictEqual(ancestors.length, 2);
    assert.strictEqual(ancestors[0], parentBlock);
    assert.strictEqual(ancestors[1], grandParent);
  });

  test('list of ancestors is empty for top-level sequence block', async function (assert) {
    const model = this.store.createRecord('curriculum-inventory-sequence-block');
    const ancestors = await model.getAllParents();
    assert.strictEqual(ancestors.length, 0);
  });
});
