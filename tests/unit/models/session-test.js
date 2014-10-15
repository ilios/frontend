import {
  moduleForModel,
  test
} from 'ember-qunit';

moduleForModel('session', 'Session', {
  needs: [
    'model:course',
    'model:offering',
    'model:user'
  ]
});

test('it exists', function() {
  var model = this.subject();
  // var store = this.store();
  ok(!!model);
});
