import { moduleFor, test } from 'ember-qunit';

moduleFor('route:course-visualize-objectives', 'Unit | Route | course visualize objectives', {
  needs: ['service:iliosMetrics', 'service:headData'],
});

test('it exists', function(assert) {
  let route = this.subject();
  assert.ok(route);
});
