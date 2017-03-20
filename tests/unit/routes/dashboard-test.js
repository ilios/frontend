import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('route:dashboard', 'DashboardRoute', {
  needs: ['service:currentUser', 'service:i18n', 'service:iliosMetrics', 'service:headData', 'service:session'],
});

test('it exists', function(assert) {
  var route = this.subject();
  assert.ok(route);
});
