import {
  moduleFor,
  test
} from 'ember-qunit';
import {a as testgroup} from 'ilios/tests/helpers/test-groups';

moduleFor('service:current-user', 'CurrentUserService' + testgroup, {
  needs: ['model:user']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  var service = this.subject();
  assert.ok(service);
});
