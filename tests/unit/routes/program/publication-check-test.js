import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('route:program/publicationCheck', 'Unit | Route | PublicationCheck ', {
  needs: ['service:currentUser', 'service:iliosMetrics', 'service:headData', 'service:session'],
});

test('it exists', function(assert) {
  var route = this.subject();
  assert.ok(route);
});
