import { moduleFor, test } from 'ember-qunit';

moduleFor('controller:session/copy', 'Unit | Controller | session/copy', {
  needs: ['service:iliosMetrics', 'service:headData'],
});

// Replace this with your real tests.
test('it exists', function(assert) {
  let controller = this.subject();
  assert.ok(controller);
});
