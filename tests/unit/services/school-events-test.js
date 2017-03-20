import { moduleFor, test } from 'ember-qunit';

moduleFor('service:school-events', 'Unit | Service | school events', {
  needs: ['service:ajax', 'service:currentUser', 'service:iliosConfig'],
});

// Replace this with your real tests.
test('it exists', function(assert) {
  var service = this.subject();
  assert.ok(service);
});
