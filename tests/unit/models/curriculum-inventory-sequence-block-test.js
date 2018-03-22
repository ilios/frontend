import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { initialize } from '../../../initializers/replace-promise';

initialize();

module('Unit | Model | CurriculumInventorySequenceBlock ', function(hooks) {
  setupTest(hooks);

  test('get all ancestors of nested sequence block', async function(assert) {
    assert.expect(3);
    const model = run(() => this.owner.lookup('service:store').createRecord('curriculum-inventory-sequence-block'));
    const store = this.owner.lookup('service:store');
    await run( async () => {
      const parentBlock = store.createRecord('curriculumInventorySequenceBlock', { 'children': [ model ] });
      let grandParent = store.createRecord('curriculumInventorySequenceBlock', { 'children': [ parentBlock ] });
      parentBlock.set('parent', grandParent);
      model.set('parent', parentBlock);
      const ancestors = await model.get('allParents');
      assert.equal(ancestors.length, 2);
      assert.equal(ancestors[0], parentBlock);
      assert.equal(ancestors[1], grandParent);
    });
  });

  test('list of ancestors is empty for top-level sequence block', async function(assert) {
    assert.expect(1);
    const model = run(() => this.owner.lookup('service:store').createRecord('curriculum-inventory-sequence-block'));
    await run( async () => {
      const ancestors = await model.get('allParents');
      assert.equal(ancestors.length, 0);
    });
  });
});
