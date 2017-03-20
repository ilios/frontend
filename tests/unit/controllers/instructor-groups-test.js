import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('controller:instructorGroups', 'Unit | Controller | InstructorGroups ', {
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
