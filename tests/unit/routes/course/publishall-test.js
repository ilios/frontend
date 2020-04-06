import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | course/publishall', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const route = this.owner.lookup('route:course/publishall');
    assert.ok(route);
  });
});
