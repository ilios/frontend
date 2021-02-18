import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | session', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const service = this.owner.lookup('service:session');
    assert.ok(service);
  });
});
