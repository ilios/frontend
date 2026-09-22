import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Controller from 'ilios-common/controllers/course';

module('Unit | Controller | course', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('controller:course', Controller);
  });

  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:course');
    assert.ok(controller);
  });
});
