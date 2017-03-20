import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('adapter:application', 'ApplicationAdapter', {
  needs: ['service:session', 'service:iliosConfig']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  var adapter = this.subject();
  assert.ok(adapter);
});
