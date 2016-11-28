import { moduleFor, test } from 'ember-qunit';

moduleFor('route:mymaterials', 'Unit | Route | mymaterials', {
  needs: ['service:iliosMetrics'],
});

test('it exists', function(assert) {
  let route = this.subject();
  assert.ok(route);
});
