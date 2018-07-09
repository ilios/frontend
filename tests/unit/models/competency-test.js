import { run } from '@ember/runloop';
import { module, skip, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { initialize } from '../../../initializers/replace-promise';


initialize();

module('Unit | Model | Competency', function(hooks) {
  setupTest(hooks);

  test('isDomain', function(assert) {
    assert.expect(2);
    const model = run(() => this.owner.lookup('service:store').createRecord('competency'));
    const store = this.owner.lookup('service:store');
    run(() => {
      assert.ok(model.get('isDomain'));

      const competency = store.createRecord('competency', {id: 1});
      model.set('parent', competency);
      assert.notOk(model.get('isDomain'));
    });
  });

  // skipping test further notice. Travis/CI is currently rejecting this test for reasons unknown. [ST 2018/07/09]
  skip('domain', async function(assert) {
    assert.expect(2);
    const model = run(() => this.owner.lookup('service:store').createRecord('competency'));
    const store = this.owner.lookup('service:store');
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
    const model = run(() => this.owner.lookup('service:store').createRecord('competency'));
    const store = this.owner.lookup('service:store');
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
    const model = run(() => this.owner.lookup('service:store').createRecord('competency'));
    const store = this.owner.lookup('service:store');
    assert.equal(model.get('childCount'), 0);
    run(() => {
      let child1 = store.createRecord('competency');
      let child2 = store.createRecord('competency');
      model.set('children', [ child1, child2 ]);
      assert.equal(model.get('childCount'), 2);
    });
  });
});
