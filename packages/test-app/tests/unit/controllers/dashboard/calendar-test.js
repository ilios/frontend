import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Controller from 'ilios-common/controllers/dashboard/calendar';

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
