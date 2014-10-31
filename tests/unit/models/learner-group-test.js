import {
  moduleForModel,
  test
} from 'ember-qunit';

moduleForModel('learner-group', 'LearnerGroup', {
  // Specify the other units that are required for this test.
  needs: [
    'model:cohort',
    'model:user',
    'model:instructor-group',
    'model:offering',
    'model:program-year',
    'model:course',
    'model:school',
    'model:session',
  ]
});

test('it exists', function() {
  var model = this.subject();
  // var store = this.store();
  ok(!!model);
});
