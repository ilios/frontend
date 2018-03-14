import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | admin dashboard ', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    var route = this.owner.lookup('route:admin-dashboard');
    assert.ok(route);
  });
});
