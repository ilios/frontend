import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { waitForResource } from 'ilios-common';

module('Unit | Model | Competency', function (hooks) {
  setupTest(hooks);

  test('isDomain', function (assert) {
    assert.expect(4);
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('competency');
    assert.ok(model.isDomain);
    assert.notOk(model.isNotDomain);

    store.createRecord('competency', { id: 1, children: [model] });
    assert.notOk(model.isDomain);
    assert.ok(model.isNotDomain);
  });

  test('domain', async function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('competency');
    assert.strictEqual(await waitForResource(model, 'domain'), model);
    const competency = store.createRecord('competency', { children: [model] });
    assert.strictEqual(await waitForResource(model, 'domain'), competency);
  });

  test('getDomain', async function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('competency');
    assert.strictEqual(await model.getDomain(), model);
    const competency = store.createRecord('competency', { children: [model] });
    assert.strictEqual(await model.getDomain(), competency);
  });

  test('treeChildren', async function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('competency');
    let treeChildren = await model.treeChildren;
    assert.strictEqual(treeChildren.length, 0);

    const child1 = store.createRecord('competency');
    const child2 = store.createRecord('competency');
    model.set('children', [child1, child2]);
    treeChildren = await model.treeChildren;
    assert.strictEqual(treeChildren.length, 2);
    assert.ok(treeChildren.includes(child1));
    assert.ok(treeChildren.includes(child2));
  });

  test('childCount', function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('competency');
    assert.strictEqual(model.childCount, 0);
    const child1 = store.createRecord('competency');
    const child2 = store.createRecord('competency');
    model.set('children', [child1, child2]);
    assert.strictEqual(model.childCount, 2);
  });
});
