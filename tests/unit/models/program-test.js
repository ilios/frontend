import {
  moduleForModel,
  test
} from 'ember-qunit';

moduleForModel('program', 'Program', {
  // Specify the other units that are required for this test.
  needs: ['model:school']
});

test('it exists', function() {
  var model = this.subject();
  // var store = this.store();
  ok(model);
});
