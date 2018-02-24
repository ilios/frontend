import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | curriculum inventory report/index', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:curriculum-inventory-report/index');
    assert.ok(route);
  });
});