import {
  moduleForModel,
  test
} from 'ember-qunit';

moduleForModel('objective', 'Objective', {
  // Specify the other units that are required for this test.
  needs: [
    'model:competency',
    'model:course',
    'model:session',
    'model:program-year',
    'model:program',
    'model:discipline',
    'model:user'
  ]
});

test('it exists', function() {
  var model = this.subject();
  // var store = this.store();
  ok(!!model);
});
