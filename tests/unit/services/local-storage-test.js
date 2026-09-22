import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | local-storage', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const service = this.owner.lookup('service:local-storage');
    assert.ok(service);
  });
});
