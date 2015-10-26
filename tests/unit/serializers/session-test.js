import {
  moduleFor,
  test
} from 'ember-qunit';
import {a as testgroup} from 'ilios/tests/helpers/test-groups';

moduleFor('serializer:session', 'Unit | Serializer | Session ' + testgroup, {
  // Specify the other units that are required for this test.
  // needs: ['serializer:foo']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  var serializer = this.subject();
  assert.ok(serializer);
});
