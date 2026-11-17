import { setupTest } from 'frontend/tests/helpers';
import { module, test } from 'qunit';

module('Unit | Route | event-not-found', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:event-not-found');
    assert.ok(route);
  });
});
