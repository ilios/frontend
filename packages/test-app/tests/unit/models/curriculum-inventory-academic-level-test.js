import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | CurriculumInventoryAcademicLevel', function (hooks) {
  setupTest(hooks);

  test('it exists', async function (assert) {
    const model = this.owner
      .lookup('service:store')
      .createRecord('curriculum-inventory-academic-level');
    assert.ok(!!model);

    assert.deepEqual(await model.report, null);
  });
});
