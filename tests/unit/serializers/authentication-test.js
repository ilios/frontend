import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | authentication', function(hooks) {
  setupTest(hooks);

  test('it serializes records', function(assert) {
    let record = this.owner.lookup('service:store').createRecord('authentication');

    let serializedRecord = record.serialize();

    assert.ok(serializedRecord);
  });
});
