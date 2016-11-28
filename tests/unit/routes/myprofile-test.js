import { moduleFor, test } from 'ember-qunit';

moduleFor('route:myprofile', 'Unit | Route | myprofile', {
  needs: ['service:iliosMetrics'],
});

test('it exists', function(assert) {
  let route = this.subject();
  assert.ok(route);
});
