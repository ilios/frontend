import { moduleFor, test } from 'ember-qunit';

moduleFor('route:events', 'Unit | Route | events ', {
  needs: ['service:currentUser', 'service:iliosMetrics', 'service:headData', 'service:session', 'service:userEvents', 'service:schoolEvents'],
});

test('it exists', function(assert) {
  var route = this.subject();
  assert.ok(route);
});
