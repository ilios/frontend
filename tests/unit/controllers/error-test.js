import { moduleFor, test } from 'ember-qunit';

moduleFor('controller:error', 'Unit | Controller | error', {
  needs: ['service:iliosMetrics'],
});

// Replace this with your real tests.
test('it exists', function(assert) {
  let controller = this.subject();
  assert.ok(controller);
});
