import { moduleForModel, test } from 'ember-qunit';
import Ember from 'ember';
import modelList from '../../helpers/model-list';
import { initialize } from '../../../initializers/replace-promise';

initialize();
moduleForModel('curriculum-inventory-sequence-block', 'Unit | Model | CurriculumInventorySequenceBlock ', {
  needs: modelList
});

test('it exists', function(assert) {
  let model = this.subject();
  assert.ok(!!model);
});

test('get all ancestors of nested sequence block', function(assert) {
  assert.expect(3);
  let model = this.subject();
  let store = this.store();
  Ember.run(() => {
    let parentBlock = store.createRecord('curriculumInventorySequenceBlock', { 'children': [ model ] });
    let grandParent = store.createRecord('curriculumInventorySequenceBlock', { 'children': [ parentBlock ] });
    parentBlock.set('parent', grandParent);
    model.set('parent', parentBlock);
    model.get('allParents').then(ancestors => {
      assert.equal(ancestors.length, 2);
      assert.equal(ancestors[0], parentBlock);
      assert.equal(ancestors[1], grandParent);
    });
  });
});

test('list of ancestors is empty for top-level sequence block', function(assert) {
  assert.expect(1);
  let model = this.subject();
  Ember.run(() => {
    model.get('allParents').then(ancestors => {
      assert.equal(ancestors.length, 0);
    });
  });
});
