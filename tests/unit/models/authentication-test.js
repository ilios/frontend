import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | authentication', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');
  });

  test('it exists', function (assert) {
    const model = this.store.createRecord('authentication');
    assert.ok(!!model);
  });
});
