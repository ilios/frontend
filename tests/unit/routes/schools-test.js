import { moduleFor, test } from 'ember-qunit';

moduleFor('route:schools', 'Unit | Route | schools', {
  needs: ['service:iliosMetrics'],
});

test('it exists', function(assert) {
  let route = this.subject();
  assert.ok(route);
});
