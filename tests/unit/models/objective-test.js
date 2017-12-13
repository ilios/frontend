import { run } from '@ember/runloop';
import {
  moduleForModel,
  test
} from 'ember-qunit';
import modelList from '../../helpers/model-list';
import { initialize } from '../../../initializers/replace-promise';

initialize();
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
  await run(async () => {
    let topParents = await model.get('topParents');
    assert.ok(topParents.length === 1);
    assert.equal(topParents.get('firstObject'), model);
  });
});

test('current top parents with single parent tree', async function(assert) {
  assert.expect(2);
  let store = this.store();
  let model = this.subject();
  await run(async () => {
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
  await run(async () => {
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
  await run(async () => {
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


test('removeParentWithProgramYears', async function(assert) {
  assert.expect(3);
  let store = this.store();
  let model = this.subject();
  await run( async () => {
    model.reopen({
      async save() {
        assert.ok(true, 'save() was called.');
      }
    });
    const programYear1 = store.createRecord('programYear');
    const parentObjective1 = store.createRecord('objective', { programYears: [ programYear1 ] });
    const programYear2 = store.createRecord('programYear');
    const parentObjective2 = store.createRecord('objective', { programYears: [ programYear2 ] });
    const programYear3 = store.createRecord('programYear');
    const parentObjective3 = store.createRecord('objective', { programYears: [ programYear3 ] });

    model.get('parents').pushObjects([parentObjective1, parentObjective2, parentObjective3 ]);

    await model.removeParentWithProgramYears([programYear1, programYear2]);
    const parents = await model.get('parents');
    assert.equal(parents.length, 1);
    assert.ok(parents.includes(parentObjective3));
  });
});
