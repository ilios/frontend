import {
  moduleForModel,
  test
} from 'ember-qunit';
import modelList from '../../helpers/model-list';

moduleForModel('course-learning-material', 'CourseLearningMaterial', {
  needs: modelList
});

test('it exists', function(assert) {
  var model = this.subject();
  // var store = this.store();
  assert.ok(!!model);
});
