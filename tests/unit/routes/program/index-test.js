import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | Program/Index ', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    var route = this.owner.lookup('route:program/index');
    assert.ok(route);
  });
});