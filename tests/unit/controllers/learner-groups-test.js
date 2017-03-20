import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('controller:learnerGroups', 'Unit | Controller | LearnerGroups ', {
  needs: [
    'service:currentUser',
    'service:i18n',
    'service:iliosMetrics',
    'service:headData',
  ],
});

// Replace this with your real tests.
test('it exists', function(assert) {
  var controller = this.subject();
  assert.ok(controller);
});
