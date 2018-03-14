import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { run } from '@ember/runloop';

module('Unit | Serializer | Course ', function(hooks) {
  setupTest(hooks);

  test('it serializes records', function(assert) {
    var record = run(() => this.owner.lookup('service:store').createRecord('course'));

    var serializedRecord = record.serialize();

    assert.ok(serializedRecord);
  });
});
