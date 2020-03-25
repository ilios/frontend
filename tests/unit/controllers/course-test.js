import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | course', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    const controller = this.owner.lookup('controller:course');
    assert.ok(controller);
  });
});
