import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | user ', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    var route = this.owner.lookup('route:user');
    assert.ok(route);
  });
});