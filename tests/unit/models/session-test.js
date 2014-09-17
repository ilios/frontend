import {
  moduleForModel,
  test
} from 'ember-qunit';

moduleForModel('session', 'Session', {
  needs: ['model:course', 'model:offering']
});

test('it exists', function() {
  var model = this.subject();
  // var store = this.store();
  ok(!!model);
});
