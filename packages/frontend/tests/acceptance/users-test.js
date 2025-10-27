import { currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'frontend/tests/helpers';
import page from 'frontend/tests/pages/users';
import percySnapshot from '@percy/ember';
import userPage from 'frontend/tests/pages/user';
import { getUniqueName } from '../helpers/percy-snapshot-name';

module('Acceptance | Users', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    this.user = await setupAuthentication({
      school: school,
      campusId: '123',
      administeredSchools: [school],
    });
    this.server.createList('user', 90, { schoolId: 1, campusId: '555' });
    this.server.createList('authentication', 90);
  });

  test('can see list of users and transition to user route', async function (assert) {
    await page.visit();
    await percySnapshot(assert);
    assert.notOk(page.root.userList.users[0].isDisabled);
    assert.strictEqual(page.root.userList.users[0].userNameInfo.fullName, '0 guy M. Mc0son');
    assert.strictEqual(page.root.userList.users[0].campusId.text, '123');
    assert.strictEqual(page.root.userList.users[0].email.text, 'user@example.edu');
    assert.strictEqual(page.root.userList.users[0].school.text, 'school 0');

    await page.root.userList.users[0].viewUserDetails();
    assert.strictEqual(currentURL(), `/users/${this.user.id}`, 'transitioned to `user` route');
  });

  test('can page through list of users', async function (assert) {
    await page.visit();
    await page.root.bottomPaginator.pagedlistControls.nextPage.click();
    assert.strictEqual(currentURL(), '/users?offset=25', 'query param shown');
    await page.root.topPaginator.pagedlistControls.nextPage.click();
    assert.strictEqual(currentURL(), '/users?offset=50', 'query param shown');
    await page.root.bottomPaginator.pagedlistControls.previousPage.click();
    assert.strictEqual(currentURL(), '/users?offset=25', 'query param shown');
    await page.root.topPaginator.pagedlistControls.previousPage.click();
    assert.strictEqual(currentURL(), '/users', 'back to first page');
  });

  test('can search for a user and transition to user route', async function (assert) {
    this.server.createList('user', 40, { firstName: 'Test', lastName: 'Name', schoolId: 1 });
    await page.visit();
    await percySnapshot(getUniqueName(assert, 'default'));
    await page.root.search.set('Test Name');
    await percySnapshot(getUniqueName(assert, 'search results'));
    assert.strictEqual(page.root.userList.users[0].userNameInfo.fullName, 'Test M. Name');
    assert.strictEqual(currentURL(), '/users?filter=Test%20Name', 'no query params for search');
    await page.root.userList.users[0].viewUserDetails();
    assert.strictEqual(currentURL(), `/users/${this.user.id}`, 'transitioned to `user` route');
  });

  test('create new user', async function (assert) {
    await page.visit();
    await page.root.showNewUserFormButton.click();
    await page.root.newUserForm.firstName.set('Lorem');
    await page.root.newUserForm.lastName.set('Ipsum');
    await page.root.newUserForm.email.set('lorem@ipsum.edu');
    await page.root.newUserForm.username.set('test123');
    await page.root.newUserForm.password.set('G3heimSach*e');
    await page.root.newUserForm.submit();
    assert.strictEqual(currentURL(), '/users/101');
  });

  test('clear search when returning from creating a new user #4356', async function (assert) {
    await page.visit();
    await page.root.search.set('searchingterm');
    assert.strictEqual(currentURL(), '/users?filter=searchingterm');
    await page.root.showNewUserFormButton.click();
    await page.root.newUserForm.firstName.set('Lorem');
    await page.root.newUserForm.lastName.set('Ipsum');
    await page.root.newUserForm.email.set('lorem@ipsum.edu');
    await page.root.newUserForm.username.set('test123');
    await page.root.newUserForm.password.set('G3heimSach*e');
    await page.root.newUserForm.submit();
    assert.strictEqual(currentURL(), '/users/101');
    await userPage.manageUsersSummary.visitUsers();
    assert.strictEqual(page.root.search.value, '');
    assert.strictEqual(currentURL(), '/users');
  });

  test('clear search when returning from viewing a user #4356', async function (assert) {
    await page.visit();
    await page.root.search.set('Mc4son');
    assert.strictEqual(currentURL(), '/users?filter=Mc4son');
    assert.strictEqual(page.root.userList.users[0].userNameInfo.fullName, '4 guy M. Mc4son');
    await page.root.userList.users[0].viewUserDetails();
    assert.strictEqual(currentURL(), '/users/5');
    await userPage.manageUsersSummary.visitUsers();
    assert.strictEqual(page.root.search.value, '');
    assert.strictEqual(currentURL(), '/users');
  });

  test('clear search when returning from creating a new user to creating another new user #4356', async function (assert) {
    await page.visit();
    await page.root.search.set('searchingterm');
    assert.strictEqual(currentURL(), '/users?filter=searchingterm');
    await page.root.showNewUserFormButton.click();
    await page.root.newUserForm.firstName.set('Lorem');
    await page.root.newUserForm.lastName.set('Ipsum');
    await page.root.newUserForm.email.set('lorem@ipsum.edu');
    await page.root.newUserForm.username.set('test123');
    await page.root.newUserForm.password.set('G3heimSach*e');
    await page.root.newUserForm.submit();
    assert.strictEqual(currentURL(), '/users/101');
    await userPage.manageUsersSummary.createNewUser();
    assert.strictEqual(page.root.search.value, '');
    assert.strictEqual(currentURL(), '/users?addUser=true');
  });
});
