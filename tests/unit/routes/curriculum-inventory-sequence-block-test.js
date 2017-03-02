import { moduleFor, test } from 'ember-qunit';

moduleFor('route:curriculum-inventory-sequence-block', 'Unit | Route | curriculum inventory sequence block', {
  needs: ['service:iliosMetrics', 'service:headData'],
});

test('it exists', function(assert) {
  let route = this.subject();
  assert.ok(route);
});
