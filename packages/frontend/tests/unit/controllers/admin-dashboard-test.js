import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Controller from 'frontend/controllers/admin-dashboard';

module('Unit | Controller | AdminDashboard ', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('controller:admin-dashboard', Controller);
  });

  // Replace this with your real tests.
  test('it exists', function (assert) {
    var controller = this.owner.lookup('controller:admin-dashboard');
    assert.ok(controller);
  });
});
