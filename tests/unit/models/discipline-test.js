import {
  moduleForModel,
  test
} from 'ember-qunit';

moduleForModel('discipline', 'Discipline', {
  // Specify the other units that are required for this test.
  needs: [
    'model:school',
    'model:course',
    'model:program-year',
    'model:session',
    'model:program',
    'model:user',
    'model:competency',
    'model:objective',
    'model:offering',
    'model:instructor-group',
    'model:cohort',
    'model:mesh-descriptor',
  ]
});

test('it exists', function() {
  var model = this.subject();
  // var store = this.store();
  ok(!!model);
});
