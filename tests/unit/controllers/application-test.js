import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('controller:application', 'ApplicationController', {
  needs: ['service:iliosMetrics'],
});

// Replace this with your real tests.
test('it exists', function(assert) {
  var controller = this.subject();
  assert.ok(controller);
});
