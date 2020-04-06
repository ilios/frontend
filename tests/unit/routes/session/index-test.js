import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | session/index', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const route = this.owner.lookup('route:session/index');
    assert.ok(route);
  });
});
