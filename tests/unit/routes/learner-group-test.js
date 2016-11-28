import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('route:learner-group', 'Unit | Controller | LearnerGroup ', {
  needs: ['service:iliosMetrics'],
});

test('it exists', function(assert) {
  var route = this.subject();
  assert.ok(route);
});
