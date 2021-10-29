import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | CurriculumInventorySequenceBlock ', function (hooks) {
  setupTest(hooks);

  test('get all ancestors of nested sequence block', async function (assert) {
    assert.expect(3);
    const model = this.owner
      .lookup('service:store')
      .createRecord('curriculum-inventory-sequence-block');
    const store = this.owner.lookup('service:store');
    const parentBlock = store.createRecord('curriculumInventorySequenceBlock', {
      children: [model],
    });
    const grandParent = store.createRecord('curriculumInventorySequenceBlock', {
      children: [parentBlock],
    });
    parentBlock.set('parent', grandParent);
    model.set('parent', parentBlock);
    const ancestors = await model.get('allParents');
    assert.strictEqual(ancestors.length, 2);
    assert.strictEqual(ancestors[0], parentBlock);
    assert.strictEqual(ancestors[1], grandParent);
  });

  test('list of ancestors is empty for top-level sequence block', async function (assert) {
    assert.expect(1);
    const model = this.owner
      .lookup('service:store')
      .createRecord('curriculum-inventory-sequence-block');
    const ancestors = await model.get('allParents');
    assert.strictEqual(ancestors.length, 0);
  });
});
