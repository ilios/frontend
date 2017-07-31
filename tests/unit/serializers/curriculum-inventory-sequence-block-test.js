import { run } from '@ember/runloop';
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

test('empty start and end date are not formatted during serialization', function(assert) {
  let record = this.subject();
  run(()=> {
    record.set('startDate', null);
    record.set('endDate', null);
    let serializedRecord = record.serialize();
    assert.equal(serializedRecord.startDate, null);
    assert.equal(serializedRecord.endDate, null);
  });
});
