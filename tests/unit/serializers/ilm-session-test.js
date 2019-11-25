import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | ilm session', function(hooks) {
  setupTest(hooks);

  test('it serializes records', function(assert) {
    const record = this.owner.lookup('service:store').createRecord('ilm-session');

    const serializedRecord = record.serialize();

    assert.ok(serializedRecord);
  });
});
