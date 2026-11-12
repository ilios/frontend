import { setupTest } from 'frontend/tests/helpers';
import { module, test } from 'qunit';

module('ApplicationController', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    var controller = this.owner.lookup('controller:application');
    assert.ok(controller);
  });
});
