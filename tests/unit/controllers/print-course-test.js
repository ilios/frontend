import { moduleFor, test } from 'ember-qunit';

moduleFor('controller:print-course', 'Unit | Controller | print course', {
  needs: ['service:iliosMetrics', 'service:headData'],
});

// Replace this with your real tests.
test('it exists', function(assert) {
  let controller = this.subject();
  assert.ok(controller);
});
