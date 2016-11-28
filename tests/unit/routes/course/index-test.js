import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('route:course/index', 'Unit | Controller | Course/Index ', {
  needs: ['service:iliosMetrics'],
});

test('it exists', function(assert) {
  var route = this.subject();
  assert.ok(route);
});
