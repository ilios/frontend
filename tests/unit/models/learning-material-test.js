import {
  moduleForModel,
  test
} from 'ember-qunit';

moduleForModel('learning-material', 'LearningMaterial', {
  // Specify the other units that are required for this test.
  needs: [
  'model:course',
  'model:cohort',
  'model:user',
  'model:discipline',
  'model:objective',
  'model:school',
  'model:session',
  'model:mesh-descriptor',
  ]
});

test('it exists', function() {
  var model = this.subject();
  // var store = this.store();
  ok(!!model);
});
