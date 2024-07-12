import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Controller from 'frontend/controllers/learner-groups';

module('Unit | Controller | LearnerGroups ', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('controller:learner-groups', Controller);
  });

  // Replace this with your real tests.
  test('it exists', function (assert) {
    var controller = this.owner.lookup('controller:learner-groups');
    assert.ok(controller);
  });
});
