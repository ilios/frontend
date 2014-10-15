import {
  moduleForModel,
  test
} from 'ember-qunit';

moduleForModel('school', 'School', {
  // Specify the other units that are required for this test.
  needs: [
    'model:program',
    'model:program-year',
    'model:user',
    'model:competency',
    'model:discipline',
    'model:objective'
  ]
});

test('it exists', function() {
  var model = this.subject();
  // var store = this.store();
  ok(!!model);
});
