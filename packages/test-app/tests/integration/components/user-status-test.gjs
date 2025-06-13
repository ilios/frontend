import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'ilios-common/page-objects/components/user-status';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import UserStatus from 'ilios-common/components/user-status';

module('Integration | Component | user-status', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('user account is disabled', async function (assert) {
    const user = this.server.create('user', { enabled: false });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    this.set('user', userModel);
    await render(<template><UserStatus @user={{this.user}} /></template>);
    assert.ok(component.accountIsDisabled);
    assert.strictEqual(component.title, 'disabled user account');
  });

  test('user account is enabled', async function (assert) {
    const user = this.server.create('user');
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    this.set('user', userModel);
    await render(<template><UserStatus @user={{this.user}} /></template>);
    assert.notOk(component.accountIsDisabled);
  });
});
