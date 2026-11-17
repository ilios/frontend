import { setupTest } from 'frontend/tests/helpers';
import { module, test } from 'qunit';

module('Unit | Service | session', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const service = this.owner.lookup('service:session');
    assert.ok(service);
  });
});
