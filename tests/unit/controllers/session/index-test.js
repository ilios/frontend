import {
  moduleFor,
  test
} from 'ember-qunit';
import {a as testgroup} from 'ilios/tests/helpers/test-groups';

moduleFor('controller:session/index', 'Unit | Controller | Session / Index ' + testgroup, {
  // Specify the other units that are required for this test.
  needs: ['controller:course', 'controller:session']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  var controller = this.subject();
  assert.ok(controller);
});
