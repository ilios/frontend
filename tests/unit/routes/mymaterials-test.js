import { moduleFor, test } from 'ember-qunit';

moduleFor('route:mymaterials', 'Unit | Route | mymaterials', {
  needs: ['service:ajax', 'service:currentUser', 'service:iliosMetrics', 'service:headData', 'service:iliosConfig', 'service:session'],
});

test('it exists', function(assert) {
  let route = this.subject();
  assert.ok(route);
});
