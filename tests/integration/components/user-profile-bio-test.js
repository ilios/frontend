import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, findAll, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;
let user;
let authentication;

module('Integration | Component | user profile bio', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    authentication = EmberObject.create({
      username: 'test-username',
      user: 13,
      password: null
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
    });
  });


  test('it renders for ldap user search', async function(assert) {
    const iliosConfigMock = Service.extend({
      userSearchType: resolve('ldap')
    });
    this.owner.register('service:iliosConfig', iliosConfigMock);
    this.set('user', user);
    await render(hbs`{{user-profile-bio user=user}}`);
    const fields = '.item';
    const firstName = `${fields}:eq(0) span`;
    const middleName = `${fields}:eq(1) span`;
    const lastName = `${fields}:eq(2) span`;
    const campusId = `${fields}:eq(3) span`;
    const otherId = `${fields}:eq(4) span`;
    const email = `${fields}:eq(5) span`;
    const phone = `${fields}:eq(6) span`;
    const username = `${fields}:eq(7) span`;

    return settled().then(()=>{
      assert.equal(findAll(fields).length, 8);
      assert.equal(this.$(firstName).text().trim(), 'Test Person', 'first name is displayed');
      assert.equal(this.$(middleName).text().trim(), 'Name', 'middle name is displayed');
      assert.equal(this.$(lastName).text().trim(), 'Thing', 'last name is displayed');
      assert.equal(this.$(campusId).text().trim(), 'idC', 'campus Id is displayed');
      assert.equal(this.$(otherId).text().trim(), 'idO', 'other id is displayed');
      assert.equal(this.$(email).text().trim(), 'test@test.com', 'email is displayed');
      assert.equal(this.$(phone).text().trim(), 'x1234', 'phone is displayed');
      assert.equal(this.$(username).text().trim(), 'test-username', 'username is displayed');
    });
  });

  test('it renders for non ldap user search', async function(assert) {
    const iliosConfigMock = Service.extend({
      userSearchType: resolve('local')
    });
    this.owner.register('service:iliosConfig', iliosConfigMock);
    this.set('user', user);
    await render(hbs`{{user-profile-bio user=user}}`);

    const fields = '.item';
    const firstName = `${fields}:eq(0) span`;
    const middleName = `${fields}:eq(1) span`;
    const lastName = `${fields}:eq(2) span`;
    const campusId = `${fields}:eq(3) span`;
    const otherId = `${fields}:eq(4) span`;
    const email = `${fields}:eq(5) span`;
    const phone = `${fields}:eq(6) span`;
    const username = `${fields}:eq(7) span`;
    const password = `${fields}:eq(8) span`;

    return settled().then(()=>{
      assert.equal(findAll(fields).length, 9);
      assert.equal(this.$(firstName).text().trim(), 'Test Person', 'first name is displayed');
      assert.equal(this.$(middleName).text().trim(), 'Name', 'middle name is displayed');
      assert.equal(this.$(lastName).text().trim(), 'Thing', 'last name is displayed');
      assert.equal(this.$(campusId).text().trim(), 'idC', 'campus Id is displayed');
      assert.equal(this.$(otherId).text().trim(), 'idO', 'other id is displayed');
      assert.equal(this.$(email).text().trim(), 'test@test.com', 'email is displayed');
      assert.equal(this.$(phone).text().trim(), 'x1234', 'phone is displayed');
      assert.equal(this.$(username).text().trim(), 'test-username', 'username is displayed');
      assert.equal(this.$(password).text().trim(), '*********', 'password placeholder is displayed');
    });
  });

  test('clicking manage sends the action', async function(assert) {
    const iliosConfigMock = Service.extend({
      userSearchType: resolve('ldap')
    });
    this.owner.register('service:iliosConfig', iliosConfigMock);
    assert.expect(1);
    this.set('user', user);
    this.set('click', (what) =>{
      assert.ok(what, 'recieved boolean true value');
    });
    await render(hbs`{{user-profile-bio user=user isManagable=true setIsManaging=(action click)}}`);
    return settled().then(async () => {
      const manage = 'button.manage';
      await click(manage);
    });
  });

  test('can edit user bio for ldap config', async function(assert) {
    assert.expect(19);
    const iliosConfigMock = Service.extend({
      userSearchType: resolve('ldap')
    });
    this.owner.register('service:iliosConfig', iliosConfigMock);
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
    const firstName = `${inputs}:eq(0)`;
    const middleName = `${inputs}:eq(1)`;
    const lastName = `${inputs}:eq(2)`;
    const campusId = `${inputs}:eq(3)`;
    const otherId = `${inputs}:eq(4)`;
    const email = `${inputs}:eq(5)`;
    const phone = `${inputs}:eq(6)`;
    const username = `${inputs}:eq(7)`;

    return settled().then(async () => {
      assert.equal(findAll(inputs).length, 8, 'correct number of inputs');
      assert.equal(this.$(firstName).val().trim(), 'Test Person', 'firstname is set');
      assert.equal(this.$(middleName).val().trim(), 'Name', 'middlename is set');
      assert.equal(this.$(lastName).val().trim(), 'Thing', 'lastname is set');
      assert.equal(this.$(campusId).val().trim(), 'idC', 'campuId is set');
      assert.equal(this.$(otherId).val().trim(), 'idO', 'otherId is set');
      assert.equal(this.$(email).val().trim(), 'test@test.com', 'email is set');
      assert.equal(this.$(phone).val().trim(), 'x1234', 'phone is set');
      assert.equal(this.$(username).val().trim(), 'test-username', 'username is set');
      assert.ok(this.$(username).is(':disabled'), 'username is disabled');
      this.$(firstName).val('new first').trigger('input');
      this.$(middleName).val('new middle').trigger('input');
      this.$(lastName).val('new last').trigger('input');
      this.$(campusId).val('new campusId').trigger('input');
      this.$(otherId).val('new otherId').trigger('input');
      this.$(email).val('e@e.com').trigger('input');
      this.$(phone).val('12345x').trigger('input');

      await click('.bigadd');

      return settled();
    });
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
    const firstName = `${inputs}:eq(0)`;
    const middleName = `${inputs}:eq(1)`;
    const lastName = `${inputs}:eq(2)`;
    const campusId = `${inputs}:eq(3)`;
    const otherId = `${inputs}:eq(4)`;
    const email = `${inputs}:eq(5)`;
    const phone = `${inputs}:eq(6)`;
    const username = `${inputs}:eq(7)`;
    const activatePasswordField = '.activate-password-field';

    return settled().then(async () => {
      assert.equal(findAll(inputs).length, 8, 'correct number of inputs');
      assert.equal(this.$(firstName).val().trim(), 'Test Person', 'firstname is set');
      assert.equal(this.$(middleName).val().trim(), 'Name', 'middlename is set');
      assert.equal(this.$(lastName).val().trim(), 'Thing', 'lastname is set');
      assert.equal(this.$(campusId).val().trim(), 'idC', 'campuId is set');
      assert.equal(this.$(otherId).val().trim(), 'idO', 'otherId is set');
      assert.equal(this.$(email).val().trim(), 'test@test.com', 'email is set');
      assert.equal(this.$(phone).val().trim(), 'x1234', 'phone is set');
      assert.equal(this.$(username).val().trim(), 'test-username', 'username is set');
      assert.equal(find(activatePasswordField).textContent.trim(), 'Click here to reset password.');
      this.$(firstName).val('new first').trigger('input');
      this.$(middleName).val('new middle').trigger('input');
      this.$(lastName).val('new last').trigger('input');
      this.$(campusId).val('new campusId').trigger('input');
      this.$(otherId).val('new otherId').trigger('input');
      this.$(email).val('e@e.com').trigger('input');
      this.$(phone).val('12345x').trigger('input');
      this.$(username).val('new-test-user').trigger('input');
      await click('.bigadd');

      return settled();
    });
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
    const firstName = `${inputs}:eq(0)`;
    const middleName = `${inputs}:eq(1)`;
    const lastName = `${inputs}:eq(2)`;
    const campusId = `${inputs}:eq(3)`;
    const otherId = `${inputs}:eq(4)`;
    const email = `${inputs}:eq(5)`;
    const phone = `${inputs}:eq(6)`;
    const username = `${inputs}:eq(7)`;
    const password = `${inputs}:eq(8)`;
    const activatePasswordField = '.activate-password-field';

    return settled().then(async () => {
      assert.equal(findAll(inputs).length, 8, 'correct number of inputs');
      assert.equal(this.$(firstName).val().trim(), 'Test Person', 'firstname is set');
      assert.equal(this.$(middleName).val().trim(), 'Name', 'middlename is set');
      assert.equal(this.$(lastName).val().trim(), 'Thing', 'lastname is set');
      assert.equal(this.$(campusId).val().trim(), 'idC', 'campuId is set');
      assert.equal(this.$(otherId).val().trim(), 'idO', 'otherId is set');
      assert.equal(this.$(email).val().trim(), 'test@test.com', 'email is set');
      assert.equal(this.$(phone).val().trim(), 'x1234', 'phone is set');
      assert.equal(this.$(username).val().trim(), 'test-username', 'username is set');
      await click(activatePasswordField);

      return settled().then(async () => {
        assert.equal(findAll(inputs).length, 9, 'password input has been added');
        assert.equal(this.$(password).val().trim(), '', 'password is set');
        this.$(firstName).val('new first').trigger('input');
        this.$(middleName).val('new middle').trigger('input');
        this.$(lastName).val('new last').trigger('input');
        this.$(campusId).val('new campusId').trigger('input');
        this.$(otherId).val('new otherId').trigger('input');
        this.$(email).val('e@e.com').trigger('input');
        this.$(phone).val('12345x').trigger('input');
        this.$(username).val('new-test-user').trigger('input');
        this.$(password).val('new-password').trigger('input');
        await click('.bigadd');

        return settled();
      });
    });
  });

  let setupConfigAndAuth = function(context){
    const iliosConfigMock = Service.extend({
      userSearchType: resolve('local')
    });
    context.register('service:iliosConfig', iliosConfigMock);
  };

  test('closing password box clears input', async function(assert) {
    assert.expect(4);
    setupConfigAndAuth(this);
    this.set('user', user);
    this.set('nothing', parseInt);

    await render(hbs`{{user-profile-bio isManaging=true user=user setIsManaging=(action nothing)}}`);
    const inputs = 'input';
    const password = `${inputs}:eq(8)`;
    const activatePasswordField = '.activate-password-field';
    const cancelPasswordField = '.cancel-password-field';

    return settled().then(async () => {
      assert.equal(findAll(inputs).length, 8, 'correct number of inputs');
      await click(activatePasswordField);

      return settled().then(()=>{
        assert.equal(findAll(inputs).length, 9, 'password input has been added');
        assert.equal(this.$(password).val().trim(), '', 'password is blank');
        this.$(password).val('new-password').trigger('input');
        return settled().then(async () => {
          await click(cancelPasswordField);
          return settled().then(async () => {
            await click(activatePasswordField);
            return settled().then(()=>{
              assert.equal(this.$(password).val().trim(), '', 'password is blank again');
            });
          });
        });

      });
    });
  });

  test('password strength 0 display', async function(assert) {
    assert.expect(3);
    setupConfigAndAuth(this);
    this.set('user', user);
    this.set('nothing', parseInt);

    await render(hbs`{{user-profile-bio isManaging=true user=user setIsManaging=(action nothing)}}`);
    const passwordStrengthMeter = 'meter:eq(0)';
    const passwordStrengthText = '.password span:eq(0)';
    const passwordInput = '.password input:eq(0)';
    const activatePasswordField = '.activate-password-field';

    return settled().then(async () => {
      await click(activatePasswordField);
      return settled().then(()=>{
        this.$(passwordInput).val('12345').trigger('input');
        return settled().then(()=>{
          assert.equal(this.$(passwordStrengthMeter).val(), 0, 'meter is intially at 0');
          assert.equal(this.$(passwordStrengthText).text().trim(), 'Try Harder', 'try harder is displayed for level 0 password');
          assert.ok(this.$(passwordStrengthText).hasClass('strength-0'), 'correct strength is applied to the meter');
        });
      });
    });
  });

  test('password strength 1 display', async function(assert) {
    assert.expect(3);
    setupConfigAndAuth(this);
    this.set('user', user);
    this.set('nothing', parseInt);

    await render(hbs`{{user-profile-bio isManaging=true user=user setIsManaging=(action nothing)}}`);
    const passwordStrengthMeter = 'meter:eq(0)';
    const passwordStrengthText = '.password span:eq(0)';
    const passwordInput = '.password input:eq(0)';
    const activatePasswordField = '.activate-password-field';

    return settled().then(async () => {
      await click(activatePasswordField);
      return settled().then(()=>{
        this.$(passwordInput).val('12345ab').trigger('input');
        return settled().then(()=>{
          assert.equal(this.$(passwordStrengthMeter).val(), 1, 'meter is intially at 1');
          assert.equal(this.$(passwordStrengthText).text().trim(), 'Bad', 'bad is displayed for level 1 password');
          assert.ok(this.$(passwordStrengthText).hasClass('strength-1'), 'correct strength is applied to the meter');
        });
      });
    });
  });

  test('password strength 2 display', async function(assert) {
    assert.expect(3);
    setupConfigAndAuth(this);
    this.set('user', user);
    this.set('nothing', parseInt);

    await render(hbs`{{user-profile-bio isManaging=true user=user setIsManaging=(action nothing)}}`);
    const passwordStrengthMeter = 'meter:eq(0)';
    const passwordStrengthText = '.password span:eq(0)';
    const passwordInput = '.password input:eq(0)';
    const activatePasswordField = '.activate-password-field';

    return settled().then(async () => {
      await click(activatePasswordField);
      return settled().then(()=>{
        this.$(passwordInput).val('12345ab13&').trigger('input');
        return settled().then(()=>{
          assert.equal(this.$(passwordStrengthMeter).val(), 2, 'meter is intially at 2');
          assert.equal(this.$(passwordStrengthText).text().trim(), 'Weak', 'weak is displayed for level 2 password');
          assert.ok(this.$(passwordStrengthText).hasClass('strength-2'), 'correct strength is applied to the meter');
        });
      });
    });
  });

  test('password strength 3 display', async function(assert) {
    assert.expect(3);
    setupConfigAndAuth(this);
    this.set('user', user);
    this.set('nothing', parseInt);

    await render(hbs`{{user-profile-bio isManaging=true user=user setIsManaging=(action nothing)}}`);
    const passwordStrengthMeter = 'meter:eq(0)';
    const passwordStrengthText = '.password span:eq(0)';
    const passwordInput = '.password input:eq(0)';
    const activatePasswordField = '.activate-password-field';

    return settled().then(async () => {
      await click(activatePasswordField);
      return settled().then(()=>{
        this.$(passwordInput).val('12345ab13&!!').trigger('input');
        return settled().then(()=>{
          assert.equal(this.$(passwordStrengthMeter).val(), 3, 'meter is intially at 3');
          assert.equal(this.$(passwordStrengthText).text().trim(), 'Good', 'good is displayed for level 3 password');
          assert.ok(this.$(passwordStrengthText).hasClass('strength-3'), 'correct strength is applied to the meter');
        });
      });
    });
  });

  test('password strength 4 display', async function(assert) {
    assert.expect(3);
    setupConfigAndAuth(this);
    this.set('user', user);
    this.set('nothing', parseInt);

    await render(hbs`{{user-profile-bio isManaging=true user=user setIsManaging=(action nothing)}}`);
    const passwordStrengthMeter = 'meter:eq(0)';
    const passwordStrengthText = '.password span:eq(0)';
    const passwordInput = '.password input:eq(0)';
    const activatePasswordField = '.activate-password-field';

    return settled().then(async () => {
      await click(activatePasswordField);
      return settled().then(()=>{
        this.$(passwordInput).val('12345ab14&HHtB').trigger('input');
        return settled().then(()=>{
          assert.equal(this.$(passwordStrengthMeter).val(), 4, 'meter is intially at 4');
          assert.equal(this.$(passwordStrengthText).text().trim(), 'Strong', 'strong is displayed for level 4 password');
          assert.ok(this.$(passwordStrengthText).hasClass('strength-4'), 'correct strength is applied to the meter');
        });
      });
    });
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
    const firstName = `${items}:eq(0)`;
    const middleName = `${items}:eq(1)`;
    const lastName = `${items}:eq(2)`;
    const campusId = `${items}:eq(3)`;
    const otherId = `${items}:eq(4)`;
    const email = `${items}:eq(5)`;
    const phone = `${items}:eq(6)`;
    const username = `${items}:eq(7)`;

    const firstNameInput = `${firstName} input:eq(0)`;
    const middleNameInput = `${middleName} input:eq(0)`;
    const lastNameInput = `${lastName} input:eq(0)`;
    const campusIdInput = `${campusId} input:eq(0)`;
    const otherIdInput = `${otherId} input:eq(0)`;
    const emailInput = `${email} input:eq(0)`;
    const phoneInput = `${phone} input:eq(0)`;
    const usernameInput = `${username} input:eq(0)`;

    const syncBUtton = 'button.directory-sync';

    return settled().then(async () => {
      assert.equal(findAll(items).length, 8, 'correct number of inputs');
      assert.equal(this.$(firstNameInput).val().trim(), 'Test Person', 'firstname is set');
      assert.equal(this.$(middleNameInput).val().trim(), 'Name', 'middlename is set');
      assert.equal(this.$(lastNameInput).val().trim(), 'Thing', 'lastname is set');
      assert.equal(this.$(campusIdInput).val().trim(), 'idC', 'campuId is set');
      assert.equal(this.$(otherIdInput).val().trim(), 'idO', 'otherId is set');
      assert.equal(this.$(emailInput).val().trim(), 'test@test.com', 'email is set');
      assert.equal(this.$(phoneInput).val().trim(), 'x1234', 'phone is set');
      assert.equal(this.$(usernameInput).val().trim(), 'test-username', 'username is set');
      await click(syncBUtton);

      return settled().then(()=>{
        assert.equal(this.$(firstNameInput).val().trim(), 'new-first-name', 'firstname is updated');
        assert.equal(this.$(middleNameInput).val().trim(), 'Name', 'middlename is set');
        assert.equal(this.$(lastNameInput).val().trim(), 'new-last-name', 'lastname is updated');
        assert.equal(this.$(campusIdInput).val().trim(), 'new-campus-id', 'campuId is updated');
        assert.equal(this.$(otherIdInput).val().trim(), 'idO', 'otherId is set');
        assert.equal(this.$(emailInput).val().trim(), 'new-email', 'email is updated');
        assert.equal(this.$(phoneInput).val().trim(), 'new-phone', 'phone is updated');
        assert.equal(this.$(usernameInput).val().trim(), 'new-username', 'username is updated');

        assert.ok(this.$(firstName).hasClass('synced-from-directory'), 'firstName has updated class applied');
        assert.ok(this.$(lastName).hasClass('synced-from-directory'), 'lastName has updated class applied');
        assert.ok(this.$(phone).hasClass('synced-from-directory'), 'phone has updated class applied');
        assert.ok(this.$(email).hasClass('synced-from-directory'), 'email has updated class applied');
        assert.ok(this.$(campusId).hasClass('synced-from-directory'), 'campusId has updated class applied');
        assert.ok(this.$(username).hasClass('synced-from-directory'), 'username has updated class applied');

        return settled();
      });
    });
  });
});
