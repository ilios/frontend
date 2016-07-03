import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('route:course/index', 'Unit | Controller | Course/Index ', {
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']
});

test('it exists', function(assert) {
  var route = this.subject();
  assert.ok(route);
});
