import {
  moduleForModel,
  test
} from 'ember-qunit';

moduleForModel('offering', 'Offering', {
  needs: ['model:session', 'model:course', 'model:user']
});

test('it exists', function() {
  var model = this.subject();
  // var store = this.store();
  ok(!!model);
});
