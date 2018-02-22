import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | pending user updates', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:pending-user-updates');
    assert.ok(route);
  });
});