import { currentURL } from '@ember/test-helpers';
import { setupApplicationTest, setupAuthentication, takeScreenshot } from 'frontend/tests/helpers';
import userPage from 'frontend/tests/pages/user';
import page from 'frontend/tests/pages/users';
import { module, test } from 'qunit';

module('Acceptance | Users', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    this.school = await this.server.create('school');
    this.user = await setupAuthentication({
      school: this.school,
      campusId: '123',
      administeredSchools: [this.school],
    });
    await this.server.createList('user', 90, { school: this.school, campusId: '555' });
    await this.server.createList('authentication', 90);
  });

  test('can see list of users and transition to user route', async function (assert) {
    await page.visit();
    await takeScreenshot(assert);
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
    const users = await this.server.createList('user', 40, {
      firstName: 'Test',
      lastName: 'Name',
      school: this.school,
    });
    await page.visit();
    await takeScreenshot(assert, 'default');
    await page.root.search.set('Test Name');
    await takeScreenshot(assert, 'search results');
    assert.strictEqual(page.root.userList.users[0].userNameInfo.fullName, 'Test M. Name');
    assert.strictEqual(page.root.userList.users[0].userNameInfo.fullName, 'Test M. Name');
    assert.strictEqual(currentURL(), '/users?filter=Test%20Name', 'no query params for search');
    await page.root.userList.users[0].viewUserDetails();
    assert.strictEqual(currentURL(), `/users/${users[0].id}`, 'transitioned to `user` route');
  });

  test('create new user', async function (assert) {
    await page.visit();
    let userCount = this.server.db.user.all().length;
    await page.root.showNewUserFormButton.click();
    await page.root.newUserForm.firstName.set('Lorem');
    await page.root.newUserForm.lastName.set('Ipsum');
    await page.root.newUserForm.email.set('lorem@ipsum.edu');
    await page.root.newUserForm.username.set('test123');
    await page.root.newUserForm.password.set('G3heimSach*e');
    await page.root.newUserForm.submit();
    ++userCount;
    assert.strictEqual(this.server.db.user.all().length, userCount);
    assert.strictEqual(currentURL(), `/users/${userCount}`);
  });

  test('clear search when returning from creating a new user #4356', async function (assert) {
    await page.visit();
    let userCount = this.server.db.user.all().length;
    await page.root.search.set('searchingterm');
    assert.strictEqual(currentURL(), '/users?filter=searchingterm');
    await page.root.showNewUserFormButton.click();
    await page.root.newUserForm.firstName.set('Lorem');
    await page.root.newUserForm.lastName.set('Ipsum');
    await page.root.newUserForm.email.set('lorem@ipsum.edu');
    await page.root.newUserForm.username.set('test123');
    await page.root.newUserForm.password.set('G3heimSach*e');
    await page.root.newUserForm.submit();
    ++userCount;
    assert.strictEqual(this.server.db.user.all().length, userCount);
    assert.strictEqual(currentURL(), `/users/${userCount}`);
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
    let userCount = this.server.db.user.all().length;
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
    ++userCount;
    assert.strictEqual(this.server.db.user.all().length, userCount);
    assert.strictEqual(currentURL(), `/users/${userCount}`);
    await userPage.manageUsersSummary.createNewUser();
    assert.strictEqual(page.root.search.value, '');
    assert.strictEqual(currentURL(), '/users?addUser=true');
  });

  test('change number of users per page', async function (assert) {
    await page.visit();
    assert.notOk(currentURL().includes('limit'));
    assert.strictEqual(page.root.userList.users.length, 25);
    assert.strictEqual(page.root.topPaginator.pagedlistControls.limit.options.length, 7);
    assert.strictEqual(page.root.topPaginator.pagedlistControls.limit.options[0].text, '10');
    assert.strictEqual(page.root.topPaginator.pagedlistControls.limit.options[0].value, '10');
    assert.notOk(page.root.topPaginator.pagedlistControls.limit.options[0].selected);
    assert.strictEqual(page.root.topPaginator.pagedlistControls.limit.options[1].text, '25');
    assert.strictEqual(page.root.topPaginator.pagedlistControls.limit.options[1].value, '25');
    assert.ok(page.root.topPaginator.pagedlistControls.limit.options[1].selected);
    assert.strictEqual(page.root.topPaginator.pagedlistControls.limit.options[2].text, '50');
    assert.strictEqual(page.root.topPaginator.pagedlistControls.limit.options[2].value, '50');
    assert.notOk(page.root.topPaginator.pagedlistControls.limit.options[2].selected);
    assert.strictEqual(page.root.topPaginator.pagedlistControls.limit.options[3].text, '100');
    assert.strictEqual(page.root.topPaginator.pagedlistControls.limit.options[3].value, '100');
    assert.notOk(page.root.topPaginator.pagedlistControls.limit.options[3].selected);
    assert.strictEqual(page.root.topPaginator.pagedlistControls.limit.options[4].text, '200');
    assert.strictEqual(page.root.topPaginator.pagedlistControls.limit.options[4].value, '200');
    assert.notOk(page.root.topPaginator.pagedlistControls.limit.options[4].selected);
    assert.strictEqual(page.root.topPaginator.pagedlistControls.limit.options[5].text, '400');
    assert.strictEqual(page.root.topPaginator.pagedlistControls.limit.options[5].value, '400');
    assert.notOk(page.root.topPaginator.pagedlistControls.limit.options[5].selected);
    assert.strictEqual(page.root.topPaginator.pagedlistControls.limit.options[6].text, '1000');
    assert.strictEqual(page.root.topPaginator.pagedlistControls.limit.options[6].value, '1000');
    assert.notOk(page.root.topPaginator.pagedlistControls.limit.options[6].selected);

    await page.root.topPaginator.pagedlistControls.limit.set('10');

    assert.strictEqual(page.root.userList.users.length, 10);
    assert.ok(page.root.topPaginator.pagedlistControls.limit.options[0].selected);
    assert.ok(currentURL().includes('limit=10'));

    await page.root.topPaginator.pagedlistControls.limit.set('25');

    assert.strictEqual(page.root.userList.users.length, 25);
    assert.ok(page.root.topPaginator.pagedlistControls.limit.options[1].selected);
    assert.notOk(currentURL().includes('limit'));

    await page.root.topPaginator.pagedlistControls.limit.set('50');

    assert.strictEqual(page.root.userList.users.length, 50);
    assert.ok(page.root.topPaginator.pagedlistControls.limit.options[2].selected);
    assert.ok(currentURL().includes('limit=50'));

    await page.root.topPaginator.pagedlistControls.limit.set('100');

    assert.strictEqual(page.root.userList.users.length, 91);
    assert.ok(page.root.topPaginator.pagedlistControls.limit.options[3].selected);
    assert.ok(currentURL().includes('limit=100'));

    await page.root.topPaginator.pagedlistControls.limit.set('200');

    assert.strictEqual(page.root.userList.users.length, 91);
    assert.ok(page.root.topPaginator.pagedlistControls.limit.options[4].selected);
    assert.ok(currentURL().includes('limit=200'));

    await page.root.topPaginator.pagedlistControls.limit.set('400');

    assert.strictEqual(page.root.userList.users.length, 91);
    assert.ok(page.root.topPaginator.pagedlistControls.limit.options[5].selected);
    assert.ok(currentURL().includes('limit=400'));

    await page.root.topPaginator.pagedlistControls.limit.set('1000');

    assert.strictEqual(page.root.userList.users.length, 91);
    assert.ok(page.root.topPaginator.pagedlistControls.limit.options[6].selected);
    assert.ok(currentURL().includes('limit=1000'));
  });
});
