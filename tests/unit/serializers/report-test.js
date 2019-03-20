import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | report', function(hooks) {
  setupTest(hooks);

  test('it removes all non postable fields', function(assert) {
    var record = this.owner.lookup('service:store').createRecord('offering');

    var serializedRecord = record.serialize();

    assert.ok(!("createdAt" in serializedRecord));
  });
});
