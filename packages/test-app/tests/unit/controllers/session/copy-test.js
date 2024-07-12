import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Controller from 'ilios-common/controllers/session/copy';

module('Unit | Controller | session/copy', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('controller:session/copy', Controller);
  });

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:session/copy');
    assert.ok(controller);
  });
});
