import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('controller:topic/selected', 'TopicSelectedController', {
  // Specify the other units that are required for this test.
  needs: ['controller:programyear']
});

// Replace this with your real tests.
test('it exists', function() {
  var controller = this.subject();
  ok(controller);
});
