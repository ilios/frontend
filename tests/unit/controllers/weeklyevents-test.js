import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Controller from 'ilios-common/controllers/weeklyevents';

module('Unit | Controller | weeklyevents', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('controller:weeklyevents', Controller);
  });

  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:weeklyevents');
    assert.ok(controller);
  });
});
