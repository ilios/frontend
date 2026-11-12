import Controller from 'frontend/controllers/session/copy';
import { setupTest } from 'frontend/tests/helpers';
import { module, test } from 'qunit';

module('Unit | Controller | session/copy', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('controller:session/copy', Controller);
  });

  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:session/copy');
    assert.ok(controller);
  });
});
