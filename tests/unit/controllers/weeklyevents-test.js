import { module, test } from 'qunit';
import { setupTest } from 'frontend/tests/helpers';
import Controller from 'frontend/controllers/weeklyevents';

module('Unit | Controller | weeklyevents', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('controller:weeklyevents', Controller);
  });

  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:weeklyevents');
    assert.ok(controller);
  });
});
