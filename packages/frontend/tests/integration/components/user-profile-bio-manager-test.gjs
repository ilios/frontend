import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'frontend/tests/pages/components/user-profile-bio-manager';
import UserProfileBioManager from 'frontend/components/user-profile-bio-manager';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | user profile bio manager', function (hooks) {
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
        <UserProfileBioManager
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
    assert.strictEqual(component.firstName.value, userModel.firstName, 'first name is correct');
    assert.strictEqual(component.middleName.value, userModel.middleName, 'middle name is correct');
    assert.strictEqual(component.lastName.value, userModel.lastName, 'last name is correct');
    assert.strictEqual(component.campusId.value, userModel.campusId, 'campus id is correct');
    assert.strictEqual(component.otherId.value, userModel.otherId, 'other id is correct');
    assert.strictEqual(component.email.value, userModel.email, 'email is correct');
    assert.strictEqual(
      component.displayName.value,
      userModel.displayName,
      'display name is correct',
    );
    assert.strictEqual(component.pronouns.value, userModel.pronouns, 'pronouns are correct');
    assert.strictEqual(
      component.preferredEmail.value,
      userModel.preferredEmail,
      'preferred email is correct',
    );
    assert.strictEqual(component.phone.value, userModel.phone, 'phone number is correct');
    assert.strictEqual(
      component.username.value,
      authenticationModel.username,
      'username is correct',
    );
    assert.notOk(component.password.isVisible, 'password is not visible');
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
        <UserProfileBioManager
          @user={{this.user}}
          @userAuthentication={{authenticationModel}}
          @canEditUsernameAndPassword={{true}}
        />
      </template>,
    );

    assert.strictEqual(
      component.school,
      `Primary School: ${schoolModel.title}`,
      'school is correct',
    );
    assert.strictEqual(component.firstName.value, userModel.firstName, 'first name is correct');
    assert.strictEqual(component.middleName.value, userModel.middleName, 'middle name is correct');
    assert.strictEqual(component.lastName.value, userModel.lastName, 'last name is correct');
    assert.strictEqual(component.campusId.value, userModel.campusId, 'campus id is correct');
    assert.strictEqual(component.otherId.value, userModel.otherId, 'other id is correct');
    assert.strictEqual(component.email.value, userModel.email, 'email is correct');
    assert.strictEqual(
      component.displayName.value,
      userModel.displayName,
      'display name is correct',
    );
    assert.strictEqual(component.pronouns.value, userModel.pronouns, 'pronouns are correct');
    assert.strictEqual(
      component.preferredEmail.value,
      userModel.preferredEmail,
      'preferred email is correct',
    );
    assert.strictEqual(
      component.username.value,
      authenticationModel.username,
      'username is correct',
    );
    assert.strictEqual(
      component.password.text,
      'Password: Click here to reset password.',
      'password is obscured',
    );
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('can edit user bio for ldap config', async function (assert) {
    setupApplicationConfig('ldap', this);
    this.server.create('pending-user-update', {
      user: this.user,
    });
    this.server.create('pending-user-update', {
      user: this.user,
    });
    const userModel = await this.owner.lookup('service:store').findRecord('user', this.user.id);
    const updates = await userModel.pendingUserUpdates;

    const authenticationModel = await this.owner
      .lookup('service:store')
      .findRecord('authentication', this.authentication.id);
    this.set('user', userModel);

    await render(
      <template>
        <UserProfileBioManager
          @user={{this.user}}
          @userAuthentication={{authenticationModel}}
          @setIsManaging={{(noop)}}
          @canEditUsernameAndPassword={{false}}
        />
      </template>,
    );

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');

    assert.strictEqual(updates.length, 2, 'has correct number of pending updates');
    assert.strictEqual(component.firstName.value, 'Test Person', 'first name is correct');
    assert.strictEqual(component.middleName.value, 'Name', 'middle name is correct');
    assert.strictEqual(component.lastName.value, 'Thing', 'last name is correct');
    assert.strictEqual(component.campusId.value, 'idC', 'campus id is correct');
    assert.strictEqual(component.otherId.value, 'idO', 'other id is correct');
    assert.strictEqual(component.email.value, 'test@test.com', 'email is correct');
    assert.strictEqual(component.displayName.value, 'Best Name', 'display name is correct');
    assert.strictEqual(component.pronouns.value, 'they/them/tay', 'pronouns are correct');
    assert.strictEqual(
      component.preferredEmail.value,
      'test2@test.com',
      'preferred email is correct',
    );
    assert.strictEqual(component.phone.value, 'x1234', 'phone number is correct');
    assert.strictEqual(component.username.value, 'test-username', 'username is correct');
    assert.ok(component.username.isDisabled, 'username field is disabled');
    assert.ok(component.syncWithDirectory.isPresent, 'sync with directory button exists');

    await component.firstName.set('new first');
    await component.middleName.set('new middle');
    await component.lastName.set('new last');
    await component.campusId.set('new campusId');
    await component.otherId.set('new otherId');
    await component.email.set('e@e.com');
    await component.displayName.set('new best name');
    await component.pronouns.set('me/my/him');
    await component.preferredEmail.set('e2@e.com');
    await component.phone.set('12345x');
    await component.save();

    assert.strictEqual(userModel.firstName, 'new first', 'new first name is correct');
    assert.strictEqual(userModel.middleName, 'new middle', 'new middle name is correct');
    assert.strictEqual(userModel.lastName, 'new last', 'new last name is correct');
    assert.strictEqual(userModel.campusId, 'new campusId', 'new campus id is correct');
    assert.strictEqual(userModel.otherId, 'new otherId', 'new other id is correct');
    assert.strictEqual(userModel.email, 'e@e.com', 'new email is correct');
    assert.strictEqual(userModel.displayName, 'new best name', 'new display name is correct');
    assert.strictEqual(userModel.pronouns, 'me/my/him', 'new pronouns are correct');
    assert.strictEqual(userModel.preferredEmail, 'e2@e.com', 'new preferred email is correct');
    assert.strictEqual(userModel.phone, '12345x', 'new phone number is correct');
    assert.strictEqual(updates.length, 0, 'no more pending updates');
    assert.strictEqual(authenticationModel.username, 'test-username', 'username is unchanged');
    assert.notOk(authenticationModel.password, 'password not set');
  });

  test('can edit non-ldap without setting a password', async function (assert) {
    setupApplicationConfig('form', this);
    const userModel = await this.owner.lookup('service:store').findRecord('user', this.user.id);
    const authenticationModel = await this.owner
      .lookup('service:store')
      .findRecord('authentication', this.authentication.id);
    this.set('user', userModel);

    await render(
      <template>
        <UserProfileBioManager
          @user={{this.user}}
          @userAuthentication={{authenticationModel}}
          @setIsManaging={{(noop)}}
          @canEditUsernameAndPassword={{true}}
        />
      </template>,
    );

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
    assert.strictEqual(component.firstName.value, 'Test Person', 'first name is correct');
    assert.strictEqual(component.middleName.value, 'Name', 'middle name is correct');
    assert.strictEqual(component.lastName.value, 'Thing', 'last name is correct');
    assert.strictEqual(component.campusId.value, 'idC', 'campus id is correct');
    assert.strictEqual(component.otherId.value, 'idO', 'other id is correct');
    assert.strictEqual(component.email.value, 'test@test.com', 'email is correct');
    assert.strictEqual(component.displayName.value, 'Best Name', 'display name is correct');
    assert.strictEqual(component.pronouns.value, 'they/them/tay', 'pronouns are correct');
    assert.strictEqual(
      component.preferredEmail.value,
      'test2@test.com',
      'preferred email is correct',
    );
    assert.strictEqual(component.phone.value, 'x1234', 'phone number is correct');
    assert.strictEqual(component.username.value, 'test-username', 'username is correct');
    await component.firstName.set('new first');
    await component.middleName.set('new middle');
    await component.lastName.set('new last');
    await component.campusId.set('new campusId');
    await component.otherId.set('new otherId');
    await component.email.set('e@e.com');
    await component.displayName.set('new best name');
    await component.pronouns.set('she/her');
    await component.preferredEmail.set('e2@e.com');
    await component.phone.set('12345x');
    await component.username.set('new-test-user');
    await component.save();
    assert.strictEqual(userModel.firstName, 'new first', 'new first name is correct');
    assert.strictEqual(userModel.middleName, 'new middle', 'new middle name is correct');
    assert.strictEqual(userModel.lastName, 'new last', 'new last name is correct');
    assert.strictEqual(userModel.campusId, 'new campusId', 'new campus id is correct');
    assert.strictEqual(userModel.otherId, 'new otherId', 'new other id is correct');
    assert.strictEqual(userModel.email, 'e@e.com', 'new email is correct');
    assert.strictEqual(userModel.displayName, 'new best name', 'new display name is correct');
    assert.strictEqual(userModel.pronouns, 'she/her', 'new pronouns are correct');
    assert.strictEqual(userModel.preferredEmail, 'e2@e.com', 'new preferred email is correct');
    assert.strictEqual(userModel.phone, '12345x', 'new phone number is correct');
    assert.strictEqual(authenticationModel.username, 'new-test-user', 'new username is correct');
    assert.notOk(authenticationModel.password, 'password is unset');
  });

  test('can edit user bio for non-ldap config', async function (assert) {
    setupApplicationConfig('form', this);
    const userModel = await this.owner.lookup('service:store').findRecord('user', this.user.id);
    const authenticationModel = await this.owner
      .lookup('service:store')
      .findRecord('authentication', this.authentication.id);
    this.set('user', userModel);

    await render(
      <template>
        <UserProfileBioManager
          @user={{this.user}}
          @userAuthentication={{authenticationModel}}
          @setIsManaging={{(noop)}}
          @canEditUsernameAndPassword={{true}}
        />
      </template>,
    );

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
    assert.strictEqual(component.firstName.value, 'Test Person', 'first name is correct');
    assert.strictEqual(component.middleName.value, 'Name', 'middle name is correct');
    assert.strictEqual(component.lastName.value, 'Thing', 'last name is correct');
    assert.strictEqual(component.campusId.value, 'idC', 'campus id is correct');
    assert.strictEqual(component.otherId.value, 'idO', 'other id is correct');
    assert.strictEqual(component.email.value, 'test@test.com', 'email is correct');
    assert.strictEqual(component.displayName.value, 'Best Name', 'display name is correct');
    assert.strictEqual(component.pronouns.value, 'they/them/tay', 'pronouns are correct');
    assert.strictEqual(
      component.preferredEmail.value,
      'test2@test.com',
      'preferred email is correct',
    );
    assert.strictEqual(component.phone.value, 'x1234', 'phone number is correct');
    assert.strictEqual(component.username.value, 'test-username', 'username is correct');
    assert.notOk(component.syncWithDirectory.isPresent, 'directory sync button is not present');

    await component.password.edit();
    assert.strictEqual(component.password.value, '', 'password is blank');

    await component.firstName.set('new first');
    await component.middleName.set('new middle');
    await component.lastName.set('new last');
    await component.campusId.set('new campusId');
    await component.otherId.set('new otherId');
    await component.email.set('e@e.com');
    await component.displayName.set('new best name');
    await component.pronouns.set('');
    await component.preferredEmail.set('e2@e.com');
    await component.phone.set('12345x');
    await component.username.set('new-test-user');
    await component.password.set('new-password');
    await component.save();

    assert.strictEqual(userModel.firstName, 'new first', 'new first name is correct');
    assert.strictEqual(userModel.middleName, 'new middle', 'new middle name is correct');
    assert.strictEqual(userModel.lastName, 'new last', 'new last name is correct');
    assert.strictEqual(userModel.campusId, 'new campusId', 'new campus id is correct');
    assert.strictEqual(userModel.otherId, 'new otherId', 'new other id is correct');
    assert.strictEqual(userModel.email, 'e@e.com', 'new email is correct');
    assert.strictEqual(userModel.displayName, 'new best name', 'new display name is correct');
    assert.strictEqual(userModel.pronouns, '', 'new pronouns are correct');
    assert.strictEqual(userModel.preferredEmail, 'e2@e.com', 'new preferred email is correct');
    assert.strictEqual(userModel.phone, '12345x', 'new phone number is correct');
    assert.strictEqual(authenticationModel.username, 'new-test-user', 'new username is correct');
    assert.strictEqual(authenticationModel.password, 'new-password', 'new password is correct');
  });

  test('closing password box clears input', async function (assert) {
    setupApplicationConfig('form', this);
    const userModel = await this.owner.lookup('service:store').findRecord('user', this.user.id);
    this.set('user', userModel);

    await render(
      <template>
        <UserProfileBioManager
          @user={{this.user}}
          @setIsManaging={{(noop)}}
          @canEditUsernameAndPassword={{true}}
        />
      </template>,
    );

    await component.password.edit();
    assert.strictEqual(component.password.value, '');
    await component.password.set('new-password');
    await component.password.cancel();
    await component.password.edit();
    assert.strictEqual(component.password.value, '');
  });

  test('password validation', async function (assert) {
    setupApplicationConfig('form', this);
    const userModel = await this.owner.lookup('service:store').findRecord('user', this.user.id);
    this.set('user', userModel);

    await render(
      <template>
        <UserProfileBioManager
          @user={{this.user}}
          @setIsManaging={{(noop)}}
          @canEditUsernameAndPassword={{true}}
        />
      </template>,
    );

    await component.password.edit();
    assert.notOk(component.password.hasError);
    await component.password.set('');
    await component.save();
    assert.strictEqual(component.password.error, 'Password can not be empty');
    await component.password.set('a');
    assert.strictEqual(component.password.error, 'Password is too short (minimum is 5 characters)');
    await component.password.set('abcdef');
    await component.save();
    assert.notOk(component.password.hasError);
  });

  test('password strength 0 display', async function (assert) {
    setupApplicationConfig('form', this);
    const userModel = await this.owner.lookup('service:store').findRecord('user', this.user.id);
    this.set('user', userModel);

    await render(
      <template>
        <UserProfileBioManager
          @user={{this.user}}
          @setIsManaging={{(noop)}}
          @canEditUsernameAndPassword={{true}}
        />
      </template>,
    );

    await component.password.edit();
    await component.password.set('12345');
    assert.strictEqual(component.password.meter.value, 0);
    assert.strictEqual(component.password.strength.text, 'Try Harder');
    assert.ok(component.password.strength.hasZeroClass);
  });

  test('password strength 1 display', async function (assert) {
    setupApplicationConfig('form', this);
    const userModel = await this.owner.lookup('service:store').findRecord('user', this.user.id);
    this.set('user', userModel);

    await render(
      <template>
        <UserProfileBioManager
          @user={{this.user}}
          @setIsManaging={{(noop)}}
          @canEditUsernameAndPassword={{true}}
        />
      </template>,
    );

    await component.password.edit();
    await component.password.set('12345ab');
    assert.strictEqual(component.password.meter.value, 1);
    assert.strictEqual(component.password.strength.text, 'Bad');
    assert.ok(component.password.strength.hasOneClass);
  });

  test('password strength 2 display', async function (assert) {
    setupApplicationConfig('form', this);
    const userModel = await this.owner.lookup('service:store').findRecord('user', this.user.id);
    this.set('user', userModel);

    await render(
      <template>
        <UserProfileBioManager
          @user={{this.user}}
          @setIsManaging={{(noop)}}
          @canEditUsernameAndPassword={{true}}
        />
      </template>,
    );

    await component.password.edit();
    await component.password.set('12345ab13&');
    assert.strictEqual(component.password.meter.value, 2);
    assert.strictEqual(component.password.strength.text, 'Weak');
    assert.ok(component.password.strength.hasTwoClass);
  });

  test('password strength 3 display', async function (assert) {
    setupApplicationConfig('form', this);
    const userModel = await this.owner.lookup('service:store').findRecord('user', this.user.id);
    this.set('user', userModel);

    await render(
      <template>
        <UserProfileBioManager
          @user={{this.user}}
          @setIsManaging={{(noop)}}
          @canEditUsernameAndPassword={{true}}
        />
      </template>,
    );

    await component.password.edit();
    await component.password.set('12345ab13&!!');
    assert.strictEqual(component.password.meter.value, 3);
    assert.strictEqual(component.password.strength.text, 'Good');
    assert.ok(component.password.strength.hasThreeClass);
  });

  test('password strength 4 display', async function (assert) {
    setupApplicationConfig('form', this);
    const userModel = await this.owner.lookup('service:store').findRecord('user', this.user.id);
    this.set('user', userModel);

    await render(
      <template>
        <UserProfileBioManager
          @user={{this.user}}
          @setIsManaging={{(noop)}}
          @canEditUsernameAndPassword={{true}}
        />
      </template>,
    );

    await component.password.edit();
    await component.password.set('12345ab14&HHtB');
    assert.strictEqual(component.password.meter.value, 4);
    assert.strictEqual(component.password.strength.text, 'Strong');
    assert.ok(component.password.strength.hasFourClass);
  });

  test('sync user from directory', async function (assert) {
    setupApplicationConfig('ldap', this);
    const userModel = await this.owner.lookup('service:store').findRecord('user', this.user.id);
    this.set('user', userModel);
    this.user.username = this.authentication.username;
    this.server.get(`application/directory/find/:id`, (scheme, { params }) => {
      assert.step('API called');
      assert.ok('id' in params, 'id param is in directory sync');
      assert.strictEqual(parseInt(params.id, 10), 13, 'id is correct');
      return {
        result: {
          firstName: 'new-first-name',
          lastName: 'new-last-name',
          campusId: 'new-campus-id',
          email: 'new-email',
          displayName: 'new-best-name',
          pronouns: 'new-pronouns',
          phone: 'new-phone',
          username: 'new-username',
        },
      };
    });

    await render(
      <template>
        <UserProfileBioManager
          @user={{this.user}}
          @userAuthentication={{null}}
          @setIsManaging={{(noop)}}
          @canEditUsernameAndPassword={{false}}
        />
      </template>,
    );

    assert.strictEqual(component.firstName.value, 'Test Person', 'first name is correct');
    assert.strictEqual(component.middleName.value, 'Name', 'middle name is correct');
    assert.strictEqual(component.lastName.value, 'Thing', 'last name is correct');
    assert.strictEqual(component.campusId.value, 'idC', 'campus id name is correct');
    assert.strictEqual(component.otherId.value, 'idO', 'other id is correct');
    assert.strictEqual(component.email.value, 'test@test.com', 'email is correct');
    assert.strictEqual(component.displayName.value, 'Best Name', 'display name is correct');
    assert.strictEqual(component.pronouns.value, 'they/them/tay', 'pronouns are correct');
    assert.strictEqual(
      component.preferredEmail.value,
      'test2@test.com',
      'preferred email is correct',
    );
    assert.strictEqual(component.phone.value, 'x1234', 'phone number is correct');
    assert.strictEqual(component.username.value, 'test-username', 'username is correct');

    await component.syncWithDirectory.click();

    assert.strictEqual(component.firstName.value, 'new-first-name', 'new first name is correct');
    assert.strictEqual(component.middleName.value, 'Name', 'middle name is unchanged');
    assert.strictEqual(component.lastName.value, 'new-last-name', 'new last name is correct');
    assert.strictEqual(component.campusId.value, 'new-campus-id', 'campus id is unchanged');
    assert.strictEqual(component.otherId.value, 'idO', 'other id is unchanged');
    assert.strictEqual(component.email.value, 'new-email', 'new email is correct');
    assert.strictEqual(component.displayName.value, 'new-best-name', 'new display name is correct');
    assert.strictEqual(component.pronouns.value, 'new-pronouns', 'new pronouns are correct');
    assert.strictEqual(
      component.preferredEmail.value,
      'test2@test.com',
      'preferred email is unchanged',
    );
    assert.strictEqual(component.phone.value, 'new-phone', 'new phone number is correct');
    assert.strictEqual(component.username.value, 'new-username', 'new username is correct');

    assert.ok(component.firstName.hasBeenSyncedFromDirectory, 'first name synced from directory');
    assert.ok(component.lastName.hasBeenSyncedFromDirectory, 'last name synced from directory');
    assert.ok(component.campusId.hasBeenSyncedFromDirectory, 'campus id synced from directory');
    assert.ok(component.email.hasBeenSyncedFromDirectory, 'email synced from directory');
    assert.ok(
      component.displayName.hasBeenSyncedFromDirectory,
      'display name synced from directory',
    );
    assert.ok(component.pronouns.hasBeenSyncedFromDirectory, 'pronouns synced from directory');
    assert.ok(component.phone.hasBeenSyncedFromDirectory, 'phone number synced from directory');
    assert.ok(component.username.hasBeenSyncedFromDirectory, 'username synced from directory');
    assert.verifySteps(['API called']);
  });

  test('preferred email can be blanked', async function (assert) {
    setupApplicationConfig('form', this);
    const userModel = await this.owner.lookup('service:store').findRecord('user', this.user.id);
    this.set('user', userModel);
    this.user.username = this.authentication.username;

    await render(
      <template><UserProfileBioManager @user={{this.user}} @setIsManaging={{(noop)}} /></template>,
    );

    assert.strictEqual(
      component.preferredEmail.value,
      'test2@test.com',
      'preferred email has value',
    );
    await component.preferredEmail.set('');
    await component.save();
    assert.strictEqual(userModel.preferredEmail, '', 'preferred email is blank');
  });

  test('display name can be blanked', async function (assert) {
    setupApplicationConfig('form', this);
    const userModel = await this.owner.lookup('service:store').findRecord('user', this.user.id);
    this.set('user', userModel);
    this.user.username = this.authentication.username;

    await render(
      <template><UserProfileBioManager @user={{this.user}} @setIsManaging={{(noop)}} /></template>,
    );

    assert.strictEqual(component.displayName.value, 'Best Name', 'display name has value');
    await component.displayName.set('');
    await component.save();
    assert.strictEqual(userModel.displayName, '', 'display name is blank');
  });

  test('pronouns can be blanked', async function (assert) {
    setupApplicationConfig('form', this);
    const userModel = await this.owner.lookup('service:store').findRecord('user', this.user.id);
    this.set('user', userModel);
    this.user.username = this.authentication.username;

    await render(
      <template><UserProfileBioManager @user={{this.user}} @setIsManaging={{(noop)}} /></template>,
    );

    assert.strictEqual(component.pronouns.value, 'they/them/tay', 'pronouns have value');
    await component.pronouns.set('');
    await component.save();
    assert.strictEqual(userModel.pronouns, '', 'pronouns are blank');
  });

  test('validate username', async function (assert) {
    const user = this.server.create('user');
    this.server.create('authentication', { username: 'geflarknik', user });
    setupApplicationConfig('form', this);
    const userModel = await this.owner.lookup('service:store').findRecord('user', this.user.id);
    this.set('user', userModel);

    await render(
      <template>
        <UserProfileBioManager
          @user={{this.user}}
          @setIsManaging={{(noop)}}
          @canEditUsernameAndPassword={{true}}
        />
      </template>,
    );
    assert.notOk(component.username.hasError);
    await component.username.set('geflarknik');
    await component.username.submit();
    assert.strictEqual(
      component.username.error,
      'This username is already taken by another user account.',
    );
    await component.username.set('geflarknik2');
    await component.username.submit();
    assert.notOk(component.username.hasError);
  });
});
