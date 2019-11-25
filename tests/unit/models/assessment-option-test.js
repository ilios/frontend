import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | assessment option ', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const model = this.owner.lookup('service:store').createRecord('assessment-option');
    assert.ok(!!model);
  });
});
