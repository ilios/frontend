import { resolve } from 'rsvp';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  click,
  fillIn
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

let user;
let authentication;
let school;

module('Integration | Component | user profile bio', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    authentication = EmberObject.create({
      username: 'test-username',
      user: 13,
      password: null
    });
    school = EmberObject.create({
      id: 1,
      title: 'Cool School',
    });
    user = EmberObject.create({
      id: 13,
      fullName: 'Test Person Name Thing',
      firstName: 'Test Person',
      middleName: 'Name',
      lastName: 'Thing',
      campusId: 'idC',
      otherId: 'idO',
      email: 'test@test.com',
      phone: 'x1234',
      roles: resolve([]),
      cohorts: resolve([]),
      primaryCohort: resolve(null),
      authentication: resolve(authentication),
      school: resolve(school),
      pendingUserUpdates: []
    });
  });


  test('it renders for ldap user search', async function(assert) {
    const iliosConfigMock = Service.extend({
      userSearchType: resolve('ldap')
    });
    this.owner.register('service:iliosConfig', iliosConfigMock);
    this.set('user', user);
    await render(hbs`{{user-profile-bio user=user}}`);
    const primarySchool = '.primary-school';
    const fields = '.item';
    const firstName = `${fields}:nth-of-type(1) span`;
    const middleName = `${fields}:nth-of-type(2) span`;
    const lastName = `${fields}:nth-of-type(3) span`;
    const campusId = `${fields}:nth-of-type(4) span`;
    const otherId = `${fields}:nth-of-type(5) span`;
    const email = `${fields}:nth-of-type(6) span`;
    const phone = `${fields}:nth-of-type(7) span`;
    const username = `${fields}:nth-of-type(8) span`;

    assert.dom(primarySchool).hasText('Primary School: ' + school.title, 'primary school is correct');
    assert.dom(fields).exists({ count: 8 });
    assert.dom(firstName).hasText('Test Person', 'first name is displayed');
    assert.dom(middleName).hasText('Name', 'middle name is displayed');
    assert.dom(lastName).hasText('Thing', 'last name is displayed');
    assert.dom(campusId).hasText('idC', 'campus Id is displayed');
    assert.dom(otherId).hasText('idO', 'other id is displayed');
    assert.dom(email).hasText('test@test.com', 'email is displayed');
    assert.dom(phone).hasText('x1234', 'phone is displayed');
    assert.dom(username).hasText('test-username', 'username is displayed');
  });

  test('it renders for non ldap user search', async function(assert) {
    const iliosConfigMock = Service.extend({
      userSearchType: resolve('local')
    });
    this.owner.register('service:iliosConfig', iliosConfigMock);
    this.set('user', user);
    await render(hbs`{{user-profile-bio user=user}}`);

    const fields = '.item';
    const firstName = `${fields}:nth-of-type(1) span`;
    const middleName = `${fields}:nth-of-type(2) span`;
    const lastName = `${fields}:nth-of-type(3) span`;
    const campusId = `${fields}:nth-of-type(4) span`;
    const otherId = `${fields}:nth-of-type(5) span`;
    const email = `${fields}:nth-of-type(6) span`;
    const phone = `${fields}:nth-of-type(7) span`;
    const username = `${fields}:nth-of-type(8) span`;
    const password = `${fields}:nth-of-type(9) span`;

    assert.dom(fields).exists({ count: 9 });
    assert.dom(firstName).hasText('Test Person', 'first name is displayed');
    assert.dom(middleName).hasText('Name', 'middle name is displayed');
    assert.dom(lastName).hasText('Thing', 'last name is displayed');
    assert.dom(campusId).hasText('idC', 'campus Id is displayed');
    assert.dom(otherId).hasText('idO', 'other id is displayed');
    assert.dom(email).hasText('test@test.com', 'email is displayed');
    assert.dom(phone).hasText('x1234', 'phone is displayed');
    assert.dom(username).hasText('test-username', 'username is displayed');
    assert.dom(password).hasText('*********', 'password placeholder is displayed');
  });

  test('clicking manage sends the action', async function(assert) {
    const iliosConfigMock = Service.extend({
      userSearchType: resolve('ldap')
    });
    this.owner.register('service:iliosConfig', iliosConfigMock);
    assert.expect(1);
    this.set('user', user);
    this.set('click', (what) =>{
      assert.ok(what, 'received boolean true value');
    });
    await render(hbs`{{user-profile-bio user=user isManageable=true setIsManaging=(action click)}}`);
    const manage = 'button.manage';
    await click(manage);
  });

  test('can edit user bio for ldap config', async function(assert) {
    assert.expect(21);
    const iliosConfigMock = Service.extend({
      userSearchType: resolve('ldap')
    });
    this.owner.register('service:iliosConfig', iliosConfigMock);
    const pendingUpdate1 = EmberObject.create({
      destroyRecord() {
        assert.ok(true, 'pending updates are removed');
        return resolve();
      }
    });
    const pendingUpdate2 = EmberObject.create({
      destroyRecord() {
        assert.ok(true, 'pending updates are removed');
        return resolve();
      }
    });
    user.get('pendingUserUpdates').pushObject(pendingUpdate1);
    user.get('pendingUserUpdates').pushObject(pendingUpdate2);
    this.set('user', user);
    this.set('nothing', parseInt);

    user.set('save', ()=> {
      assert.equal(user.get('firstName'), 'new first', 'first name is saved');
      assert.equal(user.get('middleName'), 'new middle', 'middel is saved');
      assert.equal(user.get('lastName'), 'new last', 'last is saved');
      assert.equal(user.get('campusId'), 'new campusId', 'campusId is saved');
      assert.equal(user.get('otherId'), 'new otherId', 'otherId is saved');
      assert.equal(user.get('email'), 'e@e.com', 'email is saved');
      assert.equal(user.get('phone'), '12345x', 'phone is saved');

      return resolve(user);
    });

    authentication.set('save', () => {
      assert.equal(authentication.get('username'), 'test-username', 'username is not changed');
      assert.equal(authentication.get('password'), undefined, 'password is saved');
    });

    await render(hbs`{{user-profile-bio isManaging=true user=user setIsManaging=(action nothing)}}`);
    const inputs = 'input';
    const firstName = `[data-test-first-name-input]`;
    const middleName = `[data-test-middle-name-input]`;
    const lastName = `[data-test-last-name-input]`;
    const campusId = `[data-test-campus-id-input]`;
    const otherId = `[data-test-other-id-input]`;
    const email = `[data-test-email-input]`;
    const phone = `[data-test-phone-input]`;
    const username = `[data-test-username-input]`;

    assert.dom(inputs).exists({ count: 8 }, 'correct number of inputs');
    assert.dom(firstName).hasValue('Test Person', 'firstname is set');
    assert.dom(middleName).hasValue('Name', 'middlename is set');
    assert.dom(lastName).hasValue('Thing', 'lastname is set');
    assert.dom(campusId).hasValue('idC', 'campuId is set');
    assert.dom(otherId).hasValue('idO', 'otherId is set');
    assert.dom(email).hasValue('test@test.com', 'email is set');
    assert.dom(phone).hasValue('x1234', 'phone is set');
    assert.dom(username).hasValue('test-username', 'username is set');
    assert.dom(username).isDisabled('username is disabled');
    await fillIn(firstName, 'new first');
    await fillIn(middleName, 'new middle');
    await fillIn(lastName, 'new last');
    await fillIn(campusId, 'new campusId');
    await fillIn(otherId, 'new otherId');
    await fillIn(email, 'e@e.com');
    await fillIn(phone, '12345x');

    await click('.bigadd');
  });

  test('can edit non-ldap without setting a password', async function(assert) {
    assert.expect(19);
    const iliosConfigMock = Service.extend({
      userSearchType: resolve('local')
    });
    this.owner.register('service:iliosConfig', iliosConfigMock);
    authentication.set('save', () => {
      assert.equal(authentication.get('username'), 'new-test-user', 'username is saved');
      assert.equal(authentication.get('password'), undefined, 'password is saved');
    });
    this.set('user', user);
    this.set('nothing', parseInt);

    user.set('save', ()=> {
      assert.equal(user.get('firstName'), 'new first', 'first name is saved');
      assert.equal(user.get('middleName'), 'new middle', 'middel is saved');
      assert.equal(user.get('lastName'), 'new last', 'last is saved');
      assert.equal(user.get('campusId'), 'new campusId', 'campusId is saved');
      assert.equal(user.get('otherId'), 'new otherId', 'otherId is saved');
      assert.equal(user.get('email'), 'e@e.com', 'email is saved');
      assert.equal(user.get('phone'), '12345x', 'phone is saved');

      return resolve(user);
    });

    await render(hbs`{{user-profile-bio isManaging=true user=user setIsManaging=(action nothing)}}`);
    const inputs = 'input';
    const firstName = `[data-test-first-name-input]`;
    const middleName = `[data-test-middle-name-input]`;
    const lastName = `[data-test-last-name-input]`;
    const campusId = `[data-test-campus-id-input]`;
    const otherId = `[data-test-other-id-input]`;
    const email = `[data-test-email-input]`;
    const phone = `[data-test-phone-input]`;
    const username = `[data-test-username-input]`;
    const activatePasswordField = '.activate-password-field';

    assert.dom(inputs).exists({ count: 8 }, 'correct number of inputs');
    assert.dom(firstName).hasValue('Test Person', 'firstname is set');
    assert.dom(middleName).hasValue('Name', 'middlename is set');
    assert.dom(lastName).hasValue('Thing', 'lastname is set');
    assert.dom(campusId).hasValue('idC', 'campuId is set');
    assert.dom(otherId).hasValue('idO', 'otherId is set');
    assert.dom(email).hasValue('test@test.com', 'email is set');
    assert.dom(phone).hasValue('x1234', 'phone is set');
    assert.dom(username).hasValue('test-username', 'username is set');
    assert.dom(activatePasswordField).hasText('Click here to reset password.');
    await fillIn(firstName, 'new first');
    await fillIn(middleName, 'new middle');
    await fillIn(lastName, 'new last');
    await fillIn(campusId, 'new campusId');
    await fillIn(otherId, 'new otherId');
    await fillIn(email, 'e@e.com');
    await fillIn(phone, '12345x');
    await fillIn(username, 'new-test-user');
    await click('.bigadd');
  });

  test('can edit user bio for non-ldap config', async function(assert) {
    assert.expect(20);
    const iliosConfigMock = Service.extend({
      userSearchType: resolve('local')
    });
    this.owner.register('service:iliosConfig', iliosConfigMock);
    authentication.set('save', () => {
      assert.equal(authentication.get('username'), 'new-test-user', 'username is saved');
      assert.equal(authentication.get('password'), 'new-password', 'password is saved');
    });
    this.set('user', user);
    this.set('nothing', parseInt);

    user.set('save', ()=> {
      assert.equal(user.get('firstName'), 'new first', 'first name is saved');
      assert.equal(user.get('middleName'), 'new middle', 'middel is saved');
      assert.equal(user.get('lastName'), 'new last', 'last is saved');
      assert.equal(user.get('campusId'), 'new campusId', 'campusId is saved');
      assert.equal(user.get('otherId'), 'new otherId', 'otherId is saved');
      assert.equal(user.get('email'), 'e@e.com', 'email is saved');
      assert.equal(user.get('phone'), '12345x', 'phone is saved');

      return resolve(user);
    });

    await render(hbs`{{user-profile-bio isManaging=true user=user setIsManaging=(action nothing)}}`);
    const inputs = 'input';
    const firstName = `[data-test-first-name-input]`;
    const middleName = `[data-test-middle-name-input]`;
    const lastName = `[data-test-last-name-input]`;
    const campusId = `[data-test-campus-id-input]`;
    const otherId = `[data-test-other-id-input]`;
    const email = `[data-test-email-input]`;
    const phone = `[data-test-phone-input]`;
    const username = `[data-test-username-input]`;
    const password = `[data-test-password-input]`;
    const activatePasswordField = '.activate-password-field';

    assert.dom(inputs).exists({ count: 8 }, 'correct number of inputs');
    assert.dom(firstName).hasValue('Test Person', 'firstname is set');
    assert.dom(middleName).hasValue('Name', 'middlename is set');
    assert.dom(lastName).hasValue('Thing', 'lastname is set');
    assert.dom(campusId).hasValue('idC', 'campuId is set');
    assert.dom(otherId).hasValue('idO', 'otherId is set');
    assert.dom(email).hasValue('test@test.com', 'email is set');
    assert.dom(phone).hasValue('x1234', 'phone is set');
    assert.dom(username).hasValue('test-username', 'username is set');
    await click(activatePasswordField);

    assert.dom(inputs).exists({ count: 9 }, 'password input has been added');
    assert.dom(password).hasValue('', 'password is set');
    await fillIn(firstName, 'new first');
    await fillIn(middleName, 'new middle');
    await fillIn(lastName, 'new last');
    await fillIn(campusId, 'new campusId');
    await fillIn(otherId, 'new otherId');
    await fillIn(email, 'e@e.com');
    await fillIn(phone, '12345x');
    await fillIn(username, 'new-test-user');
    await fillIn(password, 'new-password');
    await click('.bigadd');
  });

  let setupConfigAndAuth = function(context){
    const iliosConfigMock = Service.extend({
      userSearchType: resolve('local')
    });
    context.owner.register('service:iliosConfig', iliosConfigMock);
  };

  test('closing password box clears input', async function(assert) {
    assert.expect(4);
    setupConfigAndAuth(this);
    this.set('user', user);
    this.set('nothing', parseInt);

    await render(hbs`{{user-profile-bio isManaging=true user=user setIsManaging=(action nothing)}}`);
    const inputs = 'input';
    const password = `[data-test-password-input]`;
    const activatePasswordField = '.activate-password-field';
    const cancelPasswordField = '.cancel-password-field';

    assert.dom(inputs).exists({ count: 8 }, 'correct number of inputs');
    await click(activatePasswordField);

    assert.dom(inputs).exists({ count: 9 }, 'password input has been added');
    assert.dom(password).hasValue('', 'password is blank');
    await fillIn(password, 'new-password');
    await click(cancelPasswordField);
    await click(activatePasswordField);
    assert.dom(password).hasValue('', 'password is blank again');
  });

  test('password strength 0 display', async function(assert) {
    assert.expect(3);
    setupConfigAndAuth(this);
    this.set('user', user);
    this.set('nothing', parseInt);
    const passwordStrength = this.owner.lookup('service:passwordStrength');
    await passwordStrength.load();

    await render(hbs`{{user-profile-bio isManaging=true user=user setIsManaging=(action nothing)}}`);
    const passwordStrengthMeter = '[data-test-password-strength-meter]';
    const passwordStrengthText = '[data-test-password-strength-text]';
    const passwordInput = '[data-test-password-input]';
    const activatePasswordField = '.activate-password-field';
    await click(activatePasswordField);
    await fillIn(passwordInput, '12345');
    assert.dom(passwordStrengthMeter).hasValue(0, 'meter is intially at 0');
    assert.dom(passwordStrengthText).hasText('Try Harder', 'try harder is displayed for level 0 password');
    assert.dom(passwordStrengthText).hasClass('strength-0', 'correct strength is applied to the meter');
  });

  test('password strength 1 display', async function(assert) {
    assert.expect(3);
    setupConfigAndAuth(this);
    this.set('user', user);
    this.set('nothing', parseInt);
    const passwordStrength = this.owner.lookup('service:passwordStrength');
    await passwordStrength.load();

    await render(hbs`{{user-profile-bio isManaging=true user=user setIsManaging=(action nothing)}}`);
    const passwordStrengthMeter = '[data-test-password-strength-meter]';
    const passwordStrengthText = '[data-test-password-strength-text]';
    const passwordInput = '[data-test-password-input]';
    const activatePasswordField = '.activate-password-field';
    await click(activatePasswordField);
    await fillIn(passwordInput, '12345ab');
    assert.dom(passwordStrengthMeter).hasValue(1, 'meter is intially at 1');
    assert.dom(passwordStrengthText).hasText('Bad', 'bad is displayed for level 1 password');
    assert.dom(passwordStrengthText).hasClass('strength-1', 'correct strength is applied to the meter');

  });

  test('password strength 2 display', async function(assert) {
    assert.expect(3);
    setupConfigAndAuth(this);
    this.set('user', user);
    this.set('nothing', parseInt);
    const passwordStrength = this.owner.lookup('service:passwordStrength');
    await passwordStrength.load();

    await render(hbs`{{user-profile-bio isManaging=true user=user setIsManaging=(action nothing)}}`);
    const passwordStrengthMeter = '[data-test-password-strength-meter]';
    const passwordStrengthText = '[data-test-password-strength-text]';
    const passwordInput = '[data-test-password-input]';
    const activatePasswordField = '.activate-password-field';
    await click(activatePasswordField);
    await fillIn(passwordInput, '12345ab13&');
    assert.dom(passwordStrengthMeter).hasValue(2, 'meter is intially at 2');
    assert.dom(passwordStrengthText).hasText('Weak', 'weak is displayed for level 2 password');
    assert.dom(passwordStrengthText).hasClass('strength-2', 'correct strength is applied to the meter');

  });

  test('password strength 3 display', async function(assert) {
    assert.expect(3);
    setupConfigAndAuth(this);
    this.set('user', user);
    this.set('nothing', parseInt);
    const passwordStrength = this.owner.lookup('service:passwordStrength');
    await passwordStrength.load();

    await render(hbs`{{user-profile-bio isManaging=true user=user setIsManaging=(action nothing)}}`);
    const passwordStrengthMeter = '[data-test-password-strength-meter]';
    const passwordStrengthText = '[data-test-password-strength-text]';
    const passwordInput = '[data-test-password-input]';
    const activatePasswordField = '.activate-password-field';
    await click(activatePasswordField);
    await fillIn(passwordInput, '12345ab13&!!');
    assert.dom(passwordStrengthMeter).hasValue(3, 'meter is intially at 3');
    assert.dom(passwordStrengthText).hasText('Good', 'good is displayed for level 3 password');
    assert.dom(passwordStrengthText).hasClass('strength-3', 'correct strength is applied to the meter');

  });

  test('password strength 4 display', async function(assert) {
    assert.expect(3);
    setupConfigAndAuth(this);
    this.set('user', user);
    this.set('nothing', parseInt);
    const passwordStrength = this.owner.lookup('service:passwordStrength');
    await passwordStrength.load();

    await render(hbs`{{user-profile-bio isManaging=true user=user setIsManaging=(action nothing)}}`);
    const passwordStrengthMeter = '[data-test-password-strength-meter]';
    const passwordStrengthText = '[data-test-password-strength-text]';
    const passwordInput = '[data-test-password-input]';
    const activatePasswordField = '.activate-password-field';
    await click(activatePasswordField);
    await fillIn(passwordInput, '12345ab14&HHtB');
    assert.dom(passwordStrengthMeter).hasValue(4, 'meter is intially at 4');
    assert.dom(passwordStrengthText).hasText('Strong', 'strong is displayed for level 4 password');
    assert.dom(passwordStrengthText).hasClass('strength-4', 'correct strength is applied to the meter');
  });


  test('sync user from directory', async function(assert) {
    assert.expect(24);
    const iliosConfigMock = Service.extend({
      userSearchType: resolve('ldap')
    });
    this.owner.register('service:iliosConfig', iliosConfigMock);
    const ajaxMock = Service.extend({
      request(url){
        assert.equal(url, '/application/directory/find/13', 'ajax request url is correct');
        return resolve({result: {
          firstName: 'new-first-name',
          lastName: 'new-last-name',
          email: 'new-email',
          phone: 'new-phone',
          campusId: 'new-campus-id',
          username: 'new-username',
        }});
      }
    });
    this.owner.register('service:commonAjax', ajaxMock);
    this.set('user', user);
    this.set('nothing', parseInt);

    await render(hbs`{{user-profile-bio isManaging=true user=user setIsManaging=(action nothing)}}`);
    const items = '.item';
    const firstName = `${items}:nth-of-type(1)`;
    const middleName = `${items}:nth-of-type(2)`;
    const lastName = `${items}:nth-of-type(3)`;
    const campusId = `${items}:nth-of-type(4)`;
    const otherId = `${items}:nth-of-type(5)`;
    const email = `${items}:nth-of-type(6)`;
    const phone = `${items}:nth-of-type(7)`;
    const username = `${items}:nth-of-type(8)`;

    const firstNameInput = `${firstName} input:nth-of-type(1)`;
    const middleNameInput = `${middleName} input:nth-of-type(1)`;
    const lastNameInput = `${lastName} input:nth-of-type(1)`;
    const campusIdInput = `${campusId} input:nth-of-type(1)`;
    const otherIdInput = `${otherId} input:nth-of-type(1)`;
    const emailInput = `${email} input:nth-of-type(1)`;
    const phoneInput = `${phone} input:nth-of-type(1)`;
    const usernameInput = `${username} input:nth-of-type(1)`;

    const syncBUtton = 'button.directory-sync';


    assert.dom(items).exists({ count: 8 }, 'correct number of inputs');
    assert.dom(firstNameInput).hasValue('Test Person', 'firstname is set');
    assert.dom(middleNameInput).hasValue('Name', 'middlename is set');
    assert.dom(lastNameInput).hasValue('Thing', 'lastname is set');
    assert.dom(campusIdInput).hasValue('idC', 'campuId is set');
    assert.dom(otherIdInput).hasValue('idO', 'otherId is set');
    assert.dom(emailInput).hasValue('test@test.com', 'email is set');
    assert.dom(phoneInput).hasValue('x1234', 'phone is set');
    assert.dom(usernameInput).hasValue('test-username', 'username is set');
    await click(syncBUtton);

    assert.dom(firstNameInput).hasValue('new-first-name', 'firstname is updated');
    assert.dom(middleNameInput).hasValue('Name', 'middlename is set');
    assert.dom(lastNameInput).hasValue('new-last-name', 'lastname is updated');
    assert.dom(campusIdInput).hasValue('new-campus-id', 'campuId is updated');
    assert.dom(otherIdInput).hasValue('idO', 'otherId is set');
    assert.dom(emailInput).hasValue('new-email', 'email is updated');
    assert.dom(phoneInput).hasValue('new-phone', 'phone is updated');
    assert.dom(usernameInput).hasValue('new-username', 'username is updated');

    assert.dom(firstName).hasClass('synced-from-directory', 'firstName has updated class applied');
    assert.dom(lastName).hasClass('synced-from-directory', 'lastName has updated class applied');
    assert.dom(phone).hasClass('synced-from-directory', 'phone has updated class applied');
    assert.dom(email).hasClass('synced-from-directory', 'email has updated class applied');
    assert.dom(campusId).hasClass('synced-from-directory', 'campusId has updated class applied');
    assert.dom(username).hasClass('synced-from-directory', 'username has updated class applied');

  });
});
