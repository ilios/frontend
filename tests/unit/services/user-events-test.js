import { moduleFor, test } from 'ember-qunit';

moduleFor('service:user-events', 'Unit | Service | user events', {
  needs: ['service:currentUser', 'service:session', 'service:commonAjax', 'service:iliosConfig']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  let service = this.subject();
  assert.ok(service);
});
