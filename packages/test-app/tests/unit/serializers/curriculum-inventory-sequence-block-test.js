import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | curriculum inventory sequence block', function (hooks) {
  setupTest(hooks);

  test('start and end date are formatted during serialization', function (assert) {
    const record = this.owner
      .lookup('service:store')
      .createRecord('curriculum-inventory-sequence-block');
    record.set('startDate', new Date());
    record.set('endDate', new Date());
    const serializedRecord = record.serialize();
    const pattern = /\d{4}-\d{2}-\d{2}/;
    assert.ok(serializedRecord.data.attributes.startDate.match(pattern));
    assert.ok(serializedRecord.data.attributes.endDate.match(pattern));
  });

  test('empty start and end date are not formatted during serialization', function (assert) {
    const record = this.owner
      .lookup('service:store')
      .createRecord('curriculum-inventory-sequence-block');
    record.set('startDate', null);
    record.set('endDate', null);
    const serializedRecord = record.serialize();
    assert.strictEqual(serializedRecord.data.attributes.startDate, null);
    assert.strictEqual(serializedRecord.data.attributes.endDate, null);
  });
});
