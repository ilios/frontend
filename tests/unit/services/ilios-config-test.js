import { moduleFor, test } from 'ember-qunit';

moduleFor('service:ilios-config', 'Unit | Service | ilios config', {
  needs: ['service:ajax', 'service:serverVariables']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  let service = this.subject();
  assert.ok(service);
});
