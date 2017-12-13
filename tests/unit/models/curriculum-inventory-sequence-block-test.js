import { run } from '@ember/runloop';
import { moduleForModel, test } from 'ember-qunit';
import modelList from '../../helpers/model-list';
import { initialize } from '../../../initializers/replace-promise';

initialize();
moduleForModel('curriculum-inventory-sequence-block', 'Unit | Model | CurriculumInventorySequenceBlock ', {
  needs: modelList
});

test('get all ancestors of nested sequence block', async function(assert) {
  assert.expect(3);
  const model = this.subject();
  const store = this.store();
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
  const model = this.subject();
  await run( async () => {
    const ancestors = await model.get('allParents');
    assert.equal(ancestors.length, 0);
  });
});
