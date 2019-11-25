import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | assign students', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const route = this.owner.lookup('route:assign-students');
    assert.ok(route);
  });
});
