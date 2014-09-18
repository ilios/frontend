import {
  moduleForModel,
  test
} from 'ember-qunit';

moduleForModel('objective', 'Objective', {
  // Specify the other units that are required for this test.
  needs: ['model:competency', 'model:course', 'model:session']
});

test('it exists', function() {
  var model = this.subject();
  // var store = this.store();
  ok(!!model);
});
