import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | curriculum inventory report', function (hooks) {
  setupTest(hooks);

  test('it serializes records', function (assert) {
    const record = this.owner.lookup('service:store').createRecord('curriculum-inventory-report');
    const serializedRecord = record.serialize();
    assert.ok(serializedRecord);
  });

  test('it removes all non postable fields', function (assert) {
    const record = this.owner.lookup('service:store').createRecord('curriculum-inventory-report');
    const uri = '/abandon/all/hope/ye/who/enter/here';
    record.set('absoluteFileUri', uri);
    assert.strictEqual(record.get('absoluteFileUri'), uri);
    const serializedRecord = record.serialize();
    assert.notOk('absoluteFileUri' in serializedRecord.data.attributes);
  });

  test('start and end date are formatted during serialization', function (assert) {
    const record = this.owner.lookup('service:store').createRecord('curriculum-inventory-report');
    record.set('startDate', new Date());
    record.set('endDate', new Date());
    const serializedRecord = record.serialize();
    const pattern = /\d{4}-\d{2}-\d{2}/;
    assert.ok(serializedRecord.data.attributes.startDate.match(pattern));
    assert.ok(serializedRecord.data.attributes.endDate.match(pattern));
  });
});
