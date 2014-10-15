import {
  moduleForModel,
  test
} from 'ember-qunit';

moduleForModel('program', 'Program', {
  // Specify the other units that are required for this test.
  needs: [
    'model:school',
    'model:program-year',
    'model:user',
    'model:competency',
    'model:discipline',
    'model:objective',
    'model:offering'
  ]
});

test('it exists', function() {
  var model = this.subject();
  // var store = this.store();
  ok(!!model);
});
