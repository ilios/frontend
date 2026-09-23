import { module, test } from 'qunit';
import { setupTest } from 'frontend/tests/helpers';
import Controller from 'frontend/controllers/dashboard/materials';

module('Unit | Controller | dashboard/materials', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('controller:dashboard/materials', Controller);
  });

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let controller = this.owner.lookup('controller:dashboard/materials');
    assert.ok(controller);
  });
});
