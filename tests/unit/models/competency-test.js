import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | Competency', function (hooks) {
  setupTest(hooks);

  test('isDomain', function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('competency');
    assert.ok(model.isDomain);

    store.createRecord('competency', { id: 1, children: [model] });
    assert.notOk(model.isDomain);
  });

  test('domain', async function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('competency');
    let domain = await model.domain;
    assert.equal(domain, model);
    const competency = store.createRecord('competency', { children: [model] });
    domain = await model.domain;
    assert.equal(domain, competency);
  });

  test('treeChildren', async function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('competency');
    let treeChildren = await model.treeChildren;
    assert.equal(treeChildren.length, 0);

    const child1 = store.createRecord('competency');
    const child2 = store.createRecord('competency');
    model.set('children', [child1, child2]);
    treeChildren = await model.treeChildren;
    assert.equal(treeChildren.length, 2);
    assert.ok(treeChildren.includes(child1));
    assert.ok(treeChildren.includes(child2));
  });

  test('childCount', function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('competency');
    assert.equal(model.childCount, 0);
    const child1 = store.createRecord('competency');
    const child2 = store.createRecord('competency');
    model.set('children', [child1, child2]);
    assert.equal(model.childCount, 2);
  });
});
