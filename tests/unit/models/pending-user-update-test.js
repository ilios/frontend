import { moduleForModel, test } from 'ember-qunit';
import modelList from '../../helpers/model-list';

moduleForModel('pending-user-update', 'Unit | Model | pending user update', {
  needs: modelList
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});
