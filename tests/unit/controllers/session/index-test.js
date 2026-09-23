import { module, test } from 'qunit';
import { setupTest } from 'frontend/tests/helpers';
import Controller from 'frontend/controllers/session/index';

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
