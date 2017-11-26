import { moduleForModel,  test } from 'ember-qunit';
import modelList from '../../helpers/model-list';
import Ember from 'ember';

const { run } = Ember;


moduleForModel('competency', 'Unit | Model | Competency', {
  needs: modelList
});

test('isDomain', function(assert) {
  assert.expect(2);
  const model = this.subject();
  const store = this.store();
  run(() => {
    assert.ok(model.get('isDomain'));

    const competency = store.createRecord('competency', {id: 1});
    model.set('parent', competency);
    assert.notOk(model.get('isDomain'));
  });
});

test('domain', async function(assert) {
  assert.expect(2);
  const model = this.subject();
  const store = this.store();
  await run(async () => {
    const domain = await model.get('domain');
    assert.equal(domain, model);
  });

  await run(async () => {
    const competency = store.createRecord('competency', {id: 1});
    model.set('parent', competency);
    const domain = await model.get('domain');
    assert.equal(domain, competency);
  });
});

test('treeChildren', async function(assert){
  assert.expect(7);
  const model = this.subject();
  const store = this.store();
  await run(async () => {
    const treeChildren = await model.get('treeChildren');
    assert.equal(treeChildren.length, 0);
  });
  await run(async () => {
    const child1 = store.createRecord('competency');
    const child2 = store.createRecord('competency');
    const child3 = store.createRecord('competency', { parent: child1 });
    const child4 = store.createRecord('competency', { parent: child1 });
    const child5 = store.createRecord('competency', { parent: child2 });
    model.set('children', [ child1, child2 ]);
    const treeChildren = await model.get('treeChildren');
    assert.equal(treeChildren.length, 5);
    assert.ok(treeChildren.includes(child1));
    assert.ok(treeChildren.includes(child2));
    assert.ok(treeChildren.includes(child3));
    assert.ok(treeChildren.includes(child4));
    assert.ok(treeChildren.includes(child5));
  });
});

test('childCount', function(assert){
  assert.expect(2);
  const model = this.subject();
  const store = this.store();
  assert.equal(model.get('childCount'), 0);
  run(() => {
    let child1 = store.createRecord('competency');
    let child2 = store.createRecord('competency');
    model.set('children', [ child1, child2 ]);
    assert.equal(model.get('childCount'), 2);
  });
});
