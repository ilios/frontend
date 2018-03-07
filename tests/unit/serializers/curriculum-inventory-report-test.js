import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | curriculum inventory report', function(hooks) {
  setupTest(hooks);

  test('it serializes records', function(assert) {
    let record = run(() => this.owner.lookup('service:store').createRecord('curriculum-inventory-report'));
    let serializedRecord = record.serialize();
    assert.ok(serializedRecord);
  });

  test('it removes all non postable fields', function(assert) {
    let record = run(() => this.owner.lookup('service:store').createRecord('curriculum-inventory-report'));
    run(()=> {
      let uri = "/abandon/all/hope/ye/who/enter/here";
      record.set('absoluteFileUri', uri);
      assert.equal(record.get('absoluteFileUri'), uri);
      let serializedRecord = record.serialize();
      assert.ok(!('absoluteFileUri' in serializedRecord));
    });
  });

  test('start and end date are formatted during serialization', function(assert) {
    let record = run(() => this.owner.lookup('service:store').createRecord('curriculum-inventory-report'));
    run(()=> {
      record.set('startDate', new Date());
      record.set('endDate', new Date());
      let serializedRecord = record.serialize();
      const pattern = /\d{4}-\d{2}-\d{2}/;
      assert.ok(serializedRecord.startDate.match(pattern));
      assert.ok(serializedRecord.endDate.match(pattern));
    });
  });
});
