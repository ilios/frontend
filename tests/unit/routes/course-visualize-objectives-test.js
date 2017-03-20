import { moduleFor, test } from 'ember-qunit';

moduleFor('route:course-visualize-objectives', 'Unit | Route | course visualize objectives', {
  needs: ['service:currentUser', 'service:iliosMetrics', 'service:headData', 'service:session'],
});

test('it exists', function(assert) {
  let route = this.subject();
  assert.ok(route);
});
