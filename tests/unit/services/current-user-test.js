import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('service:current-user', 'CurrentUserService', {
  needs: ['service:session', 'model:user']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  var service = this.subject();
  assert.ok(service);
});
