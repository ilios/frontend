import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | course-visualize-session-types', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const route = this.owner.lookup('route:course-visualize-session-types');
    assert.ok(route);
  });
});
