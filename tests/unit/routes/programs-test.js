import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('route:programs', 'Unit | Route | Programs ', {
  needs: ['service:iliosMetrics'],
});

test('it exists', function(assert) {
  var route = this.subject();
  assert.ok(route);
});
