import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | course/publication-check', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const route = this.owner.lookup('route:course/publication-check');
    assert.ok(route);
  });
});
