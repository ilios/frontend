import { moduleFor, test } from 'ember-qunit';

moduleFor('controller:course/index', 'Unit | Controller | course/index', {
  needs: ['service:iliosMetrics'],
});

// Replace this with your real tests.
test('it exists', function(assert) {
  let controller = this.subject();
  assert.ok(controller);
});
