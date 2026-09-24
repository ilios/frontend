import { module, test } from 'qunit';
import { setupTest } from 'frontend/tests/helpers';

module('Unit | Model | UserRole', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');
  });

  test('it exists', function (assert) {
    const model = this.store.createRecord('user-role');
    assert.ok(!!model);
  });
});
