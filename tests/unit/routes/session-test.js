import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('route:session', 'Unit | Route | Session ', {
  needs: ['service:iliosMetrics'],
});

test('it exists', function(assert) {
  var route = this.subject();
  assert.ok(route);
});
