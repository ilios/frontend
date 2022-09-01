import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'ilios/tests/pages/components/user-profile-bio';

module('Integration | Component | user profile bio', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
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
    const userModel = await this.owner.lookup('service:store').find('user', this.user.id);
    const schoolModel = await this.owner.lookup('service:store').find('school', this.school.id);
    const authenticationModel = await this.owner
      .lookup('service:store')
      .find('authentication', this.authentication.id);
    this.set('user', userModel);

    await render(hbs`<UserProfileBio @user={{this.user}} />`);

    assert.strictEqual(component.school, `Primary School: ${schoolModel.title}`);
    assert.strictEqual(component.firstName.text, `First Name: ${userModel.firstName}`);
    assert.strictEqual(component.middleName.text, `Middle Name: ${userModel.middleName}`);
    assert.strictEqual(component.lastName.text, `Last Name: ${userModel.lastName}`);
    assert.strictEqual(component.campusId.text, `Campus ID: ${userModel.campusId}`);
    assert.strictEqual(component.otherId.text, `Other ID: ${userModel.otherId}`);
    assert.strictEqual(component.email.text, `Email: ${userModel.email}`);
    assert.strictEqual(component.displayName.text, `Display Name: ${userModel.displayName}`);
    assert.strictEqual(component.pronouns.text, `Pronouns: ${userModel.pronouns}`);
    assert.strictEqual(
      component.preferredEmail.text,
      `Preferred Email: ${userModel.preferredEmail}`
    );
    assert.strictEqual(component.phone.text, `Phone: ${userModel.phone}`);
    assert.strictEqual(component.username.text, `Username: ${authenticationModel.username}`);
    assert.notOk(component.password.isVisible);
    await a11yAudit();
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders for non ldap user search', async function (assert) {
    setupApplicationConfig('form', this);
    const userModel = await this.owner.lookup('service:store').find('user', this.user.id);
    const schoolModel = await this.owner.lookup('service:store').find('school', this.school.id);
    const authenticationModel = await this.owner
      .lookup('service:store')
      .find('authentication', this.authentication.id);
    this.set('user', userModel);

    await render(hbs`<UserProfileBio @user={{this.user}} />`);

    assert.strictEqual(component.school, `Primary School: ${schoolModel.title}`);
    assert.strictEqual(component.firstName.text, `First Name: ${userModel.firstName}`);
    assert.strictEqual(component.middleName.text, `Middle Name: ${userModel.middleName}`);
    assert.strictEqual(component.lastName.text, `Last Name: ${userModel.lastName}`);
    assert.strictEqual(component.campusId.text, `Campus ID: ${userModel.campusId}`);
    assert.strictEqual(component.otherId.text, `Other ID: ${userModel.otherId}`);
    assert.strictEqual(component.email.text, `Email: ${userModel.email}`);
    assert.strictEqual(component.displayName.text, `Display Name: ${userModel.displayName}`);
    assert.strictEqual(component.pronouns.text, `Pronouns: ${userModel.pronouns}`);
    assert.strictEqual(
      component.preferredEmail.text,
      `Preferred Email: ${userModel.preferredEmail}`
    );
    assert.strictEqual(component.phone.text, `Phone: ${userModel.phone}`);
    assert.strictEqual(component.username.text, `Username: ${authenticationModel.username}`);
    assert.strictEqual(component.password.text, 'Password: *********');
    await a11yAudit();
    assert.ok(true, 'no a11y errors found!');
  });

  test('clicking manage sends the action', async function (assert) {
    assert.expect(1);
    this.set('manage', (what) => {
      assert.ok(what, 'received boolean true value');
    });
    const userModel = await this.owner.lookup('service:store').find('user', this.user.id);
    this.set('user', userModel);

    await render(
      hbs`<UserProfileBio @user={{this.user}} @isManageable={{true}} @setIsManaging={{this.manage}} />`
    );

    await component.manage();
  });

  test('can edit user bio for ldap config', async function (assert) {
    setupApplicationConfig('ldap', this);
    this.server.create('pending-user-update', {
      user: this.user,
    });
    this.server.create('pending-user-update', {
      user: this.user,
    });
    const userModel = await this.owner.lookup('service:store').find('user', this.user.id);
    const updates = await userModel.pendingUserUpdates;

    const authenticationModel = await this.owner
      .lookup('service:store')
      .find('authentication', this.authentication.id);
    this.set('user', userModel);

    await render(
      hbs`<UserProfileBio @isManaging={{true}} @user={{this.user}} @setIsManaging={{(noop)}} />`
    );

    await a11yAudit();
    assert.ok(true, 'no a11y errors found!');
    assert.strictEqual(updates.length, 2);
    assert.strictEqual(component.firstName.value, 'Test Person');
    assert.strictEqual(component.middleName.value, 'Name');
    assert.strictEqual(component.lastName.value, 'Thing');
    assert.strictEqual(component.campusId.value, 'idC');
    assert.strictEqual(component.otherId.value, 'idO');
    assert.strictEqual(component.email.value, 'test@test.com');
    assert.strictEqual(component.displayName.value, 'Best Name');
    assert.strictEqual(component.pronouns.value, 'they/them/tay');
    assert.strictEqual(component.preferredEmail.value, 'test2@test.com');
    assert.strictEqual(component.phone.value, 'x1234');
    assert.strictEqual(component.username.value, 'test-username');
    assert.ok(component.username.isDisabled);
    assert.ok(component.syncWithDirectory.isPresent);
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
    assert.strictEqual(userModel.firstName, 'new first');
    assert.strictEqual(userModel.middleName, 'new middle');
    assert.strictEqual(userModel.lastName, 'new last');
    assert.strictEqual(userModel.campusId, 'new campusId');
    assert.strictEqual(userModel.otherId, 'new otherId');
    assert.strictEqual(userModel.email, 'e@e.com');
    assert.strictEqual(userModel.displayName, 'new best name');
    assert.strictEqual(userModel.pronouns, 'me/my/him');
    assert.strictEqual(userModel.preferredEmail, 'e2@e.com');
    assert.strictEqual(userModel.phone, '12345x');
    assert.strictEqual(updates.length, 0);
    assert.strictEqual(authenticationModel.username, 'test-username');
    assert.notOk(authenticationModel.password);
  });

  test('can edit non-ldap without setting a password', async function (assert) {
    setupApplicationConfig('form', this);
    const userModel = await this.owner.lookup('service:store').find('user', this.user.id);
    const authenticationModel = await this.owner
      .lookup('service:store')
      .find('authentication', this.authentication.id);
    this.set('user', userModel);

    await render(
      hbs`<UserProfileBio @isManaging={{true}} @user={{this.user}} @setIsManaging={{(noop)}} />`
    );

    await a11yAudit();
    assert.ok(true, 'no a11y errors found!');
    assert.strictEqual(component.firstName.value, 'Test Person');
    assert.strictEqual(component.middleName.value, 'Name');
    assert.strictEqual(component.lastName.value, 'Thing');
    assert.strictEqual(component.campusId.value, 'idC');
    assert.strictEqual(component.otherId.value, 'idO');
    assert.strictEqual(component.email.value, 'test@test.com');
    assert.strictEqual(component.displayName.value, 'Best Name');
    assert.strictEqual(component.pronouns.value, 'they/them/tay');
    assert.strictEqual(component.preferredEmail.value, 'test2@test.com');
    assert.strictEqual(component.phone.value, 'x1234');
    assert.strictEqual(component.username.value, 'test-username');
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
    assert.strictEqual(userModel.firstName, 'new first');
    assert.strictEqual(userModel.middleName, 'new middle');
    assert.strictEqual(userModel.lastName, 'new last');
    assert.strictEqual(userModel.campusId, 'new campusId');
    assert.strictEqual(userModel.otherId, 'new otherId');
    assert.strictEqual(userModel.email, 'e@e.com');
    assert.strictEqual(userModel.displayName, 'new best name');
    assert.strictEqual(userModel.pronouns, 'she/her');
    assert.strictEqual(userModel.preferredEmail, 'e2@e.com');
    assert.strictEqual(userModel.phone, '12345x');
    assert.strictEqual(authenticationModel.username, 'new-test-user');
    assert.notOk(authenticationModel.password);
  });

  test('can edit user bio for non-ldap config', async function (assert) {
    setupApplicationConfig('form', this);
    const userModel = await this.owner.lookup('service:store').find('user', this.user.id);
    const authenticationModel = await this.owner
      .lookup('service:store')
      .find('authentication', this.authentication.id);
    this.set('user', userModel);

    await render(
      hbs`<UserProfileBio @isManaging={{true}} @user={{this.user}} @setIsManaging={{(noop)}} />`
    );

    await a11yAudit();
    assert.ok(true, 'no a11y errors found!');
    assert.strictEqual(component.firstName.value, 'Test Person');
    assert.strictEqual(component.middleName.value, 'Name');
    assert.strictEqual(component.lastName.value, 'Thing');
    assert.strictEqual(component.campusId.value, 'idC');
    assert.strictEqual(component.otherId.value, 'idO');
    assert.strictEqual(component.email.value, 'test@test.com');
    assert.strictEqual(component.displayName.value, 'Best Name');
    assert.strictEqual(component.pronouns.value, 'they/them/tay');
    assert.strictEqual(component.preferredEmail.value, 'test2@test.com');
    assert.strictEqual(component.phone.value, 'x1234');
    assert.strictEqual(component.username.value, 'test-username');
    assert.notOk(component.syncWithDirectory.isPresent);
    await component.password.edit();
    assert.strictEqual(component.password.value, '');
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
    assert.strictEqual(userModel.firstName, 'new first');
    assert.strictEqual(userModel.middleName, 'new middle');
    assert.strictEqual(userModel.lastName, 'new last');
    assert.strictEqual(userModel.campusId, 'new campusId');
    assert.strictEqual(userModel.otherId, 'new otherId');
    assert.strictEqual(userModel.email, 'e@e.com');
    assert.strictEqual(userModel.displayName, 'new best name');
    assert.strictEqual(userModel.pronouns, '');
    assert.strictEqual(userModel.preferredEmail, 'e2@e.com');
    assert.strictEqual(userModel.phone, '12345x');
    assert.strictEqual(authenticationModel.username, 'new-test-user');
    assert.strictEqual(authenticationModel.password, 'new-password');
  });

  test('closing password box clears input', async function (assert) {
    setupApplicationConfig('form', this);
    const userModel = await this.owner.lookup('service:store').find('user', this.user.id);
    this.set('user', userModel);

    await render(
      hbs`<UserProfileBio @isManaging={{true}} @user={{this.user}} @setIsManaging={{(noop)}} />`
    );

    await component.password.edit();
    assert.strictEqual(component.password.value, '');
    await component.password.set('new-password');
    await component.password.cancel();
    await component.password.edit();
    assert.strictEqual(component.password.value, '');
  });

  test('password strength 0 display', async function (assert) {
    setupApplicationConfig('form', this);
    const userModel = await this.owner.lookup('service:store').find('user', this.user.id);
    this.set('user', userModel);

    await render(
      hbs`<UserProfileBio @isManaging={{true}} @user={{this.user}} @setIsManaging={{(noop)}} />`
    );

    await component.password.edit();
    await component.password.set('12345');
    assert.strictEqual(component.password.meter.value, 0);
    assert.strictEqual(component.password.strength.text, 'Try Harder');
    assert.ok(component.password.strength.hasZeroClass);
  });

  test('password strength 1 display', async function (assert) {
    setupApplicationConfig('form', this);
    const userModel = await this.owner.lookup('service:store').find('user', this.user.id);
    this.set('user', userModel);

    await render(
      hbs`<UserProfileBio @isManaging={{true}} @user={{this.user}} @setIsManaging={{(noop)}} />`
    );

    await component.password.edit();
    await component.password.set('12345ab');
    assert.strictEqual(component.password.meter.value, 1);
    assert.strictEqual(component.password.strength.text, 'Bad');
    assert.ok(component.password.strength.hasOneClass);
  });

  test('password strength 2 display', async function (assert) {
    setupApplicationConfig('form', this);
    const userModel = await this.owner.lookup('service:store').find('user', this.user.id);
    this.set('user', userModel);

    await render(
      hbs`<UserProfileBio @isManaging={{true}} @user={{this.user}} @setIsManaging={{(noop)}} />`
    );

    await component.password.edit();
    await component.password.set('12345ab13&');
    assert.strictEqual(component.password.meter.value, 2);
    assert.strictEqual(component.password.strength.text, 'Weak');
    assert.ok(component.password.strength.hasTwoClass);
  });

  test('password strength 3 display', async function (assert) {
    assert.expect(3);
    setupApplicationConfig('form', this);
    const userModel = await this.owner.lookup('service:store').find('user', this.user.id);
    this.set('user', userModel);

    await render(
      hbs`<UserProfileBio @isManaging={{true}} @user={{this.user}} @setIsManaging={{(noop)}} />`
    );

    await component.password.edit();
    await component.password.set('12345ab13&!!');
    assert.strictEqual(component.password.meter.value, 3);
    assert.strictEqual(component.password.strength.text, 'Good');
    assert.ok(component.password.strength.hasThreeClass);
  });

  test('password strength 4 display', async function (assert) {
    assert.expect(3);
    setupApplicationConfig('form', this);
    const userModel = await this.owner.lookup('service:store').find('user', this.user.id);
    this.set('user', userModel);

    await render(
      hbs`<UserProfileBio @isManaging={{true}} @user={{this.user}} @setIsManaging={{(noop)}} />`
    );

    await component.password.edit();
    await component.password.set('12345ab14&HHtB');
    assert.strictEqual(component.password.meter.value, 4);
    assert.strictEqual(component.password.strength.text, 'Strong');
    assert.ok(component.password.strength.hasFourClass);
  });

  test('sync user from directory', async function (assert) {
    assert.expect(31);
    setupApplicationConfig('ldap', this);
    const userModel = await this.owner.lookup('service:store').find('user', this.user.id);
    this.set('user', userModel);
    this.server.get(`application/directory/find/:id`, (scheme, { params }) => {
      assert.ok('id' in params);
      assert.strictEqual(parseInt(params.id, 10), 13);
      return {
        result: {
          firstName: 'new-first-name',
          lastName: 'new-last-name',
          displayName: 'new-best-name',
          pronouns: 'new-pronouns',
          email: 'new-email',
          phone: 'new-phone',
          campusId: 'new-campus-id',
          username: 'new-username',
        },
      };
    });

    await render(
      hbs`<UserProfileBio @isManaging={{true}} @user={{this.user}} @setIsManaging={{(noop)}} />`
    );

    assert.strictEqual(component.firstName.value, 'Test Person');
    assert.strictEqual(component.middleName.value, 'Name');
    assert.strictEqual(component.lastName.value, 'Thing');
    assert.strictEqual(component.campusId.value, 'idC');
    assert.strictEqual(component.otherId.value, 'idO');
    assert.strictEqual(component.email.value, 'test@test.com');
    assert.strictEqual(component.displayName.value, 'Best Name');
    assert.strictEqual(component.pronouns.value, 'they/them/tay');
    assert.strictEqual(component.preferredEmail.value, 'test2@test.com');
    assert.strictEqual(component.phone.value, 'x1234');
    assert.strictEqual(component.username.value, 'test-username');
    await component.syncWithDirectory.click();
    assert.strictEqual(component.firstName.value, 'new-first-name');
    assert.strictEqual(component.middleName.value, 'Name');
    assert.strictEqual(component.lastName.value, 'new-last-name');
    assert.strictEqual(component.campusId.value, 'new-campus-id');
    assert.strictEqual(component.otherId.value, 'idO');
    assert.strictEqual(component.email.value, 'new-email');
    assert.strictEqual(component.displayName.value, 'new-best-name');
    assert.strictEqual(component.pronouns.value, 'new-pronouns');
    assert.strictEqual(component.preferredEmail.value, 'test2@test.com');
    assert.strictEqual(component.phone.value, 'new-phone');
    assert.strictEqual(component.username.value, 'new-username');
    assert.ok(component.firstName.hasBeenSyncedFromDirectory);
    assert.ok(component.lastName.hasBeenSyncedFromDirectory);
    assert.ok(component.email.hasBeenSyncedFromDirectory);
    assert.ok(component.phone.hasBeenSyncedFromDirectory);
    assert.ok(component.displayName.hasBeenSyncedFromDirectory);
    assert.ok(component.campusId.hasBeenSyncedFromDirectory);
    assert.ok(component.username.hasBeenSyncedFromDirectory);
  });

  test('preferred email can be blanked', async function (assert) {
    setupApplicationConfig('form', this);
    const userModel = await this.owner.lookup('service:store').find('user', this.user.id);
    this.set('user', userModel);

    await render(
      hbs`<UserProfileBio @isManaging={{true}} @user={{this.user}} @setIsManaging={{(noop)}} />`
    );

    assert.strictEqual(component.preferredEmail.value, 'test2@test.com');
    await component.preferredEmail.set('');
    await component.save();
    assert.strictEqual(userModel.preferredEmail, '');
  });

  test('display name can be blanked', async function (assert) {
    setupApplicationConfig('form', this);
    const userModel = await this.owner.lookup('service:store').find('user', this.user.id);
    this.set('user', userModel);

    await render(
      hbs`<UserProfileBio @isManaging={{true}} @user={{this.user}} @setIsManaging={{(noop)}} />`
    );

    assert.strictEqual(component.displayName.value, 'Best Name');
    await component.displayName.set('');
    await component.save();
    assert.strictEqual(userModel.displayName, '');
  });

  test('pronouns can be blanked', async function (assert) {
    setupApplicationConfig('form', this);
    const userModel = await this.owner.lookup('service:store').find('user', this.user.id);
    this.set('user', userModel);

    await render(
      hbs`<UserProfileBio @isManaging={{true}} @user={{this.user}} @setIsManaging={{(noop)}} />`
    );

    assert.strictEqual(component.pronouns.value, 'they/them/tay');
    await component.pronouns.set('');
    await component.save();
    assert.strictEqual(userModel.pronouns, '');
  });
});
