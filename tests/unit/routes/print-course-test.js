import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('route:print-course', 'Unit | Controller | PrintCourse ', {
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']
});

test('it exists', function(assert) {
  var route = this.subject();
  assert.ok(route);
});
