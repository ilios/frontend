import { moduleFor, test } from 'ember-qunit';

moduleFor('route:schools', 'Unit | Route | schools', {
  needs: ['service:currentUser', 'service:iliosMetrics', 'service:headData', 'service:session'],
});

test('it exists', function(assert) {
  let route = this.subject();
  assert.ok(route);
});
