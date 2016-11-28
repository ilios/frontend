import { moduleFor, test } from 'ember-qunit';

moduleFor('route:curriculum-inventory-report/rollover', 'Unit | Route | curriculum inventory report/rollover', {
  needs: ['service:iliosMetrics'],
});

test('it exists', function(assert) {
  let route = this.subject();
  assert.ok(route);
});
