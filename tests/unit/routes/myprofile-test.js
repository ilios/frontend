import { moduleFor, test } from 'ember-qunit';

moduleFor('route:myprofile', 'Unit | Route | myprofile', {
  needs: ['service:iliosMetrics', 'service:headData'],
});

test('it exists', function(assert) {
  let route = this.subject();
  assert.ok(route);
});
