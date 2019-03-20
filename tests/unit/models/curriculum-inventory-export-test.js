import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | CurriculumInventoryExport', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let model = this.owner.lookup('service:store').createRecord('curriculum-inventory-export');
    assert.ok(!!model);
  });
});
