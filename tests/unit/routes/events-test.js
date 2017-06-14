import { moduleFor, test } from 'ember-qunit';

moduleFor('route:events', 'Unit | Route | events', {
  needs: ['service:session', 'service:userEvents', 'service:schoolEvents']
});

test('it exists', function(assert) {
  let route = this.subject();
  assert.ok(route);
});
