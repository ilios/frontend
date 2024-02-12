import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('ApplicationRoute', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    var route = this.owner.lookup('route:application');
    assert.ok(route);
  });
});
