import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | term', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');
  });

  test('isTopLevel', function (assert) {
    const model = this.store.createRecord('term');
    assert.ok(model.get('isTopLevel'));
    this.store.createRecord('term', { id: '1', children: [model] });
    assert.notOk(model.get('isTopLevel'));
  });

  test('hasChildren', async function (assert) {
    const model = this.store.createRecord('term');
    assert.notOk(model.get('hasChildren'));
    this.store.createRecord('term', { parent: model });
    assert.ok(model.get('hasChildren'));
  });

  test('getAllParents', async function (assert) {
    const model = this.store.createRecord('term');
    const parent = this.store.createRecord('term', { children: [model] });
    const parentsParent = this.store.createRecord('term', { children: [parent] });
    let allParents = await model.getAllParents();
    assert.strictEqual(allParents.length, 2);
    assert.strictEqual(allParents[0], parentsParent);
    assert.strictEqual(allParents[1], parent);
  });

  test('getAllParentTitles', async function (assert) {
    const model = this.store.createRecord('term');
    const parent = this.store.createRecord('term', {
      children: [model],
      title: 'Parent',
    });
    this.store.createRecord('term', { children: [parent], title: 'Grandparent' });
    const titles = await model.getAllParentTitles();
    assert.strictEqual(titles.length, 2);
    assert.strictEqual(titles[0], 'Grandparent');
    assert.strictEqual(titles[1], 'Parent');
  });

  test('getTitleWithParentTitles', async function (assert) {
    const model = this.store.createRecord('term');
    model.set('title', 'bitte');
    const parent = this.store.createRecord('term', {
      children: [model],
      title: 'bier',
    });
    this.store.createRecord('term', { children: [parent], title: 'ein' });
    const title = await model.getTitleWithParentTitles();
    assert.strictEqual(title, 'ein > bier > bitte');
  });

  test('getAllDescendants', async function (assert) {
    const model = this.store.createRecord('term');
    const child1 = this.store.createRecord('term', { parent: model });
    const child2 = this.store.createRecord('term', { parent: model });
    const child3 = this.store.createRecord('term', { parent: child1 });
    const allDescendants = await model.getAllDescendants();
    assert.strictEqual(allDescendants.length, 3);
    assert.strictEqual(allDescendants[0], child1);
    assert.strictEqual(allDescendants[1], child2);
    assert.strictEqual(allDescendants[2], child3);
  });

  test('getTitleWithDescendantTitles', async function (assert) {
    const model = this.store.createRecord('term', { title: 'top' });
    const child1 = this.store.createRecord('term', {
      title: 'first',
      parent: model,
    });
    this.store.createRecord('term', { title: 'second', parent: model });
    this.store.createRecord('term', { title: 'third', parent: child1 });
    const titleWithDescendantTitles = await model.getTitleWithDescendantTitles();
    assert.strictEqual(titleWithDescendantTitles, 'first > second > third > top');
  });

  test('no associations', async function (assert) {
    assert.expect(9);
    const model = this.store.createRecord('term');
    assert.notOk(model.hasAssociations);
    assert.strictEqual(model.totalAssociations, 0);
    assert.strictEqual(model.associatedLengths.length, 6);
    model.associatedLengths.forEach((length) => {
      assert.strictEqual(length, 0);
    });
  });

  test('associations', async function (assert) {
    assert.expect(9);
    const programYear = this.store.createRecord('program-year');
    const course = this.store.createRecord('course');
    const session = this.store.createRecord('session');
    const programYearObjective = this.store.createRecord('program-year-objective');
    const courseObjective = this.store.createRecord('course-objective');
    const sessionObjective = this.store.createRecord('session-objective');
    const model = this.store.createRecord('term', {
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

  test('childCount', async function (assert) {
    const model = this.store.createRecord('term');
    assert.strictEqual(model.get('childCount'), 0);
    this.store.createRecord('term', { parent: model });
    assert.ok(model.get('childCount'), 1);
  });
});
