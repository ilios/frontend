import { run } from '@ember/runloop';
import { moduleForModel, test } from 'ember-qunit';

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
  run(()=> {
    let uri = "/abandon/all/hope/ye/who/enter/here";
    record.set('absoluteFileUri', uri);
    assert.equal(record.get('absoluteFileUri'), uri);
    let serializedRecord = record.serialize();
    assert.ok(!('absoluteFileUri' in serializedRecord));
  });
});

test('start and end date are formatted during serialization', function(assert) {
  let record = this.subject();
  run(()=> {
    record.set('startDate', new Date());
    record.set('endDate', new Date());
    let serializedRecord = record.serialize();
    const pattern = /\d{4}-\d{2}-\d{2}/;
    assert.ok(serializedRecord.startDate.match(pattern));
    assert.ok(serializedRecord.endDate.match(pattern));
  });
});
