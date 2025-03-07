import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Controller from 'ilios-common/controllers/course-visualize-instructors';

module('Unit | Controller | course-visualize-instructors', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('controller:course-visualize-instructors', Controller);
  });

  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:course-visualize-instructors');
    assert.ok(controller);
  });
});
