import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('route:course/index', 'Unit | Route | Course/Index ', {
  needs: ['service:currentUser', 'service:iliosMetrics', 'service:headData', 'service:session'],
});

test('it exists', function(assert) {
  var route = this.subject();
  assert.ok(route);
});
