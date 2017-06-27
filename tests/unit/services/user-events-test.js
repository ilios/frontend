import { moduleFor, test } from 'ember-qunit';

moduleFor('service:user-events', 'Unit | Service | user events', {
  needs: ['service:commonAjax', 'service:currentUser', 'service:iliosConfig', 'service:session'],
});

// Replace this with your real tests.
test('it exists', function(assert) {
  var service = this.subject();
  assert.ok(service);
});
