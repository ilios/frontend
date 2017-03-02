import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('route:session/publicationCheck', 'Unit | Route | Session/PublicationCheck ', {
  needs: ['service:iliosMetrics', 'service:headData'],
});

test('it exists', function(assert) {
  var route = this.subject();
  assert.ok(route);
});
