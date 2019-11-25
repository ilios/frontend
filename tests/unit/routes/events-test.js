import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | events', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const route = this.owner.lookup('route:events');
    assert.ok(route);
  });
});
