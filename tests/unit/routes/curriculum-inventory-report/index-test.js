import { moduleFor, test } from 'ember-qunit';

moduleFor('route:curriculum-inventory-report/index', 'Unit | Route | curriculum inventory report/index', {
  needs: ['service:iliosMetrics', 'service:headData'],
});

test('it exists', function(assert) {
  let route = this.subject();
  assert.ok(route);
});
