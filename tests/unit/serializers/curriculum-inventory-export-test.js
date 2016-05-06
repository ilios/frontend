import { moduleForModel } from 'ember-qunit';
import { skip } from 'qunit';

moduleForModel('curriculum-inventory-export', 'Unit | Serializer | curriculum inventory export', {
  // Specify the other units that are required for this test.
  needs: [
    'model:curriculum-inventory-export',
    'serializer:curriculum-inventory-export'
  ]
});

// Replace this with your real tests.
skip('it serializes records', function(assert) {
  let record = this.subject();

  let serializedRecord = record.serialize();

  assert.ok(serializedRecord);
});
