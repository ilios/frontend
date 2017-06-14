import { moduleFor, test } from 'ember-qunit';

moduleFor('service:school-events', 'Unit | Service | school events', {
  needs: ['service:currentUser', 'service:commonAjax', 'service:iliosConfig']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  let service = this.subject();
  assert.ok(service);
});
