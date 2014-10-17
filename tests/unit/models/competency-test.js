import {
  moduleForModel,
  test
} from 'ember-qunit';

moduleForModel('competency', 'Competency', {
  // Specify the other units that are required for this test.
  needs: [
    'model:program',
    'model:school',
    'model:program-year',
    'model:user',
    'model:discipline',
    'model:objective',
    'model:instructor-group'
  ]
});

test('it exists', function() {
  var model = this.subject();
  // var store = this.store();
  ok(!!model);
});
