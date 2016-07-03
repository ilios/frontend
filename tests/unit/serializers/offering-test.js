import { moduleForModel, test } from 'ember-qunit';

moduleForModel('offering', 'Unit | Serializer | offering', {
  // Specify the other units that are required for this test.
  needs: [
    'serializer:offering',
    'model:session',
    'model:learner-group',
    'model:instructor-group',
    'model:user',
  ]
});

test('it removes all non postable fields', function(assert) {
  var record = this.subject();

  var serializedRecord = record.serialize();
  
  assert.ok(!("updatedAt" in serializedRecord));
});
