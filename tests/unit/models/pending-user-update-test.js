import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | pending user update', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const model = this.owner.lookup('service:store').createRecord('pending-user-update');
    assert.ok(!!model);
  });
});
