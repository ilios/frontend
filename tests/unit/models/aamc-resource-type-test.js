import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | AAMC Resource Type', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const model = this.owner.lookup('service:store').createRecord('aamc-resource-type');
    assert.ok(!!model);
  });
});
