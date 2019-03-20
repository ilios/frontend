import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | Department', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let model = this.owner.lookup('service:store').createRecord('department');
    assert.ok(!!model);
  });
});
