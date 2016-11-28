import { moduleFor, test } from 'ember-qunit';

moduleFor('route:login', 'Unit | Route | login ', {
  needs: ['service:iliosMetrics'],
});

test('it exists', function(assert) {
  var route = this.subject();
  assert.ok(route);
});
