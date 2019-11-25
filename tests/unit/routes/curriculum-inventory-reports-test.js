import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | curriculum-inventory-reports', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const route = this.owner.lookup('route:curriculum-inventory-reports');
    assert.ok(route);
  });
});
