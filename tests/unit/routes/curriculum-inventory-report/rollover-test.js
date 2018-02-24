import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | curriculum inventory report/rollover', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:curriculum-inventory-report/rollover');
    assert.ok(route);
  });
});