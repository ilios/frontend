import {
  moduleForModel,
  test
} from 'ember-qunit';
import modelList from '../../helpers/model-list';
import Ember from 'ember';

const { run } = Ember;

moduleForModel('cohort', 'Unit | Model | Cohort', {
  needs :modelList
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});

test('list root level groups', async function(assert) {
  assert.expect(3);

  const model = this.subject();
  const store = this.store();

  run(async () => {
    const topGroup1 = store.createRecord('learner-group', {title:'Top Group 1', cohort: model});
    const topGroup2 = store.createRecord('learner-group', {title:'Top Group 2', cohort: model});

    const group1 = store.createRecord('learner-group', {title:'Group 1', cohort: model, parent: topGroup1});
    const group2 = store.createRecord('learner-group', {title:'Group 2', cohort: model, parent: topGroup1});
    const group3 = store.createRecord('learner-group', {title:'Group 3', cohort: model, parent: topGroup2});
    const group4 = store.createRecord('learner-group', {title:'Group 4', cohort: model, parent: topGroup2});

    model.get('learnerGroups').pushObjects([ group1, group2, group3, group4, topGroup1, topGroup2]);

    let topLevelGroups = await model.get('rootLevelLearnerGroups');

    assert.equal(topLevelGroups.length, 2);
    assert.equal(topLevelGroups.objectAt(0).get('title'), 'Top Group 1');
    assert.equal(topLevelGroups.objectAt(1).get('title'), 'Top Group 2');
  });
});
