import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | user made reminder', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let model = this.owner.lookup('service:store').createRecord('user-made-reminder');
    assert.ok(!!model);
  });
});
