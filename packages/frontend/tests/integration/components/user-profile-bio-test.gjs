import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'frontend/tests/pages/components/user-profile-bio';
import UserProfileBio from 'frontend/components/user-profile-bio';

module('Integration | Component | user profile bio', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  const setupApplicationConfig = function (userSearchType, context) {
    const { apiVersion } = context.owner.resolveRegistration('config:environment');
    context.server.get('application/config', function () {
      return {
        config: {
          userSearchType: userSearchType,
          apiVersion,
        },
      };
    });
  };

  hooks.beforeEach(async function () {
    this.school = this.server.create('school', {
      title: 'Cool School',
    });
    this.user = this.server.create('user', {
      id: 13,
      fullName: 'Test Person Name Thing',
      firstName: 'Test Person',
      middleName: 'Name',
      lastName: 'Thing',
      displayName: 'Best Name',
      pronouns: 'they/them/tay',
      campusId: 'idC',
      otherId: 'idO',
      email: 'test@test.com',
      preferredEmail: 'test2@test.com',
      phone: 'x1234',
      school: this.school,
    });
    this.authentication = this.server.create('authentication', {
      username: 'test-username',
      user: this.user,
      password: null,
    });
  });

  test('it renders details', async function (assert) {
    setupApplicationConfig('ldap', this);
    const userModel = await this.owner.lookup('service:store').findRecord('user', this.user.id);
    this.set('user', userModel);

    await render(<template><UserProfileBio @user={{this.user}} @isManaging={{false}} /></template>);

    assert.ok(component.bioDetails.isPresent, 'details component loaded');
    assert.notOk(component.bioManager.isPresent, 'manager component not loaded');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders manager', async function (assert) {
    setupApplicationConfig('ldap', this);
    const userModel = await this.owner.lookup('service:store').findRecord('user', this.user.id);
    this.set('user', userModel);

    await render(<template><UserProfileBio @user={{this.user}} @isManaging={{true}} /></template>);

    assert.notOk(component.bioDetails.isPresent, 'details component not loaded');
    assert.ok(component.bioManager.isPresent, 'manager component loaded');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it switches modes', async function (assert) {
    setupApplicationConfig('ldap', this);
    const userModel = await this.owner.lookup('service:store').findRecord('user', this.user.id);
    this.set('user', userModel);
    this.set('isManaging', false);
    this.set('setIsManagingBio', () => {
      this.set('isManaging', !this.isManaging);
    });

    await render(
      <template>
        <UserProfileBio
          @user={{this.user}}
          @isManageable={{true}}
          @isManaging={{this.isManaging}}
          @setIsManaging={{this.setIsManagingBio}}
        />
      </template>,
    );

    assert.ok(component.bioDetails.isPresent, 'details component loaded');
    assert.notOk(component.bioManager.isPresent, 'manager component not loaded');
    await component.bioDetails.manage();
    assert.notOk(component.bioDetails.isPresent, 'details component not loaded');
    assert.ok(component.bioManager.isPresent, 'manager component loaded');
  });
});
