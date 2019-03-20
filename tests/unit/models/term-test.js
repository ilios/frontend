import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | term', function(hooks) {
  setupTest(hooks);


  test('isTopLevel', function(assert) {
    assert.expect(2);
    const model = this.owner.lookup('service:store').createRecord('term');
    const store = model.store;
    assert.ok(model.get('isTopLevel'));
    store.createRecord('term', { id: 1, children: [ model ] });
    assert.notOk(model.get('isTopLevel'));
  });

  test('hasChildren', function(assert) {
    assert.expect(2);
    const model = this.owner.lookup('service:store').createRecord('term');
    const store = model.store;
    assert.notOk(model.get('hasChildren'));
    const child = store.createRecord('term', { id: 1 });
    model.get('children').pushObject(child);
    assert.ok(model.get('hasChildren'));
  });

  test('allParents', async function(assert) {
    assert.expect(3);
    const model = this.owner.lookup('service:store').createRecord('term');
    const store = model.store;
    const parent = store.createRecord('term', { children: [ model ] });
    const parentsParent = store.createRecord('term', { children: [ parent ]});
    const allParents = await model.get('allParents');
    assert.equal(allParents.length, 2);
    assert.equal(allParents[0], parentsParent);
    assert.equal(allParents[1], parent);
  });

  test('termWithAllParents', async function(assert) {
    assert.expect(4);
    const model = this.owner.lookup('service:store').createRecord('term');
    const store = model.store;
    const parent = store.createRecord('term', { children: [ model ] });
    const parentsParent = store.createRecord('term', { children: [ parent ]});
    const allParents = await model.get('termWithAllParents');
    assert.equal(allParents.length, 3);
    assert.equal(allParents[0], parentsParent);
    assert.equal(allParents[1], parent);
    assert.equal(allParents[2], model);
  });

  test('allParentTitles', async function(assert) {
    assert.expect(3);
    const model = this.owner.lookup('service:store').createRecord('term');
    const store = model.store;
    const parent = store.createRecord('term', { children: [ model ], title: 'Parent' });
    store.createRecord('term', { children: [ parent ], title: 'Grandparent' });
    const titles = await model.get('allParentTitles');
    assert.equal(titles.length, 2);
    assert.equal(titles[0], 'Grandparent');
    assert.equal(titles[1], 'Parent');
  });

  test('titleWithParentTitles', async function(assert) {
    assert.expect(1);
    const model = this.owner.lookup('service:store').createRecord('term');
    model.set('title', 'bitte');
    const store = model.store;
    const parent = store.createRecord('term', { children: [ model ], title: 'bier' });
    store.createRecord('term', { children: [ parent ], title: 'ein' });
    const title = await model.get('titleWithParentTitles');
    assert.equal(title, 'ein > bier > bitte');
  });

  test('isActiveInTree - top level term', async function(assert) {
    assert.expect(2);
    let model = this.owner.lookup('service:store').createRecord('term');
    model.set('active', false);
    let isActive = await model.get('isActiveInTree');
    assert.notOk(isActive);

    model = this.owner.lookup('service:store').createRecord('term');
    model.set('active', true);
    isActive = await model.get('isActiveInTree');
    assert.ok(isActive);
  });

  test('isActiveInTree - nested term', async function(assert) {
    assert.expect(4);
    let model = this.owner.lookup('service:store').createRecord('term');
    model.set('active', true);
    let store = model.store;
    let parent = store.createRecord('term', { children: [ model ], active: true });
    store.createRecord('term', { children: [ parent ], active: true });
    let isActive = await model.get('isActiveInTree');
    assert.ok(isActive);

    model = this.owner.lookup('service:store').createRecord('term');
    model.set('active', false);
    store = model.store;
    parent = store.createRecord('term', { children: [ model ], active: true });
    store.createRecord('term', { children: [ parent ], active: true });
    isActive = await model.get('isActiveInTree');
    assert.notOk(isActive);

    model = this.owner.lookup('service:store').createRecord('term');
    model.set('active', true);
    store = model.store;
    parent = store.createRecord('term', { children: [ model ], active: false });
    store.createRecord('term', { children: [ parent ], active: true });
    isActive = await model.get('isActiveInTree');
    assert.notOk(isActive);

    model = this.owner.lookup('service:store').createRecord('term');
    model.set('active', true);
    store = model.store;
    parent = store.createRecord('term', { children: [ model ], active: true });
    store.createRecord('term', { children: [ parent ], active: false });
    isActive = await model.get('isActiveInTree');
    assert.notOk(isActive);
  });

  test('allDescendants', async function(assert) {
    assert.expect(4);
    const model = this.owner.lookup('service:store').createRecord('term');
    const store = model.store;
    const child1 = store.createRecord('term', { parent: model });
    const child2 = store.createRecord('term', { parent: model });
    const child3 = store.createRecord('term', { parent: child1 });
    const allDescendants = await model.get('allDescendants');
    assert.equal(allDescendants.length, 3);
    assert.equal(allDescendants[0], child1);
    assert.equal(allDescendants[1], child2);
    assert.equal(allDescendants[2], child3);
  });

  test('titleWithDescendantTitles', async function(assert) {
    assert.expect(1);
    const model = this.owner.lookup('service:store').createRecord('term', { title: 'top'});
    const store = model.store;
    const child1 = store.createRecord('term', { title: 'first', parent: model });
    store.createRecord('term', { title: 'second', parent: model });
    store.createRecord('term', { title: 'third', parent: child1 });
    const titleWithDescendantTitles = await model.get('titleWithDescendantTitles');
    assert.equal(titleWithDescendantTitles, 'first > second > third > top');
  });
});
