import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | Report', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');
  });

  test('it exists', async function (assert) {
    const model = this.store.createRecord('report');
    assert.ok(!!model);
    assert.deepEqual(await model.school, null);
  });
});
