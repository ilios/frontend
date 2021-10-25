import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { triggerSuccess } from '../../helpers/ember-cli-clipboard';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

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
          userSearchType: 'ldap',
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
    await click('button.manage');
  });

  test('can refresh key', async function (assert) {
    assert.expect(2);
    const userModel = await this.owner.lookup('service:store').find('user', this.user.id);
    this.set('user', userModel);

    await render(
      hbs`<UserProfileIcs @isManaging={{true}} @user={{this.user}} @setIsManaging={{(noop)}} />`
    );
    await click('.refresh-key');

    const icsFeedKey = this.server.db.users.find(13).icsFeedKey;
    assert.notEqual(icsFeedKey, 'testkey', 'icsFeedKey is not the same');
    assert.equal(icsFeedKey.length, 64, 'icsFeedKey is a long string probably a hash');
  });

  test('clicking copy displays message', async function (assert) {
    assert.expect(4);
    const userModel = await this.owner.lookup('service:store').find('user', this.user.id);
    this.set('user', userModel);
    await render(hbs`<UserProfileIcs @user={{this.user}} />`);
    const button = 'button.copy-btn';
    const successMessage = '.yes';

    assert.dom(successMessage).doesNotExist();
    assert.dom(button).exists({ count: 1 });
    await triggerSuccess(this, '.copy-btn');
    assert.dom(successMessage).exists({ count: 1 });
    assert.dom(successMessage).hasText('Copied Successfully');
  });
});
