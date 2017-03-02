import { moduleFor, test } from 'ember-qunit';

moduleFor('controller:school', 'Unit | Controller | school', {
  needs: ['service:iliosMetrics', 'service:headData'],
});

// Replace this with your real tests.
test('it exists', function(assert) {
  let controller = this.subject();
  assert.ok(controller);
});
