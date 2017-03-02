import { moduleFor, test } from 'ember-qunit';

moduleFor('route:events', 'Unit | Route | events ', {
  needs: ['service:iliosMetrics', 'service:headData'],
});

test('it exists', function(assert) {
  var route = this.subject();
  assert.ok(route);
});
