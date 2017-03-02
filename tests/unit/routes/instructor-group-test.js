import { moduleFor, test } from 'ember-qunit';

moduleFor('route:instructor-group', 'Unit | Route | instructor group ', {
  needs: ['service:iliosMetrics', 'service:headData'],
});

test('it exists', function(assert) {
  var route = this.subject();
  assert.ok(route);
});
