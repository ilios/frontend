import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('InstructorGroupsRoute', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    var route = this.owner.lookup('route:instructorGroups');
    assert.ok(route);
  });
});
