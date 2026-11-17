import { setupTest } from 'frontend/tests/helpers';
import { module, test } from 'qunit';

module('Unit | Serializer | authentication', function (hooks) {
  setupTest(hooks);

  test('it serializes records', function (assert) {
    const record = this.owner.lookup('service:store').createRecord('authentication');

    const serializedRecord = record.serialize();

    assert.ok(serializedRecord);
  });
});
