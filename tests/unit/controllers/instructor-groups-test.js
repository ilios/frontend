import Controller from 'frontend/controllers/instructor-groups';
import { setupTest } from 'frontend/tests/helpers';
import { module, test } from 'qunit';

module('Unit | Controller | InstructorGroups ', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('controller:instructor-groups', Controller);
  });

  test('it exists', function (assert) {
    var controller = this.owner.lookup('controller:instructor-groups');
    assert.ok(controller);
  });
});
