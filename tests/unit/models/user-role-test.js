import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | UserRole', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let model = this.owner.lookup('service:store').createRecord('user-role');
    assert.ok(!!model);
  });
});
