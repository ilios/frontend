import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('CourseRoute', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    var route = this.owner.lookup('route:course');
    assert.ok(route);
  });
});