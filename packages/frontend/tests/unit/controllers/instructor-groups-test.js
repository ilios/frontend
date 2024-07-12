import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Controller from 'frontend/controllers/instructor-groups';

module('Unit | Controller | InstructorGroups ', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('controller:instructor-groups', Controller);
  });

  // Replace this with your real tests.
  test('it exists', function (assert) {
    var controller = this.owner.lookup('controller:instructor-groups');
    assert.ok(controller);
  });
});
