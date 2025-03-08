import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | server-variables', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const service = this.owner.lookup('service:server-variables');
    assert.ok(service);
  });
});
