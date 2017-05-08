import { moduleForModel, test } from 'ember-qunit';

moduleForModel('curriculum-inventory-academic-level', 'Unit | Model | curriculum inventory academic level', {
  // Specify the other units that are required for this test.
  needs: []
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});
