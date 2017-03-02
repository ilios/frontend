import { moduleFor, test } from 'ember-qunit';

moduleFor('controller:admin-dashboard', 'Unit | Controller | AdminDashboard ', {
  needs: ['service:iliosMetrics', 'service:headData'],
});

// Replace this with your real tests.
test('it exists', function(assert) {
  var controller = this.subject();
  assert.ok(controller);
});
