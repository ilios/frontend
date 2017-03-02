import { moduleFor, test } from 'ember-qunit';

moduleFor('route:curriculum-inventory-reports', 'Unit | Route | curriculum-inventory-reports', {
  needs: ['service:iliosMetrics', 'service:headData'],
});

test('it exists', function(assert) {
  let route = this.subject();
  assert.ok(route);
});
