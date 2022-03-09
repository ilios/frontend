import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | dashboard/materials', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let controller = this.owner.lookup('controller:dashboard/materials');
    assert.ok(controller);
  });
});
