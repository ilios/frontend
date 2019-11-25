import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | CourseLearningMaterial', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const model = this.owner.lookup('service:store').createRecord('course-learning-material');
    assert.ok(!!model);
  });
});
