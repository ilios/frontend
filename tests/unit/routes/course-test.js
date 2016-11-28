import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('route:course', 'CourseRoute', {
  needs: ['service:iliosMetrics'],
});

test('it exists', function(assert) {
  var route = this.subject();
  assert.ok(route);
});
