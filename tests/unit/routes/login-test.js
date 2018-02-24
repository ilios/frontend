import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | login ', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    var route = this.owner.lookup('route:login');
    assert.ok(route);
  });
});