import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | aamc method', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let model = this.owner.lookup('service:store').createRecord('aamc-method');
    assert.ok(!!model);
  });
});
