import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('route:print-course', 'Unit | Route | PrintCourse ', {
  needs: ['service:currentUser', 'service:iliosMetrics', 'service:headData', 'service:session'],
});

test('it exists', function(assert) {
  var route = this.subject();
  assert.ok(route);
});
