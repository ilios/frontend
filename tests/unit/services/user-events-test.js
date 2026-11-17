import { setupTest } from 'frontend/tests/helpers';
import { module, test } from 'qunit';

module('Unit | Service | user events', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    var service = this.owner.lookup('service:user-events');
    assert.ok(service);
  });
});
