import { moduleFor, test } from 'ember-qunit';

moduleFor('service:reporting', 'Unit | Service | reporting', {
  needs: ['service:currentUser'],
});

// Replace this with your real tests.
test('it exists', function(assert) {
  var service = this.subject();
  assert.ok(service);
});
