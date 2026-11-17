import { setupTest } from 'frontend/tests/helpers';
import { module, test } from 'qunit';

module('Unit | Model | user session material status', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');
  });

  test('it exists', function (assert) {
    let model = this.store.createRecord('user-session-material-status');
    assert.ok(model);
  });
});
