import {
  moduleForModel,
  test
} from 'ember-qunit';
import Ember from 'ember';
import Translations from 'ilios/translations/en';


moduleForModel('cohort', 'Cohort', {
  setup: function(){
    this.get('i18n').translations = Translations;
    Ember.I18n.locale = 'en';
  },
  // Specify the other units that are required for this test.
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
    'model:program-year-steward',
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

test('list top level groups', function(assert) {
  assert.expect(3);
  var model = this.subject();
  var store = model.store;
  Ember.run(function(){

    var topGroup1 = store.createRecord('learner-group', {title:'Top Group 1', cohort: model});
    var topGroup2 = store.createRecord('learner-group', {title:'Top Group 2', cohort: model});

    var group1 = store.createRecord('learner-group', {title:'Group 1', cohort: model, parent: topGroup1});
    var group2 = store.createRecord('learner-group', {title:'Group 2', cohort: model, parent: topGroup1});
    var group3 = store.createRecord('learner-group', {title:'Group 3', cohort: model, parent: topGroup2});
    var group4 = store.createRecord('learner-group', {title:'Group 4', cohort: model, parent: topGroup2});

    model.get('learnerGroups').then(function(groups){
      groups.pushObject(group1);
      groups.pushObject(group2);
      groups.pushObject(group3);
      groups.pushObject(group4);
      groups.pushObject(topGroup1);
      groups.pushObject(topGroup2);
    });
  });

  Ember.run(function(){
    model.get('topLevelLearnerGroups').then(function(topLevelGroups){
      assert.equal(topLevelGroups.length, 2);
      assert.equal(topLevelGroups.objectAt(0).get('title'), 'Top Group 1');
      assert.equal(topLevelGroups.objectAt(1).get('title'), 'Top Group 2');
    });
  });

});

test('get display title', function(assert) {
  assert.expect(2);
  var model = this.subject();
  var store = model.store;

  Ember.run(function(){
    var program = store.createRecord('program', {duration: 4});
    var programYear = store.createRecord('program-year', {startYear:'2000', program: program, cohort: model});
    model.set('programYear', programYear);
  });

  Ember.run(function(){
    var displayTitle = model.get('displayTitle');
    assert.equal(displayTitle, 'Class of 2004');
  });

  Ember.run(function(){
    model.set('title', 'testtitle');
    var displayTitle = model.get('displayTitle');
    assert.equal(displayTitle, 'testtitle');
  });

});
