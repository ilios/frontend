import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Controller from 'ilios-common/controllers/course/index';

module('Unit | Controller | course/index', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('controller:course/index', Controller);
  });

  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:course/index');
    assert.ok(controller);
  });
});
