import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | term', function (hooks) {
  setupTest(hooks);

  test('isTopLevel', function (assert) {
    assert.expect(2);
    const model = this.owner.lookup('service:store').createRecord('term');
    const store = model.store;
    assert.ok(model.get('isTopLevel'));
    store.createRecord('term', { id: 1, children: [model] });
    assert.notOk(model.get('isTopLevel'));
  });

  test('hasChildren', function (assert) {
    assert.expect(2);
    const model = this.owner.lookup('service:store').createRecord('term');
    const store = model.store;
    assert.notOk(model.get('hasChildren'));
    const child = store.createRecord('term', { id: 1 });
    model.get('children').pushObject(child);
    assert.ok(model.get('hasChildren'));
  });

  test('allParents', async function (assert) {
    assert.expect(3);
    const model = this.owner.lookup('service:store').createRecord('term');
    const store = model.store;
    const parent = store.createRecord('term', { children: [model] });
    const parentsParent = store.createRecord('term', { children: [parent] });
    const allParents = await model.get('allParents');
    assert.strictEqual(allParents.length, 2);
    assert.strictEqual(allParents[0], parentsParent);
    assert.strictEqual(allParents[1], parent);
  });

  test('termWithAllParents', async function (assert) {
    assert.expect(4);
    const model = this.owner.lookup('service:store').createRecord('term');
    const store = model.store;
    const parent = store.createRecord('term', { children: [model] });
    const parentsParent = store.createRecord('term', { children: [parent] });
    const allParents = await model.get('termWithAllParents');
    assert.strictEqual(allParents.length, 3);
    assert.strictEqual(allParents[0], parentsParent);
    assert.strictEqual(allParents[1], parent);
    assert.strictEqual(allParents[2], model);
  });

  test('allParentTitles', async function (assert) {
    assert.expect(3);
    const model = this.owner.lookup('service:store').createRecord('term');
    const store = model.store;
    const parent = store.createRecord('term', {
      children: [model],
      title: 'Parent',
    });
    store.createRecord('term', { children: [parent], title: 'Grandparent' });
    const titles = await model.get('allParentTitles');
    assert.strictEqual(titles.length, 2);
    assert.strictEqual(titles[0], 'Grandparent');
    assert.strictEqual(titles[1], 'Parent');
  });

  test('titleWithParentTitles', async function (assert) {
    assert.expect(1);
    const model = this.owner.lookup('service:store').createRecord('term');
    model.set('title', 'bitte');
    const store = model.store;
    const parent = store.createRecord('term', {
      children: [model],
      title: 'bier',
    });
    store.createRecord('term', { children: [parent], title: 'ein' });
    const title = await model.get('titleWithParentTitles');
    assert.strictEqual(title, 'ein > bier > bitte');
  });

  test('isActiveInTree - top level term', async function (assert) {
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

  test('isActiveInTree - nested term', async function (assert) {
    assert.expect(4);
    let model = this.owner.lookup('service:store').createRecord('term');
    model.set('active', true);
    let store = model.store;
    let parent = store.createRecord('term', {
      children: [model],
      active: true,
    });
    store.createRecord('term', { children: [parent], active: true });
    let isActive = await model.get('isActiveInTree');
    assert.ok(isActive);

    model = this.owner.lookup('service:store').createRecord('term');
    model.set('active', false);
    store = model.store;
    parent = store.createRecord('term', { children: [model], active: true });
    store.createRecord('term', { children: [parent], active: true });
    isActive = await model.get('isActiveInTree');
    assert.notOk(isActive);

    model = this.owner.lookup('service:store').createRecord('term');
    model.set('active', true);
    store = model.store;
    parent = store.createRecord('term', { children: [model], active: false });
    store.createRecord('term', { children: [parent], active: true });
    isActive = await model.get('isActiveInTree');
    assert.notOk(isActive);

    model = this.owner.lookup('service:store').createRecord('term');
    model.set('active', true);
    store = model.store;
    parent = store.createRecord('term', { children: [model], active: true });
    store.createRecord('term', { children: [parent], active: false });
    isActive = await model.get('isActiveInTree');
    assert.notOk(isActive);
  });

  test('allDescendants', async function (assert) {
    assert.expect(4);
    const model = this.owner.lookup('service:store').createRecord('term');
    const store = model.store;
    const child1 = store.createRecord('term', { parent: model });
    const child2 = store.createRecord('term', { parent: model });
    const child3 = store.createRecord('term', { parent: child1 });
    const allDescendants = await model.get('allDescendants');
    assert.strictEqual(allDescendants.length, 3);
    assert.strictEqual(allDescendants[0], child1);
    assert.strictEqual(allDescendants[1], child2);
    assert.strictEqual(allDescendants[2], child3);
  });

  test('titleWithDescendantTitles', async function (assert) {
    assert.expect(1);
    const model = this.owner.lookup('service:store').createRecord('term', { title: 'top' });
    const store = model.store;
    const child1 = store.createRecord('term', {
      title: 'first',
      parent: model,
    });
    store.createRecord('term', { title: 'second', parent: model });
    store.createRecord('term', { title: 'third', parent: child1 });
    const titleWithDescendantTitles = await model.get('titleWithDescendantTitles');
    assert.strictEqual(titleWithDescendantTitles, 'first > second > third > top');
  });

  test('no associations', async function (assert) {
    assert.expect(9);
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('term');
    assert.notOk(model.hasAssociations);
    assert.strictEqual(model.totalAssociations, 0);
    assert.strictEqual(model.associatedLengths.length, 6);
    model.associatedLengths.forEach((length) => {
      assert.strictEqual(length, 0);
    });
  });

  test('associations', async function (assert) {
    assert.expect(9);
    const store = this.owner.lookup('service:store');
    const programYear = store.createRecord('programYear');
    const course = store.createRecord('course');
    const session = store.createRecord('session');
    const programYearObjective = store.createRecord('program-year-objective');
    const courseObjective = store.createRecord('course-objective');
    const sessionObjective = store.createRecord('session-objective');
    const model = store.createRecord('term', {
      programYears: [programYear],
      courses: [course],
      sessions: [session],
      programYearObjectives: [programYearObjective],
      courseObjectives: [courseObjective],
      sessionObjectives: [sessionObjective],
    });
    assert.ok(model.hasAssociations);
    assert.strictEqual(model.totalAssociations, 6);
    assert.strictEqual(model.associatedLengths.length, 6);
    model.associatedLengths.forEach((length) => {
      assert.strictEqual(length, 1);
    });
  });

  test('childCount', function (assert) {
    assert.expect(2);
    const model = this.owner.lookup('service:store').createRecord('term');
    const store = model.store;
    assert.strictEqual(model.get('childCount'), 0);
    const child = store.createRecord('term', { id: 1 });
    model.get('children').pushObject(child);
    assert.ok(model.get('childCount'), 1);
  });
});
