import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('route:session/publicationCheck', 'Unit | Route | Session/PublicationCheck ', {
  needs: ['service:iliosMetrics'],
});

test('it exists', function(assert) {
  var route = this.subject();
  assert.ok(route);
});
