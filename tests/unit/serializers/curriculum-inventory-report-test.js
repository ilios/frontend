import { moduleForModel, test } from 'ember-qunit';
import Ember from 'ember';

moduleForModel('curriculum-inventory-report', 'Unit | Serializer | curriculum inventory report', {
  // Specify the other units that are required for this test.
  needs: [
    'model:curriculum-inventory-academic-level',
    'model:curriculum-inventory-report',
    'model:curriculum-inventory-export',
    'model:curriculum-inventory-sequence',
    'model:curriculum-inventory-sequence-block',
    'model:program',
    'serializer:curriculum-inventory-report',
  ]
});

test('it serializes records', function(assert) {
  let record = this.subject();
  let serializedRecord = record.serialize();
  assert.ok(serializedRecord);
});

test('it removes all non postable fields', function(assert) {
  let record = this.subject();
  Ember.run(()=> {
    var uri = "/abandon/all/hope/ye/who/enter/here";
    record.set('absoluteFileUri', uri);
    assert.equal(record.get('absoluteFileUri'), uri);
    var serializedRecord = record.serialize();
    assert.ok(!('absoluteFileUri' in serializedRecord));
  });
});
