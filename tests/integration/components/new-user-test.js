import Service from '@ember/service';
import { resolve } from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { mapBy } from 'ilios-common/utils/array-helpers';
import { component } from 'ilios/tests/pages/components/new-user';

module('Integration | Component | new user', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.schools = this.server.createList('school', 3);

    // fetch all the schools into the store
    await this.owner.lookup('service:store').findAll('school');

    this.server.create('user', {
      school: this.schools[0],
    });
    const user = await this.owner.lookup('service:store').findRecord('user', 1);

    class CurrentUserMock extends Service {
      async getModel() {
        return user;
      }
      async canCreateUser() {
        return resolve(true);
      }
    }

    const permissionCheckerMock = Service.extend({
      async canCreateUser() {
        return resolve(true);
      },
    });
    this.owner.register('service:current-user', CurrentUserMock);
    this.owner.register('service:permissionChecker', permissionCheckerMock);
  });

  test('it renders', async function (assert) {
    await render(hbs`<NewUser @close={{(noop)}} />`);

    await component.clickChoiceButtons.firstButton.isActive;
    assert.strictEqual(component.school.options.length, 3);
    assert.strictEqual(component.school.options[0].text, 'school 0');
    assert.strictEqual(component.school.options[1].text, 'school 1');
    assert.strictEqual(component.school.options[2].text, 'school 2');
  });

  test('errors do not show up initially', async function (assert) {
    await render(hbs`<NewUser @close={{(noop)}} />`);

    assert.notOk(component.firstName.hasError);
    assert.notOk(component.middleName.hasError);
    assert.notOk(component.lastName.hasError);
    assert.notOk(component.campusId.hasError);
    assert.notOk(component.otherId.hasError);
    assert.notOk(component.email.hasError);
    assert.notOk(component.phone.hasError);
    assert.notOk(component.username.hasError);
    assert.notOk(component.password.hasError);
  });

  test('submit empty form', async function (assert) {
    await render(hbs`<NewUser @close={{(noop)}} />`);
    await component.submit();

    assert.ok(component.firstName.hasError);
    assert.notOk(component.middleName.hasError);
    assert.ok(component.lastName.hasError);
    assert.notOk(component.campusId.hasError);
    assert.notOk(component.otherId.hasError);
    assert.ok(component.email.hasError);
    assert.notOk(component.phone.hasError);
    assert.ok(component.username.hasError);
    assert.ok(component.password.hasError);
  });

  test('create new user', async function (assert) {
    assert.expect(12);
    const studentRole = this.server.create('user-role', {
      id: 4,
      title: 'Student',
    });

    this.set('transitionToUser', (userId) => {
      assert.strictEqual(Number(userId), 2);
    });
    await render(hbs`<NewUser @close={{(noop)}} @transitionToUser={{this.transitionToUser}} />`);

    await component.firstName.set('first');
    await component.middleName.set('middle');
    await component.lastName.set('last');
    await component.campusId.set('campusid');
    await component.otherId.set('otherid');
    await component.phone.set('phone');
    await component.email.set('test@test.com');
    await component.username.set('user123');
    await component.password.set('password123');
    await component.submit();

    const newUser = await this.owner.lookup('service:store').findRecord('user', 2);
    assert.strictEqual(newUser.firstName, 'first', 'with the correct firstName');
    assert.strictEqual(newUser.middleName, 'middle', 'with the correct middleName');
    assert.strictEqual(newUser.lastName, 'last', 'with the correct lastName');
    assert.strictEqual(newUser.campusId, 'campusid', 'with the correct campusId');
    assert.strictEqual(newUser.otherId, 'otherid', 'with the correct otherId');
    assert.strictEqual(newUser.phone, 'phone', 'with the correct phone');
    assert.strictEqual(newUser.email, 'test@test.com', 'with the correct email');
    const roles = await newUser.roles;
    assert.notOk(mapBy(roles.slice(), 'id').includes(studentRole.id));

    const authentication = await newUser.authentication;
    assert.strictEqual(authentication.username, 'user123', 'with the correct username');
    assert.strictEqual(authentication.password, 'password123', 'with the correct password');
    assert.strictEqual(Number((await newUser.school).id), 1);
  });

  test('create new student user', async function (assert) {
    assert.expect(12);
    const studentRole = this.server.create('user-role', {
      id: 4,
      title: 'Student',
    });
    const program = this.server.create('program', { school: this.schools[0] });
    const programYear = this.server.create('programYear', {
      program,
      startYear: new Date().getFullYear(),
    });
    const cohort = this.server.create('cohort', { programYear });

    //load all created data into the store
    await this.owner.lookup('service:store').findAll('program');
    await this.owner.lookup('service:store').findAll('programYear');
    await this.owner.lookup('service:store').findAll('cohort');
    this.set('transitionToUser', (userId) => {
      assert.strictEqual(Number(userId), 2);
    });
    await render(hbs`<NewUser @close={{(noop)}} @transitionToUser={{this.transitionToUser}} />`);
    await component.clickChoiceButtons.secondButton.click();
    await component.firstName.set('first');
    await component.middleName.set('middle');
    await component.lastName.set('last');
    await component.campusId.set('campusid');
    await component.otherId.set('otherid');
    await component.phone.set('phone');
    await component.email.set('test@test.com');
    await component.username.set('user123');
    await component.password.set('password123');
    await component.submit();

    const newUser = await this.owner.lookup('service:store').findRecord('user', 2);
    assert.strictEqual(newUser.firstName, 'first', 'with the correct firstName');
    assert.strictEqual(newUser.middleName, 'middle', 'with the correct middleName');
    assert.strictEqual(newUser.lastName, 'last', 'with the correct lastName');
    assert.strictEqual(newUser.campusId, 'campusid', 'with the correct campusId');
    assert.strictEqual(newUser.otherId, 'otherid', 'with the correct otherId');
    assert.strictEqual(newUser.phone, 'phone', 'with the correct phone');
    assert.strictEqual(newUser.email, 'test@test.com', 'with the correct email');
    const roles = await newUser.roles;
    assert.ok(mapBy(roles.slice(), 'id').includes(studentRole.id));

    const authentication = await newUser.authentication;
    assert.strictEqual(authentication.username, 'user123', 'with the correct username');
    assert.strictEqual(authentication.password, 'password123', 'with the correct password');

    const primaryCohort = await newUser.primaryCohort;
    assert.strictEqual(primaryCohort.id, cohort.id);
  });

  test('cancel', async function (assert) {
    assert.expect(1);
    this.set('cancel', () => {
      assert.ok(true, 'cancel event fired.');
    });
    await render(hbs`<NewUser @close={{this.cancel}}  />`);
    await component.cancel();
  });

  test('change school', async function (assert) {
    const program1 = this.server.create('program', { school: this.schools[0] });
    const programYear1 = this.server.create('programYear', {
      program: program1,
      startYear: new Date().getFullYear(),
    });
    this.server.create('cohort', { programYear: programYear1 });

    const program2 = this.server.create('program', { school: this.schools[1] });
    const programYear2 = this.server.create('programYear', {
      program: program2,
      startYear: new Date().getFullYear() - 1,
      duration: 4,
    });
    this.server.create('cohort', { programYear: programYear2 });
    // this program is too old and will not show as option in the dropdown
    const programYear3 = this.server.create('programYear', {
      program: program2,
      startYear: new Date().getFullYear() - 5,
    });
    this.server.create('cohort', { programYear: programYear3 });

    //load all created data into the store
    await this.owner.lookup('service:store').findAll('program');
    await this.owner.lookup('service:store').findAll('programYear');
    await this.owner.lookup('service:store').findAll('cohort');

    await render(hbs`<NewUser @close={{(noop)}}  />`);
    await component.cancel();
    await component.clickChoiceButtons.secondButton.click();

    assert.ok(component.school.options[0].selected);
    assert.strictEqual(component.cohort.options.length, 1);
    assert.strictEqual(component.cohort.options[0].text, 'program 0 cohort 0');
    assert.ok(component.cohort.options[0].selected);

    await component.school.select(2);

    assert.ok(component.school.options[1].selected);
    assert.strictEqual(component.cohort.options.length, 1);
    assert.strictEqual(component.cohort.options[0].text, 'program 1 cohort 1');
    assert.ok(component.cohort.options[0].selected);
  });

  test('validate email address', async function (assert) {
    await render(hbs`<NewUser @close={{(noop)}}  />`);
    await component.cancel();
    assert.notOk(component.email.hasError);
    await component.email.set('thisisnotanemailaddress');
    await component.email.submit();
    assert.ok(component.email.hasError);
    await component.email.set('but@this.is');
    await component.email.submit();
    assert.notOk(component.email.hasError);
  });

  test('validate username', async function (assert) {
    const user = this.server.create('user');
    this.server.create('authentication', { username: 'geflarknik', user });
    await render(hbs`<NewUser @close={{(noop)}} @transitionToUser={{(noop)}} />`);
    assert.notOk(component.username.hasError);
    await component.firstName.set('Lorem');
    await component.lastName.set('Ipsum');
    await component.email.set('lorem@ipsum.com');
    await component.password.set('NyukNykNyuk$$000');
    await component.username.set('geflarknik');
    await component.username.submit();
    assert.ok(component.username.hasError);
    assert.strictEqual(
      component.username.errors,
      'This username is already taken by another user account.',
    );
    await component.username.set('geflarknik2');
    await component.username.submit();
    assert.notOk(component.username.hasError);
  });

  test('create new user in another school #4830', async function (assert) {
    assert.expect(2);

    this.set('transitionToUser', (userId) => {
      assert.strictEqual(Number(userId), 2);
    });
    await render(hbs`<NewUser @close={{(noop)}} @transitionToUser={{this.transitionToUser}} />`);

    await component.firstName.set('first');
    await component.lastName.set('last');
    await component.campusId.set('campusid');
    await component.email.set('test@test.com');
    await component.username.set('user123');
    await component.password.set('password123');
    component.school.select('2');
    await component.submit();

    const newUser = await this.owner.lookup('service:store').findRecord('user', 2);
    assert.strictEqual(Number((await newUser.school).id), 2);
  });

  test('create new user in another school without permission in primary school #4830', async function (assert) {
    assert.expect(2);
    const permissionCheckerMock = Service.extend({
      async canCreateUser(school) {
        return Number(school.id) === 2;
      },
    });
    this.owner.register('service:permissionChecker', permissionCheckerMock);

    this.set('transitionToUser', (userId) => {
      assert.strictEqual(Number(userId), 2);
    });
    await render(hbs`<NewUser @close={{(noop)}} @transitionToUser={{this.transitionToUser}} />`);

    await component.firstName.set('first');
    await component.lastName.set('last');
    await component.campusId.set('campusid');
    await component.email.set('test@test.com');
    await component.username.set('user123');
    await component.password.set('password123');
    await component.submit();

    const newUser = await this.owner.lookup('service:store').findRecord('user', 2);
    assert.strictEqual(Number((await newUser.school).id), 2);
  });
});
