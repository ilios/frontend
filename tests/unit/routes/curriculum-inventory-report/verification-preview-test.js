import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | curriculumInventoryReport/verificationPreview', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:curriculum-inventory-report/verification-preview');
    assert.ok(route);
  });
});
