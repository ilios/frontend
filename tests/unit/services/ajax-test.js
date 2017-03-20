import { moduleFor, test } from 'ember-qunit';

moduleFor('service:ajax', 'Unit | Service | ajax', {
  needs: ['service:iliosConfig', 'service:session']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  let service = this.subject();
  assert.ok(service);
});
