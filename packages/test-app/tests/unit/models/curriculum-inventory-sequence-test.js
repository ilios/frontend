import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | CurriculumInventorySequence', function (hooks) {
  setupTest(hooks);

  test('it exists', async function (assert) {
    const model = this.owner.lookup('service:store').createRecord('curriculum-inventory-sequence');
    assert.ok(!!model);
    assert.deepEqual(await model.report, null);
  });
});
