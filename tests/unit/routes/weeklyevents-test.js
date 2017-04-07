import { moduleFor, test } from 'ember-qunit';

moduleFor('route:weeklyevents', 'Unit | Route | weeklyevents', {
  needs: ['service:iliosMetrics', 'service:headData'],
});

test('it exists', function(assert) {
  let route = this.subject();
  assert.ok(route);
});
