import { moduleFor, test } from 'ember-qunit';

moduleFor('route:login', 'Unit | Route | login ', {
  needs: ['service:commonAjax', 'service:currentUser', 'service:iliosConfig', 'service:iliosMetrics', 'service:headData', 'service:session'],
});

test('it exists', function(assert) {
  var route = this.subject();
  assert.ok(route);
});
