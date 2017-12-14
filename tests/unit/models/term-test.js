import { run } from '@ember/runloop';
import { moduleForModel, test } from 'ember-qunit';
import modelList from '../../helpers/model-list';
import { initialize } from '../../../initializers/replace-promise';

initialize();
moduleForModel('term', 'Unit | Model | term', {
  // Specify the other units that are required for this test.
  needs: modelList
});


test('isTopLevel', function(assert) {
  assert.expect(2);
  const model = this.subject();
  const store = model.store;
  run(() => {
    assert.ok(model.get('isTopLevel'));
    store.createRecord('term', { id: 1, children: [ model ] });
    assert.notOk(model.get('isTopLevel'));
  });
});

test('hasChildren', function(assert) {
  assert.expect(2);
  const model = this.subject();
  const store = model.store;
  run(() => {
    assert.notOk(model.get('hasChildren'));
    const child = store.createRecord('term', { id: 1 });
    model.get('children').pushObject(child);
    assert.ok(model.get('hasChildren'));
  });
});

test('allParents', async function(assert) {
  assert.expect(3);
  run( async () => {
    const model = this.subject();
    const store = model.store;
    const parent = store.createRecord('term', { children: [ model ] });
    const parentsParent = store.createRecord('term', { children: [ parent ]});
    const allParents = await model.get('allParents');
    assert.equal(allParents.length, 2);
    assert.equal(allParents[0], parentsParent);
    assert.equal(allParents[1], parent);
  });
});

test('termWithAllParents', async function(assert) {
  assert.expect(4);
  run( async () => {
    const model = this.subject();
    const store = model.store;
    const parent = store.createRecord('term', { children: [ model ] });
    const parentsParent = store.createRecord('term', { children: [ parent ]});
    const allParents = await model.get('termWithAllParents');
    assert.equal(allParents.length, 3);
    assert.equal(allParents[0], parentsParent);
    assert.equal(allParents[1], parent);
    assert.equal(allParents[2], model);
  });
});

test('allParentTitles', async function(assert) {
  assert.expect(3);
  run( async () => {
    const model = this.subject();
    const store = model.store;
    const parent = store.createRecord('term', { children: [ model ], title: 'Parent' });
    store.createRecord('term', { children: [ parent ], title: 'Grandparent' });
    const titles = await model.get('allParentTitles');
    assert.equal(titles.length, 2);
    assert.equal(titles[0], 'Grandparent');
    assert.equal(titles[1], 'Parent');
  });
});

test('titleWithParentTitles', async function(assert) {
  assert.expect(1);
  run( async () => {
    const model = this.subject();
    model.set('title', 'bitte');
    const store = model.store;
    const parent = store.createRecord('term', { children: [ model ], title: 'bier' });
    store.createRecord('term', { children: [ parent ], title: 'ein' });
    const title = await model.get('titleWithParentTitles');
    assert.equal(title, 'ein > bier > bitte');
  });
});
