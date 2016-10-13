import { moduleForModel, test } from 'ember-qunit';

moduleForModel('curriculum-inventory-sequence-block', 'Unit | Serializer | curriculum inventory sequence block', {
  // Specify the other units that are required for this test.
  needs: [
    'serializer:curriculum-inventory-sequence-block',
    'model:curriculum-inventory-report',
    'model:curriculum-inventory-academic-level',
    'model:course',
    'model:session',
    'model:user',
  ],
});

// Replace this with your real tests.
test('it serializes records', function(assert) {
  let record = this.subject();

  let serializedRecord = record.serialize();

  assert.ok(serializedRecord);
});
