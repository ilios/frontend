import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Controller from 'frontend/controllers/curriculum-inventory-sequence-block';

module('Unit | Controller | curriculum inventory sequence block', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('controller:curriculum-inventory-sequence-block', Controller);
  });

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:curriculum-inventory-sequence-block');
    assert.ok(controller);
  });
});
