import { moduleFor, test } from 'ember-qunit';

moduleFor('route:assign-students', 'Unit | Route | assign students', {
  needs: ['service:iliosMetrics', 'service:headData'],
});

test('it exists', function(assert) {
  let route = this.subject();
  assert.ok(route);
});
