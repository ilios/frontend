import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | Course ', function(hooks) {
  setupTest(hooks);

  test('it serializes records', function(assert) {
    var record = this.owner.lookup('service:store').createRecord('course');

    var serializedRecord = record.serialize();

    assert.ok(serializedRecord);
  });
});
