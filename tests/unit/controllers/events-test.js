import { module, test } from 'qunit';
import { setupTest } from 'frontend/tests/helpers';
import Controller from 'frontend/controllers/events';

module('Unit | Controller | events', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('controller:events', Controller);
  });

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let controller = this.owner.lookup('controller:events');
    assert.ok(controller);
  });
});
