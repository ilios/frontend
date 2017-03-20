import { moduleFor, test } from 'ember-qunit';

moduleFor('service:ilios-metrics', 'Unit | Service | ilios metrics', {
  needs: ['service:metrics', 'service:currentUser', 'service:iliosConfig'],
});

// Replace this with your real tests.
test('it exists', function(assert) {
  let service = this.subject();
  assert.ok(service);
});
