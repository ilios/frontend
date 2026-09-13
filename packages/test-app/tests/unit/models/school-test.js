import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMSW } from 'ilios-common/msw';

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
