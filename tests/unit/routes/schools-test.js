import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | schools', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:schools');
    assert.ok(route);
  });
});