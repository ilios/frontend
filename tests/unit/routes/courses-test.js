import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('route:courses', 'CoursesRoute', {
  needs: ['service:iliosMetrics'],
});

test('it exists', function(assert) {
  var route = this.subject();
  assert.ok(route);
});
