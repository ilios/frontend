import Controller from 'frontend/controllers/dashboard/calendar';
import { setupTest } from 'frontend/tests/helpers';
import { module, test } from 'qunit';

module('Unit | Controller | dashboard/calendar', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('controller:dashboard/calendar', Controller);
  });

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let controller = this.owner.lookup('controller:dashboard/calendar');
    assert.ok(controller);
  });
});
