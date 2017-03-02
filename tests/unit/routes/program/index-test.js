import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('route:program/index', 'Unit | Route | Program/Index ', {
  needs: ['service:iliosMetrics', 'service:headData'],
});

test('it exists', function(assert) {
  var route = this.subject();
  assert.ok(route);
});
