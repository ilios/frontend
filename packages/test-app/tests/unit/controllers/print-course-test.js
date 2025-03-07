import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Controller from 'ilios-common/controllers/print-course';

module('Unit | Controller | print-course', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('controller:print-course', Controller);
  });

  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:print-course');
    assert.ok(controller);
  });
});
