import { setupTest } from 'frontend/tests/helpers';
import { module, test } from 'qunit';

module('Unit | Route | events', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:events');
    assert.ok(route);
  });
});
