import { setupTest } from 'frontend/tests/helpers';
import { module, test } from 'qunit';

module('Unit | Service | data-loader', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const service = this.owner.lookup('service:data-loader');
    assert.ok(service);
  });
});
