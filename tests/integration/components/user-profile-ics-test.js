import { module, test, skip } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/user-profile-ics';

module('Integration | Component | user profile ics', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
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
    const userModel = await this.owner.lookup('service:store').find('user', this.user.id);
    this.set('user', userModel);
    this.set('click', (what) => {
      assert.ok(what, 'received boolean true value');
    });
    await render(
      hbs`<UserProfileIcs @user={{this.user}} @isManageable={{true}} @setIsManaging={{this.click}} />`
    );
    await component.manage();
  });

  test('can refresh key', async function (assert) {
    const userModel = await this.owner.lookup('service:store').find('user', this.user.id);
    this.set('user', userModel);
    await render(
      hbs`<UserProfileIcs @isManaging={{true}} @user={{this.user}} @setIsManaging={{(noop)}} />`
    );
    const currentKey = this.user.icsFeedKey;
    assert.strictEqual(userModel.icsFeedKey, currentKey, 'icsFeedKey is correct');
    await component.refresh();
    assert.notEqual(userModel.icsFeedKey, currentKey, 'icsFeedKey has been updated');
    assert.strictEqual(
      userModel.icsFeedKey.length,
      64,
      'icsFeedKey is a long string probably a hash'
    );
  });

  // test disabled b/c simulated clipboard access is blocked by browser.
  skip('clicking copy displays message', async function (assert) {
    const userModel = await this.owner.lookup('service:store').find('user', this.user.id);
    this.set('user', userModel);
    await render(hbs`<UserProfileIcs @user={{this.user}} />`);
    assert.notOk(component.key.copy.successMessage.isVisible);
    await component.key.copy.click();
    assert.ok(component.key.copy.successMessage.isVisible);
    assert.strictEqual(component.key.copy.successMessage.text, '');
  });
});
