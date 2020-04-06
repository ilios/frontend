import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | session/copy', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const route = this.owner.lookup('route:session/copy');
    assert.ok(route);
  });
});
