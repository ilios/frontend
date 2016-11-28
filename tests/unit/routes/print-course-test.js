import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('route:print-course', 'Unit | Controller | PrintCourse ', {
  needs: ['service:iliosMetrics'],
});

test('it exists', function(assert) {
  var route = this.subject();
  assert.ok(route);
});
