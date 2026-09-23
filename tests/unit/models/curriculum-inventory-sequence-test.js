import { module, test } from 'qunit';
import { setupTest } from 'frontend/tests/helpers';

module('Unit | Model | CurriculumInventorySequence', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');
  });

  test('it exists', async function (assert) {
    const model = this.store.createRecord('curriculum-inventory-sequence');
    assert.ok(!!model);
    assert.deepEqual(await model.report, null);
  });
});
