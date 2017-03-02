import { moduleFor, test } from 'ember-qunit';

moduleFor('controller:curriculum-inventory-report', 'Unit | Controller | curriculum-inventory-report', {
  needs: ['service:iliosMetrics', 'service:headData'],
});

// Replace this with your real tests.
test('it exists', function(assert) {
  let controller = this.subject();
  assert.ok(controller);
});
