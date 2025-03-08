import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Controller from 'frontend/controllers/school';

module('Unit | Controller | school', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('controller:school', Controller);
  });

  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:school');
    assert.ok(controller);
  });
});
