import { module, test } from 'qunit';
import { setupTest } from 'frontend/tests/helpers';
import Controller from 'frontend/controllers/course-materials';

module('Unit | Controller | course-materials', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('controller:course-materials', Controller);
  });

  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:course-materials');
    assert.ok(controller);
  });
});
