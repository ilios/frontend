import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | Competency', function (hooks) {
  setupTest(hooks);

  test('getDomain', async function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('competency');
    assert.strictEqual(await model.getDomain(), model);
    const competency = store.createRecord('competency', { children: [model] });
    assert.strictEqual(await model.getDomain(), competency);
  });

  test('childCount', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('competency');
    assert.strictEqual(model.childCount, 0);
    const child1 = store.createRecord('competency');
    const child2 = store.createRecord('competency');
    model.set('children', [child1, child2]);
    assert.strictEqual(model.childCount, 2);
  });
});
