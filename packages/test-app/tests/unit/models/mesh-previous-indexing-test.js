import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | mesh previous indexing ', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');
  });

  test('it exists', function (assert) {
    const model = this.store.createRecord('mesh-previous-indexing');
    assert.ok(!!model);
  });
});
