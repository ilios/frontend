import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | course-visualize-term', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:course-visualize-term');
    assert.ok(route);
  });
});
