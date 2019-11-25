import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | SessionLearningMaterial', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const model = this.owner.lookup('service:store').createRecord('session-learning-material');
    assert.ok(!!model);
  });
});
