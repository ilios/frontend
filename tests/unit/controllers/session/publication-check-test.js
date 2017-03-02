import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('controller:session/publicationCheck', 'Unit | Controller | PublicationCheck ', {
  // Specify the other units that are required for this test.
  needs: ['controller:course', 'controller:session', 'service:iliosMetrics', 'service:headData']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  var controller = this.subject();
  assert.ok(controller);
});
