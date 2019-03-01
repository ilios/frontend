import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | curriculum inventory sequence block', function(hooks) {
  setupTest(hooks);

  test('start and end date are formatted during serialization', function(assert) {
    let record = run(() => this.owner.lookup('service:store').createRecord('curriculum-inventory-sequence-block'));
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
    let record = run(() => this.owner.lookup('service:store').createRecord('curriculum-inventory-sequence-block'));
    run(()=> {
      record.set('startDate', null);
      record.set('endDate', null);
      let serializedRecord = record.serialize();
      assert.equal(serializedRecord.startDate, null);
      assert.equal(serializedRecord.endDate, null);
    });
  });
});
