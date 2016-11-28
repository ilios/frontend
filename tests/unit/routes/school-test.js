import { moduleFor, test } from 'ember-qunit';

moduleFor('route:school', 'Unit | Route | school', {
  needs: ['service:iliosMetrics'],
});

test('it exists', function(assert) {
  let route = this.subject();
  assert.ok(route);
});
