import { setupTest } from 'frontend/tests/helpers';
import { module, test } from 'qunit';

module('ApplicationAdapter', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    var adapter = this.owner.lookup('adapter:application');
    assert.ok(adapter);
  });
});
