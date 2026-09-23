import { module, test } from 'qunit';
import { setupTest } from 'frontend/tests/helpers';
import { setupMSW } from 'frontend/tests/msw';

module('Unit | Model | School', function (hooks) {
  setupTest(hooks);
  setupMSW(hooks);

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');
  });

  test('it exists', async function (assert) {
    const model = this.store.createRecord('school');
    assert.ok(!!model);
  });
});
