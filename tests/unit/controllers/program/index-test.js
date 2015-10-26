import {
  moduleFor,
  test
} from 'ember-qunit';
import {a as testgroup} from 'ilios/tests/helpers/test-groups';

moduleFor('controller:program/index', 'Unit | Controller | Program / Index ' + testgroup, {
  // Specify the other units that are required for this test.
  needs: ['controller:program']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  var controller = this.subject();
  assert.ok(controller);
});
