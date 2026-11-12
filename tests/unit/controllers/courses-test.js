import Controller from 'frontend/controllers/courses';
import { setupTest } from 'frontend/tests/helpers';
import { module, test } from 'qunit';

module('CoursesController', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('controller:courses', Controller);
  });

  test('it exists', function (assert) {
    var controller = this.owner.lookup('controller:courses');
    assert.ok(controller);
  });
});
