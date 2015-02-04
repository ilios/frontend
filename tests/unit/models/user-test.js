import {
  moduleForModel,
  test
} from 'ember-qunit';

moduleForModel('user', 'User', {
  needs: [
    'model:offering',
    'model:school',
    'model:session',
    'model:program',
    'model:program-year',
    'model:instructor-group',
    'model:course',
    'model:cohort',
    'model:objective',
    'model:competency',
    'model:mesh-descriptor',
    'model:discipline',
    'model:learning-material',
  ]
});

test('it exists', function() {
  var model = this.subject();
  // var store = this.store();
  ok(!!model);
});
