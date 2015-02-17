import Ember from 'ember';
import {
  moduleForModel,
  test
} from 'ember-qunit';

moduleForModel('program-year', 'ProgramYear', {
  needs: [
    'model:aamc-method',
    'model:aamc-pcrs',
    'model:alert-change-type',
    'model:alert',
    'model:cohort',
    'model:competency',
    'model:course-learning-material',
    'model:course',
    'model:curriculum-inventory-academic-level',
    'model:curriculum-inventory-export',
    'model:curriculum-inventory-institution',
    'model:curriculum-inventory-report',
    'model:curriculum-inventory-sequence-block',
    'model:curriculum-inventory-sequence',
    'model:department',
    'model:discipline',
    'model:educational-year',
    'model:ilm-session-facet',
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

test('academic year string', function(assert) {
  var model = this.subject();
  Ember.run(function(){
    model.set('startYear', 2000);
    assert.equal(model.get('academicYear'), '2000 - 2001');
  });
});

test('classOf string', function(assert) {
  assert.expect(3);
  var model = this.subject();
  var store = model.store;
  Ember.run(function(){
    store.createRecord('program', {id:99, duration:1});
    store.find('program', 99).then(function(program){
      model.set('program', program);
      model.set('startYear', 2000);
      assert.equal(model.get('classOfYear'), '2001');
      program.set('duration', 5);
      assert.equal(model.get('classOfYear'), '2005');
      model.set('startYear', 2001);
      assert.equal(model.get('classOfYear'), '2006');
    });
  });
});
