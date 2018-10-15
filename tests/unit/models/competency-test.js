import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | Competency', function(hooks) {
  setupTest(hooks);

  test('isDomain', function(assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('competency'));
    assert.ok(model.get('isDomain'));

    run(() => store.createRecord('competency', { id: 1, children: [model] }));
    assert.notOk(model.get('isDomain'));
  });

  test('domain', async function(assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('competency'));
    let domain = await model.get('domain');
    assert.equal(domain, model);
    const competency = run(() => store.createRecord('competency', { children: [model]}));
    domain = await model.get('domain');
    assert.equal(domain, competency);
  });

  test('treeChildren', async function(assert){
    assert.expect(7);
    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('competency'));
    let treeChildren = await model.get('treeChildren');
    assert.equal(treeChildren.length, 0);

    const child1 = run(() => store.createRecord('competency'));
    const child2 = run(() => store.createRecord('competency'));
    const child3 = run(() => store.createRecord('competency', { parent: child1 }));
    const child4 = run(() => store.createRecord('competency', { parent: child1 }));
    const child5 = run(() => store.createRecord('competency', { parent: child2 }));
    model.set('children', [ child1, child2 ]);
    treeChildren = await model.get('treeChildren');
    assert.equal(treeChildren.length, 5);
    assert.ok(treeChildren.includes(child1));
    assert.ok(treeChildren.includes(child2));
    assert.ok(treeChildren.includes(child3));
    assert.ok(treeChildren.includes(child4));
    assert.ok(treeChildren.includes(child5));
  });

  test('childCount', function(assert){
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('competency'));
    assert.equal(model.get('childCount'), 0);
    let child1 = run(() => store.createRecord('competency'));
    let child2 = run(() => store.createRecord('competency'));
    model.set('children', [ child1, child2 ]);
    assert.equal(model.get('childCount'), 2);
  });
});
