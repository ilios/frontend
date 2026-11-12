import Controller from 'frontend/controllers/pending-user-updates';
import { setupTest } from 'frontend/tests/helpers';
import { module, test } from 'qunit';

module('Unit | Controller | pending user updates', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('controller:pending-user-updates', Controller);
  });

  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:pending-user-updates');
    assert.ok(controller);
  });
});
