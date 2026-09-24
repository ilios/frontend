import { module, test } from 'qunit';
import { setupTest } from 'frontend/tests/helpers';
import Controller from 'frontend/controllers/course/rollover';

module('Unit | Controller | course/rollover', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('controller:course/rollover', Controller);
  });

  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:course/rollover');
    assert.ok(controller);
  });
});
