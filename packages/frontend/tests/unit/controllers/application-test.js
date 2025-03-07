import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('ApplicationController', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    var controller = this.owner.lookup('controller:application');
    assert.ok(controller);
  });
});
