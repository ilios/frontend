import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'frontend/tests/pages/components/user-profile-bio-details';
import UserProfileBioDetails from 'frontend/components/user-profile-bio-details';

module('Integration | Component | user profile bio details', function (hooks) {
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

  test('it renders for ldap user search', async function (assert) {
    setupApplicationConfig('ldap', this);
    const userModel = await this.owner.lookup('service:store').findRecord('user', this.user.id);
    const schoolModel = await this.owner
      .lookup('service:store')
      .findRecord('school', this.school.id);
    const authenticationModel = await this.owner
      .lookup('service:store')
      .findRecord('authentication', this.authentication.id);
    this.set('user', userModel);

    await render(
      <template>
        <UserProfileBioDetails
          @user={{this.user}}
          @userAuthentication={{authenticationModel}}
          @canEditUsernameAndPassword={{false}}
        />
      </template>,
    );

    assert.strictEqual(
      component.school,
      `Primary School: ${schoolModel.title}`,
      'school title is correct',
    );
    assert.strictEqual(
      component.firstName.text,
      `First Name: ${userModel.firstName}`,
      'first name is correct',
    );
    assert.strictEqual(
      component.middleName.text,
      `Middle Name: ${userModel.middleName}`,
      'middle name is correct',
    );
    assert.strictEqual(
      component.lastName.text,
      `Last Name: ${userModel.lastName}`,
      'last name is correct',
    );
    assert.strictEqual(
      component.campusId.text,
      `Campus ID: ${userModel.campusId}`,
      'campus id is correct',
    );
    assert.strictEqual(
      component.otherId.text,
      `Other ID: ${userModel.otherId}`,
      'other id is correct',
    );
    assert.strictEqual(component.email.text, `Email: ${userModel.email}`, 'email is correct');
    assert.strictEqual(
      component.displayName.text,
      `Display Name: ${userModel.displayName}`,
      'display name is correct',
    );
    assert.strictEqual(
      component.pronouns.text,
      `Pronouns: ${userModel.pronouns}`,
      'pronouns is correct',
    );
    assert.strictEqual(
      component.preferredEmail.text,
      `Preferred Email: ${userModel.preferredEmail}`,
      'preferred email is correct',
    );
    assert.strictEqual(
      component.phone.text,
      `Phone: ${userModel.phone}`,
      'phone number is correct',
    );
    assert.strictEqual(
      component.username.text,
      `Username: ${authenticationModel.username}`,
      'username is correct',
    );
    assert.notOk(component.password.isVisible, 'password is visible');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders for non ldap user search', async function (assert) {
    setupApplicationConfig('form', this);
    const userModel = await this.owner.lookup('service:store').findRecord('user', this.user.id);
    const schoolModel = await this.owner
      .lookup('service:store')
      .findRecord('school', this.school.id);
    const authenticationModel = await this.owner
      .lookup('service:store')
      .findRecord('authentication', this.authentication.id);
    this.set('user', userModel);

    await render(
      <template>
        <UserProfileBioDetails
          @user={{this.user}}
          @userAuthentication={{authenticationModel}}
          @canEditUsernameAndPassword={{true}}
        />
      </template>,
    );

    assert.strictEqual(
      component.school,
      `Primary School: ${schoolModel.title}`,
      'school title is correct',
    );
    assert.strictEqual(
      component.firstName.text,
      `First Name: ${userModel.firstName}`,
      'first name is correct',
    );
    assert.strictEqual(
      component.middleName.text,
      `Middle Name: ${userModel.middleName}`,
      'middle name is correct',
    );
    assert.strictEqual(
      component.lastName.text,
      `Last Name: ${userModel.lastName}`,
      'last name is correct',
    );
    assert.strictEqual(
      component.campusId.text,
      `Campus ID: ${userModel.campusId}`,
      'campus id is correct',
    );
    assert.strictEqual(
      component.otherId.text,
      `Other ID: ${userModel.otherId}`,
      'other id is correct',
    );
    assert.strictEqual(component.email.text, `Email: ${userModel.email}`, 'email is correct');
    assert.strictEqual(
      component.displayName.text,
      `Display Name: ${userModel.displayName}`,
      'display name is correct',
    );
    assert.strictEqual(
      component.pronouns.text,
      `Pronouns: ${userModel.pronouns}`,
      'pronouns are correct',
    );
    assert.strictEqual(
      component.preferredEmail.text,
      `Preferred Email: ${userModel.preferredEmail}`,
      'preferred email is correct',
    );
    assert.strictEqual(
      component.phone.text,
      `Phone: ${userModel.phone}`,
      'phone number is correct',
    );
    assert.strictEqual(
      component.username.text,
      `Username: ${authenticationModel.username}`,
      'username is correct',
    );
    assert.strictEqual(component.password.text, 'Password: *********', 'password is asterisks');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('clicking manage sends the action', async function (assert) {
    this.set('manage', (what) => {
      assert.step('manage called');
      assert.ok(what, 'received boolean true value');
    });
    const userModel = await this.owner.lookup('service:store').findRecord('user', this.user.id);
    this.set('user', userModel);

    await render(
      <template>
        <UserProfileBioDetails
          @user={{this.user}}
          @isManageable={{true}}
          @setIsManaging={{this.manage}}
        />
      </template>,
    );

    await component.manage();
    assert.verifySteps(['manage called']);
  });
});
