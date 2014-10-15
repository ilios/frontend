import {
  moduleForModel,
  test
} from 'ember-qunit';

moduleForModel('instructor-group', 'InstructorGroup', {
  // Specify the other units that are required for this test.
  needs: [
    'model:school',
    'model:user',
    'model:program',
    'model:program-year',
    'model:offering',
    'model:session',
  ]
});

test('it exists', function() {
  var model = this.subject();
  // var store = this.store();
  ok(!!model);
});
