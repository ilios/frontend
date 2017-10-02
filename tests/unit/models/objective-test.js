import {
  moduleForModel,
  test
} from 'ember-qunit';
import modelList from '../../helpers/model-list';
import Ember from 'ember';

const { run } = Ember;

moduleForModel('objective', 'Unit | Model | Objective', {
  needs: modelList
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});

test('top parent with no parents should be self', async function(assert) {
  assert.expect(2);

  let model = this.subject();
  run(async () => {
    let topParents = await model.get('topParents');
    assert.ok(topParents.length === 1);
    assert.equal(topParents.get('firstObject'), model);
  });
});

test('current top parents with single parent tree', async function(assert) {
  assert.expect(2);
  let store = this.store();
  let model = this.subject();
  run(async () => {
    let parent1 = store.createRecord('objective', {
      children: [model]
    });
    let parent2 = store.createRecord('objective', {
      children: [parent1]
    });

    let topParents = await model.get('topParents');
    assert.ok(topParents.length === 1);
    assert.equal(topParents.get('firstObject'), parent2);
  });
});

test('current top parents with multi parent tree', async function(assert) {
  assert.expect(3);
  let store = this.store();
  let model = this.subject();
  run(async () => {
    let parent1 = store.createRecord('objective', {
      children: [model]
    });
    let parent2 = store.createRecord('objective', {
      children: [model]
    });
    let parent3 = store.createRecord('objective', {
      children: [parent1]
    });
    let parent4 = store.createRecord('objective', {
      children: [parent2]
    });

    let topParents = await model.get('topParents');
    assert.ok(topParents.length === 2);
    assert.ok(topParents.includes(parent3));
    assert.ok(topParents.includes(parent4));
  });

});

test('tree competencies', async function(assert) {
  assert.expect(3);
  let store = this.store();
  let model = this.subject();
  run(async () => {
    let competency1 = store.createRecord('competency');
    let competency2 = store.createRecord('competency');

    let parent1 = store.createRecord('objective', {
      children: [model]
    });
    let parent2 = store.createRecord('objective', {
      children: [model]
    });
    let parent3 = store.createRecord('objective', {
      children: [model]
    });
    store.createRecord('objective', {
      children: [model]
    });
    store.createRecord('objective', {
      children: [parent1],
      competency: competency1
    });
    store.createRecord('objective', {
      children: [parent2],
      competency: competency1
    });
    store.createRecord('objective', {
      children: [parent2],
    });
    store.createRecord('objective', {
      children: [parent3],
      competency: competency2
    });
    store.createRecord('objective', {
      children: [parent3],
      competency: competency1
    });

    let treeCompetencies = await model.get('treeCompetencies');
    assert.equal(2, treeCompetencies.length);
    assert.ok(treeCompetencies.includes(competency1));
    assert.ok(treeCompetencies.includes(competency2));
  });
});
