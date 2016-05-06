import { moduleForModel } from 'ember-qunit';
import { skip } from 'qunit';

moduleForModel('curriculum-inventory-report', 'Unit | Serializer | curriculum inventory report', {
  // Specify the other units that are required for this test.
  needs: [
    'model:curriculum-inventory-report',
    'serializer:curriculum-inventory-report'
  ]
});

// Replace this with your real tests.
skip('it serializes records', function(assert) {
  let record = this.subject();

  let serializedRecord = record.serialize();

  assert.ok(serializedRecord);
});
