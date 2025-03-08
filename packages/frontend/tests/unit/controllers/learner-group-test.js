import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Controller from 'frontend/controllers/learner-groups';

module('Unit | Controller | learner group', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('controller:learner-group', Controller);
  });

  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:learner-group');
    assert.ok(controller);
  });
});
