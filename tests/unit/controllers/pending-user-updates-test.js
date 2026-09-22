import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Controller from 'frontend/controllers/pending-user-updates';

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
