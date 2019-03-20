import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | Session ', function(hooks) {
  setupTest(hooks);

  test('it removes all non postable fields', function(assert) {
    var record = this.owner.lookup('service:store').createRecord('session');

    var serializedRecord = record.serialize();

    assert.ok(!("updatedAt" in serializedRecord));
  });
});
