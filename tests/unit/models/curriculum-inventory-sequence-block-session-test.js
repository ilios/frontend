import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | CurriculumInventorySequenceBlockSession ', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('curriculum-inventory-sequence-block-session'));
    // let store = this.store();
    assert.ok(!!model);
  });
});
