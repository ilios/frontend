import { module, test } from 'qunit';
import { setupTest } from 'frontend/tests/helpers';

module('Unit | Service | new-version', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let service = this.owner.lookup('service:new-version');
    assert.ok(service);
  });
});
