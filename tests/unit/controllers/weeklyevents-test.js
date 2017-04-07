import { moduleFor, test } from 'ember-qunit';

moduleFor('controller:weeklyevents', 'Unit | Controller | weeklyevents', {
  needs: ['service:iliosMetrics', 'service:headData'],
});

// Replace this with your real tests.
test('it exists', function(assert) {
  let controller = this.subject();
  assert.ok(controller);
});
