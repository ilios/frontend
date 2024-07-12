import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Controller from 'frontend/controllers/curriculum-inventory-report/rollover';

module('Unit | Controller | curriculum inventory report/rollover', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('controller:curriculum-inventory-report/rollover', Controller);
  });

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:curriculum-inventory-report/rollover');
    assert.ok(controller);
  });
});
