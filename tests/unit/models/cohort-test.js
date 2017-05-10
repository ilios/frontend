import {
  moduleForModel,
  test
} from 'ember-qunit';
import modelList from '../../helpers/model-list';
import Ember from 'ember';

moduleForModel('cohort', 'Unit | Model | Cohort', {
  needs :modelList
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});

test('list top level groups', function(assert) {
  assert.expect(3);
  let model = this.subject();

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
