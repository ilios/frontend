import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Controller from 'frontend/controllers/assign-students';

module('Unit | Controller | assign students', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('controller:assign-students', Controller);
  });

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:assign-students');
    assert.ok(controller);
  });
});
