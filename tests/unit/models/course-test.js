import {
  moduleForModel,
  test
} from 'ember-qunit';

moduleForModel('course', 'Course', {
  // Specify the other units that are required for this test.
  needs: [
    'model:session',
    'model:offering',
    'model:program',
    'model:school',
    'model:program-year',
    'model:instructor-group'
  ]
});

test('it exists', function() {
  var model = this.subject();
  // var store = this.store();
  ok(!!model);
});
