import { moduleFor, test } from 'ember-qunit';

moduleFor('controller:course/rollover', 'Unit | Controller | course/rollover', {
  needs: ['service:iliosMetrics'],
});

// Replace this with your real tests.
test('it exists', function(assert) {
  let controller = this.subject();
  assert.ok(controller);
});
