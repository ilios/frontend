import {
  moduleForModel,
  test
} from 'ember-qunit';

moduleForModel('school', 'School', {
  // Specify the other units that are required for this test.
  needs: ['model:program']
});

test('it exists', function() {
  var model = this.subject();
  // var store = this.store();
  ok(!!model);
});
