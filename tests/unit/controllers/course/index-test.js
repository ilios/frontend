import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('controller:course/index', {
  // Specify the other units that are required for this test.
  needs: ['controller:course']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  var controller = this.subject();
  assert.ok(controller);
});
