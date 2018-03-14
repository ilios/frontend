import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { run } from '@ember/runloop';

module('Unit | Serializer | offering', function(hooks) {
  setupTest(hooks);

  test('it removes all non postable fields', function(assert) {
    var record = run(() => this.owner.lookup('service:store').createRecord('offering'));

    var serializedRecord = record.serialize();
    
    assert.ok(!("updatedAt" in serializedRecord));
  });
});
