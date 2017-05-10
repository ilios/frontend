import { moduleForModel, test } from 'ember-qunit';
import modelList from '../../helpers/model-list';

moduleForModel('mesh-semantic-type', 'Unit | Model | mesh semantic type', {
  // Specify the other units that are required for this test.
  needs: modelList
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});
