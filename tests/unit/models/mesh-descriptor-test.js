import {
  moduleForModel,
  test
} from 'ember-qunit';

moduleForModel('mesh-descriptor', 'MeshDescriptor', {
  // Specify the other units that are required for this test.
  needs: [
    'model:objective',
    'model:competency',
    'model:course',
    'model:session',
    'model:school',
    'model:cohort',
    'model:program-year',
    'model:user',
    'model:discipline',
  ]
});

test('it exists', function() {
  var model = this.subject();
  // var store = this.store();
  ok(!!model);
});
