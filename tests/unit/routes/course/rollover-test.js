import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | course/rollover', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const route = this.owner.lookup('route:course/rollover');
    assert.ok(route);
  });
});
