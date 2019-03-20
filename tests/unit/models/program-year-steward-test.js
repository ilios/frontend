import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | program-year-steward', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let model = this.owner.lookup('service:store').createRecord('program-year-steward');
    assert.ok(!!model);
  });
});
