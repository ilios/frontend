import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('controller:program', 'Unit | Controller | Program ', {
  needs: [
    'service:currentUser',
    'service:iliosMetrics',
    'service:headData',
  ],
});

// Replace this with your real tests.
test('it exists', function(assert) {
  var controller = this.subject();
  assert.ok(controller);
});
