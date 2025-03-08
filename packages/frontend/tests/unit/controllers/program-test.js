import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Controller from 'frontend/controllers/program';

module('Unit | Controller | Program ', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('controller:program', Controller);
  });

  test('it exists', function (assert) {
    var controller = this.owner.lookup('controller:program');
    assert.ok(controller);
  });
});
