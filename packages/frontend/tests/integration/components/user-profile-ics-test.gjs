import { module, test, skip } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render, waitUntil } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/user-profile-ics';
import UserProfileIcs from 'frontend/components/user-profile-ics';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | user profile ics', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.user = this.server.create('user', {
      id: 13,
      icsFeedKey: 'testkey',
    });
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    this.server.get('application/config', function () {
      return {
        config: {
          apiVersion,
        },
      };
    });
  });

  test('clicking manage sends the action', async function (assert) {
    assert.expect(1);
    const userModel = await this.owner.lookup('service:store').findRecord('user', this.user.id);
    this.set('user', userModel);
    this.set('click', (what) => {
      assert.ok(what, 'received boolean true value');
    });
    await render(
      <template>
        <UserProfileIcs @user={{this.user}} @isManageable={{true}} @setIsManaging={{this.click}} />
      </template>,
    );
    await component.manage();
  });

  test('can refresh key', async function (assert) {
    const userModel = await this.owner.lookup('service:store').findRecord('user', this.user.id);
    this.set('user', userModel);
    await render(
      <template>
        <UserProfileIcs @isManaging={{true}} @user={{this.user}} @setIsManaging={{(noop)}} />
      </template>,
    );
    const currentKey = this.user.icsFeedKey;
    assert.strictEqual(userModel.icsFeedKey, currentKey, 'icsFeedKey is correct');
    await component.refresh();
    await waitUntil(() => {
      return userModel.icsFeedKey !== currentKey;
    });
    assert.notEqual(userModel.icsFeedKey, currentKey, 'icsFeedKey has been updated');
    assert.strictEqual(
      userModel.icsFeedKey.length,
      64,
      'icsFeedKey is a long string probably a hash',
    );
  });

  // test disabled b/c simulated clipboard access is blocked by browser.
  skip('clicking copy displays message', async function (assert) {
    const userModel = await this.owner.lookup('service:store').findRecord('user', this.user.id);
    this.set('user', userModel);
    await render(<template><UserProfileIcs @user={{this.user}} /></template>);
    assert.notOk(component.key.copy.successMessage.isVisible);
    await component.key.copy.click();
    assert.ok(component.key.copy.successMessage.isVisible);
    assert.strictEqual(component.key.copy.successMessage.text, '');
  });
});
