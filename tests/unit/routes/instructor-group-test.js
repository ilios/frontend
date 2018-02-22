import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | instructor group ', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    var route = this.owner.lookup('route:instructor-group');
    assert.ok(route);
  });
});