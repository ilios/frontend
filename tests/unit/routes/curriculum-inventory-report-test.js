import { moduleFor, test } from 'ember-qunit';

moduleFor('route:curriculum-inventory-report', 'Unit | Route | curriculum-inventory-report', {
  needs: ['service:iliosMetrics'],
});

test('it exists', function(assert) {
  let route = this.subject();
  assert.ok(route);
});
