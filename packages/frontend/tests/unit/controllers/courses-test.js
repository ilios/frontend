import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Controller from 'frontend/controllers/courses';

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
