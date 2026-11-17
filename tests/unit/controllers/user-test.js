import Controller from 'frontend/controllers/user';
import { setupTest } from 'frontend/tests/helpers';
import { module, test } from 'qunit';

module('Unit | Controller | user', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('controller:user', Controller);
  });

  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:user');
    assert.ok(controller);
  });
});
