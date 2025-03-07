import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Controller from 'ilios-common/controllers/session/index';

module('Unit | Controller | session/index', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('controller:session/index', Controller);
  });

  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:session/index');
    assert.ok(controller);
  });
});
