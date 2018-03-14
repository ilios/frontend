import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | Course/Index ', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    var route = this.owner.lookup('route:course/index');
    assert.ok(route);
  });
});
