/* global CLDR */
import {
  moduleForModel,
  test
} from 'ember-qunit';
import Ember from 'ember';
import Translations from 'ilios/translations/en';


moduleForModel('cohort', 'Cohort', {
  setup: function(){
    Ember.I18n.translations = Translations;
    CLDR.defaultLanguage='en';
  },
  // Specify the other units that are required for this test.
  needs: [
    'model:program-year',
    'model:course',
    'model:learner-group',
    'model:program',
    'model:user',
    'model:competency',
    'model:discipline',
    'model:objective',
    'model:school',
    'model:session',
    'model:instructor-group',
    'model:offering',
    'model:mesh-descriptor',
  ]
});

test('it exists', function() {
  var model = this.subject();
  // var store = this.store();
  ok(!!model);
});

test('list top level groups', function() {
  expect(3);
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
      equal(topLevelGroups.length, 2);
      equal(topLevelGroups.objectAt(0).get('title'), 'Top Group 1');
      equal(topLevelGroups.objectAt(1).get('title'), 'Top Group 2');
    });
  });

});

test('get display title', function() {
  expect(2);
  var model = this.subject();
  var store = model.store;

  Ember.run(function(){
    var program = store.createRecord('program', {duration: 4});
    var programYear = store.createRecord('program-year', {startYear:'2000', program: program, cohort: model});
    model.set('programYear', programYear);
  });

  Ember.run(function(){
    var displayTitle = model.get('displayTitle');
    equal(displayTitle, 'Class of 2004');
  });

  Ember.run(function(){
    model.set('title', 'testtitle');
    var displayTitle = model.get('displayTitle');
    equal(displayTitle, 'testtitle');
  });

});
