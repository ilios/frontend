import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | curriculum-inventory-reports', function (hooks) {
  setupTest(hooks);

  test('it renders', async function (assert) {
    const controller = this.owner.lookup('controller:curriculum-inventory-reports');
    assert.ok(controller);
  });
});
