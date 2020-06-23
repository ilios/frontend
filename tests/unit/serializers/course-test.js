import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | Course ', function(hooks) {
  setupTest(hooks);

  test('it serializes records', function(assert) {
    var record = this.owner.lookup('service:store').createRecord('course');

    var serializedRecord = record.serialize();

    assert.ok(serializedRecord);
  });

  test('start and end date are formatted during serialization', function(assert) {
    const record = this.owner.lookup('service:store').createRecord('course');
    record.set('startDate', new Date());
    record.set('endDate', new Date());
    const serializedRecord = record.serialize();
    const pattern = /\d{4}-\d{2}-\d{2}/;
    assert.ok(serializedRecord.data.attributes.startDate.match(pattern));
    assert.ok(serializedRecord.data.attributes.endDate.match(pattern));
  });
});
