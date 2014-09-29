import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('controller:objective', 'ObjectiveController', {
  // Specify the other units that are required for this test.
  needs: ['controller:programyear', 'controller:programyearobjectives']
});

// Replace this with your real tests.
test('it exists', function() {
  var controller = this.subject();
  ok(controller);
});
