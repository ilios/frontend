import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'frontend/tests/pages/components/user-status';
import { setupMSW } from 'frontend/tests/msw';
import UserStatus from 'frontend/components/user-status';

module('Integration | Component | user-status', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  test('user account is disabled', async function (assert) {
    const user = await this.server.create('user', { enabled: false });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    this.set('user', userModel);
    await render(<template><UserStatus @user={{this.user}} /></template>);
    assert.ok(component.accountIsDisabled);
    assert.strictEqual(component.title, 'disabled user account');
  });

  test('user account is enabled', async function (assert) {
    const user = await this.server.create('user');
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    this.set('user', userModel);
    await render(<template><UserStatus @user={{this.user}} /></template>);
    assert.notOk(component.accountIsDisabled);
  });
});
