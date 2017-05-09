import {
  moduleForModel,
  test
} from 'ember-qunit';
import modelList from '../../helpers/model-list';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';

const { run } = Ember;

moduleForModel('objective', 'Unit | Model | Objective', {
  needs: modelList
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});

test('top parent with no parents should be self', function(assert) {
  assert.expect(2);

  let model = this.subject();
  return wait().then(()=>{
    model.get('topParents').then(topParents => {
      assert.ok(topParents.get('length') === 1);
      assert.equal(topParents.get('firstObject'), model);
    });
  });
});

test('corrent top parents with single parent tree', function(assert) {
  assert.expect(2);
  let store = this.store();
  let model = this.subject();
  run(function(){
    let parent1 = store.createRecord('objective', {
      children: [model]
    });
    let parent2 = store.createRecord('objective', {
      children: [parent1]
    });

    model.get('topParents').then(topParents => {
      assert.ok(topParents.get('length') === 1);
      assert.equal(topParents.get('firstObject'), parent2);
    });
  });

});

test('corrent top parents with multi parent tree', function(assert) {
  assert.expect(3);
  let store = this.store();
  let model = this.subject();
  run(function(){
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

    model.get('topParents').then(topParents => {
      assert.ok(topParents.get('length') === 2);
      assert.ok(topParents.includes(parent3));
      assert.ok(topParents.includes(parent4));
    });
  });

});
