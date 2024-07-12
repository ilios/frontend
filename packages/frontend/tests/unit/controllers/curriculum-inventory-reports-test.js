import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Controller from 'frontend/controllers/curriculum-inventory-reports';

module('Unit | Controller | curriculum-inventory-reports', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('controller:curriculum-inventory-reports', Controller);
  });

  test('it renders', async function (assert) {
    const controller = this.owner.lookup('controller:curriculum-inventory-reports');
    assert.ok(controller);
  });
});
