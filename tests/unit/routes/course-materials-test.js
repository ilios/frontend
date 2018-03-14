import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | course materials', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:course-materials');
    assert.ok(route);
  });
});
