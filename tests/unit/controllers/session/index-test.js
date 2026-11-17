import Controller from 'frontend/controllers/session/index';
import { setupTest } from 'frontend/tests/helpers';
import { module, test } from 'qunit';

module('Unit | Controller | session/index', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('controller:session/index', Controller);
  });

  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:session/index');
    assert.ok(controller);
  });
});
