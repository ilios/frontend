import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Controller from 'frontend/controllers/search';

module('Unit | Controller | search', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('controller:search', Controller);
  });

  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:search');
    assert.ok(controller);
  });
});
