import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | curriculum inventory export', function (hooks) {
  setupTest(hooks);

  test('it serializes records', function (assert) {
    const record = this.owner.lookup('service:store').createRecord('curriculum-inventory-export');
    const serializedRecord = record.serialize();
    assert.ok(serializedRecord);
  });

  test('it removes all non postable fields', async function (assert) {
    var record = this.owner.lookup('service:store').createRecord('curriculum-inventory-export');
    var store = this.owner.lookup('service:store');
    var now = new Date();
    var doc = 'lorem ipsum';
    var user = store.createRecord('user', {});
    record.set('createdAt', now);
    record.set('document', doc);
    record.set('createdBy', user);
    assert.strictEqual(record.get('createdAt'), now);
    assert.strictEqual(record.get('document'), doc);
    const creator = await record.get('createdBy');
    assert.strictEqual(user, creator);
    var serializedRecord = record.serialize();
    assert.notOk('createdAt' in serializedRecord.data.attributes);
    assert.notOk('createdBy' in serializedRecord.data.attributes);
    assert.notOk('document' in serializedRecord.data.attributes);
  });
});
