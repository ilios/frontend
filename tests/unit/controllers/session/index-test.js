import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('controller:session/index', 'Unit | Controller | Session / Index ', {
  needs: ['controller:course', 'controller:session', 'service:iliosMetrics', 'service:headData']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  var controller = this.subject();
  assert.ok(controller);
});
