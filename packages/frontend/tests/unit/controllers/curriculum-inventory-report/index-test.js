import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Controller from 'frontend/controllers/curriculum-inventory-report/index';

module('Unit | Controller | curriculum inventory report/index', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('controller:curriculum-inventory-report/index', Controller);
  });

  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:curriculum-inventory-report/index');
    assert.ok(controller);
  });
});
