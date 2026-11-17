import { setupTest } from 'frontend/tests/helpers';
import { module, test } from 'qunit';

module('Unit | Route | session/publication-check', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:session/publication-check');
    assert.ok(route);
  });
});
