import {
  moduleForModel,
  test
} from 'ember-qunit';

moduleForModel('objective', 'Objective', {
  needs: [
    'model:aamc-method',
    'model:aamc-pcrs',
    'model:alert-change-type',
    'model:alert',
    'model:cohort',
    'model:competency',
    'model:course-learning-material',
    'model:course',
    'model:course-clerkship-type',
    'model:curriculum-inventory-academic-level',
    'model:curriculum-inventory-export',
    'model:curriculum-inventory-institution',
    'model:curriculum-inventory-report',
    'model:curriculum-inventory-sequence-block',
    'model:curriculum-inventory-sequence',
    'model:department',
    'model:discipline',
    'model:educational-year',
    'model:ilm-session',
    'model:instruction-hour',
    'model:instructor-group',
    'model:learner-group',
    'model:learning-material-status',
    'model:learning-material-user-role',
    'model:learning-material',
    'model:mesh-concept',
    'model:mesh-descriptor',
    'model:mesh-qualifier',
    'model:objective',
    'model:offering',
    'model:program-year',
    'model:program',
    'model:publish-event',
    'model:recurring-event',
    'model:report',
    'model:school',
    'model:session-description',
    'model:session-learning-material',
    'model:session-type',
    'model:session',
    'model:user-role',
    'model:user',
  ]
});

test('it exists', function(assert) {
  var model = this.subject();
  // var store = this.store();
  assert.ok(!!model);
});
