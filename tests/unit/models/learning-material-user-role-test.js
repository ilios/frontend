import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | LearningMaterialUserRole', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const model = this.owner.lookup('service:store').createRecord('learning-material-user-role');
    assert.ok(!!model);
  });
});
