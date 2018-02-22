import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('CoursesRoute', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    var route = this.owner.lookup('route:courses');
    assert.ok(route);
  });
});