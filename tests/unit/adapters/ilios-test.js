import { moduleFor, test } from 'ember-qunit';

moduleFor('adapter:ilios', 'Unit | Adapter | ilios', {
  needs: ['service:ilios-config']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  let adapter = this.subject();
  assert.ok(adapter);
});
