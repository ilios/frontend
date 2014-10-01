import {
  moduleForModel,
  test
} from 'ember-qunit';

moduleForModel('program-year', 'ProgramYear', {
  // Specify the other units that are required for this test.
  needs: [
    'model:program',
    'model:user',
    'model:competency',
    'model:discipline',
    'model:objective',
    'model:school'
  ]
});

test('it exists', function() {
  var model = this.subject();
  // var store = this.store();
  ok(!!model);
});
