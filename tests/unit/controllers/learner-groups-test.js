import Controller from 'frontend/controllers/learner-groups';
import { setupTest } from 'frontend/tests/helpers';
import { module, test } from 'qunit';

module('Unit | Controller | LearnerGroups ', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('controller:learner-groups', Controller);
  });

  test('it exists', function (assert) {
    var controller = this.owner.lookup('controller:learner-groups');
    assert.ok(controller);
  });
});
