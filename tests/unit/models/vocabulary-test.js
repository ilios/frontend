import { moduleForModel, test } from 'ember-qunit';
import modelList from '../../helpers/model-list';
import { pluralize } from 'ember-inflector';

moduleForModel('vocabulary', 'Unit | Model | vocabulary', {
  // Specify the other units that are required for this test.
  needs: modelList
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});

test('pluralization', function(assert){
  assert.equal(pluralize('vocabulary'), 'vocabularies');
});
