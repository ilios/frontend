import { moduleFor, test } from 'ember-qunit';

moduleFor('route:pending-user-updates', 'Unit | Route | pending user updates', {
  needs: ['service:currentUser', 'service:iliosMetrics', 'service:headData', 'service:session'],
});

test('it exists', function(assert) {
  let route = this.subject();
  assert.ok(route);
});
