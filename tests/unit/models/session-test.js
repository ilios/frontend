import {
  moduleForModel,
  test
} from 'ember-qunit';

moduleForModel('session', 'Session', {
  needs: [
    'model:course',
    'model:offering',
    'model:user',
    'model:instructor-group',
    'model:school',
    'model:cohort',
    'model:objective',
    
  ]
});

test('it exists', function() {
  var model = this.subject();
  // var store = this.store();
  ok(!!model);
});
