import {
  moduleForModel,
  test
} from 'ember-qunit';

moduleForModel('mesh-descriptor', 'MeshDescriptor', {
  // Specify the other units that are required for this test.
  needs: ['model:objective']
});

test('it exists', function() {
  var model = this.subject();
  // var store = this.store();
  ok(!!model);
});
