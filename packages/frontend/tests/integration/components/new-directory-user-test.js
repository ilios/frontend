import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'frontend/tests/pages/components/new-directory-user';

module('Integration | Component | new directory user', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const schools = this.server.createList('school', 3);
    const user = this.server.create('user', {
      school: schools[0],
    });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    class PermissionCheckerMock extends Service {
      async canCreateUser() {
        return true;
      }
    }
    class CurrentUserMock extends Service {
      async getModel() {
        return userModel;
      }
    }

    this.owner.register('service:current-user', CurrentUserMock);
    this['current-user'] = this.owner.lookup('service:current-user');
    this.owner.register('service:permissionChecker', PermissionCheckerMock);
    await this.owner.lookup('service:store').findAll('school');
  });

  test('it renders and is accessible', async function (assert) {
    await render(hbs`<NewDirectoryUser @close={{(noop)}} @setSearchTerms={{(noop)}} />`);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found.');
  });

  test('input into the search field fires action', async function (assert) {
    assert.expect(1);
    const searchTerm = 'search for me!';
    this.set('setSearchTerms', (val) => {
      assert.strictEqual(val, searchTerm, 'changes to search get sent as action');
    });
    await render(hbs`<NewDirectoryUser
  @close={{(noop)}}
  @setSearchTerms={{this.setSearchTerms}}
  @searchTerms={{this.startingSearchTerms}}
/>`);
    await component.search.set(searchTerm);
    await component.search.submit();
  });

  test('initial search input fires search and fills input', async function (assert) {
    assert.expect(5);
    const startingSearchTerms = 'start here';
    this.server.get(`/application/directory/search`, (scheme, { queryParams }) => {
      assert.ok('limit' in queryParams);
      assert.strictEqual(parseInt(queryParams.limit, 10), 51);
      assert.ok('searchTerms' in queryParams);
      assert.strictEqual(queryParams.searchTerms, startingSearchTerms);
      return {
        results: [],
      };
    });
    this.set('startingSearchTerms', startingSearchTerms);
    await render(hbs`<NewDirectoryUser
  @close={{(noop)}}
  @setSearchTerms={{(noop)}}
  @searchTerms={{this.startingSearchTerms}}
/>`);
    assert.strictEqual(component.search.value, startingSearchTerms);
  });

  test('create new user', async function (assert) {
    assert.expect(40);
    this.server.create('user-role', {
      id: 4,
      title: 'Student',
    });
    const user1 = this.server.create('user', {
      firstName: 'user1-first',
      lastName: 'user1-last',
      displayName: 'user1-display',
      campusId: 'user1-campus',
      email: 'user1@test.com',
      telephoneNumber: 'user11234',
    });
    const user2 = this.server.create('user', {
      firstName: 'user2-first',
      lastName: 'user2-last',
      displayName: '',
      campusId: 'user2-campus',
      email: 'user2@test.com',
      telephoneNumber: 'user21234',
    });
    const auth2 = this.server.create('authentication', {
      user: user2,
      username: 'user2-username',
    });
    const user3 = this.server.create('user', {
      firstName: 'user3-first',
      lastName: 'user3-last',
      displayName: '',
      campusId: null,
      email: null,
      telephoneNumber: 'user31234',
    });
    const searchResult1 = {
      firstName: user1.firstName,
      lastName: user1.lastName,
      displayName: user1.displayName,
      campusId: user1.campusId,
      email: user1.email,
      telephoneNumber: user1.telephoneNumber,
      username: 'user1-username',
      user: null,
    };
    const searchResult2 = {
      firstName: user2.firstName,
      lastName: user2.lastName,
      displayName: user2.displayName,
      campusId: user2.campusId,
      email: user2.email,
      telephoneNumber: user2.telephoneNumber,
      username: auth2.username,
      user: 4136,
    };
    const searchResult3 = {
      firstName: user3.firstName,
      lastName: user3.lastName,
      displayName: user3.displayName,
      campusId: user3.campusId,
      email: user3.email,
      telephoneNumber: user3.telephoneNumber,
      username: null,
      user: null,
    };
    this.server.get('/application/config', () => {
      return {
        config: {
          locale: 'en',
          type: 'ldap',
          userSearchType: 'ldap',
        },
      };
    });
    this.server.get('/application/directory/search', (scheme, { queryParams }) => {
      assert.ok('limit' in queryParams);
      assert.ok('searchTerms' in queryParams);
      assert.strictEqual(parseInt(queryParams.limit, 10), 51);
      assert.strictEqual(queryParams.searchTerms, 'searchterm');
      return {
        results: [searchResult1, searchResult2, searchResult3],
      };
    });
    this.set('transitionToUser', (userId) => {
      assert.strictEqual(Number(userId), 5, 'after saving we transition to the right user');
    });
    await render(hbs`<NewDirectoryUser
  @close={{(noop)}}
  @setSearchTerms={{(noop)}}
  @transitionToUser={{this.transitionToUser}}
  @searchTerms='searchterm'
/>`);

    assert.strictEqual(component.searchResults.length, 3);
    assert.ok(component.searchResults[0].userCanBeAdded);
    assert.strictEqual(component.searchResults[0].name, `${searchResult1.displayName}`);
    assert.strictEqual(component.searchResults[0].campusId, searchResult1.campusId);
    assert.strictEqual(component.searchResults[0].email, searchResult1.email);
    assert.ok(component.searchResults[1].userAlreadyExists);
    assert.strictEqual(
      component.searchResults[1].name,
      `${searchResult2.firstName} ${searchResult2.lastName}`,
    );
    assert.strictEqual(component.searchResults[1].campusId, searchResult2.campusId);
    assert.strictEqual(component.searchResults[1].email, searchResult2.email);
    assert.ok(component.searchResults[2].userCannotBeAdded);
    assert.strictEqual(
      component.searchResults[2].name,
      `${searchResult3.firstName} ${searchResult3.lastName}`,
    );
    assert.strictEqual(component.searchResults[2].campusId, '');
    assert.strictEqual(component.searchResults[2].email, '');

    await component.searchResults[0].addUser();

    assert.strictEqual(component.form.firstName, `First Name: ${searchResult1.firstName}`);
    assert.strictEqual(component.form.lastName, `Last Name: ${searchResult1.lastName}`);
    assert.strictEqual(component.form.displayName, `Display Name: ${searchResult1.displayName}`);
    assert.strictEqual(component.form.campusId, `Campus ID: ${searchResult1.campusId}`);
    assert.strictEqual(component.form.email, `Email: ${searchResult1.email}`);
    assert.strictEqual(component.form.phone, `Phone: ${searchResult1.telephoneNumber}`);
    assert.strictEqual(component.form.otherId.label, 'Other ID:');
    assert.strictEqual(component.form.otherId.value, '');
    assert.strictEqual(component.form.username.text, `Username: ${searchResult1.username}`);
    assert.strictEqual(component.form.school.value, '1');

    await component.form.submit();

    const userModel = await this.owner.lookup('service:store').findRecord('user', 5);
    const authenticationModel = await userModel.get('authentication');
    assert.strictEqual(userModel.firstName, searchResult1.firstName);
    assert.strictEqual(userModel.middleName, null);
    assert.strictEqual(userModel.lastName, searchResult1.lastName);
    assert.strictEqual(userModel.displayName, searchResult1.displayName);
    assert.strictEqual(userModel.campusId, searchResult1.campusId);
    assert.strictEqual(userModel.otherId, null);
    assert.strictEqual(userModel.phone, searchResult1.telephoneNumber);
    assert.strictEqual(userModel.email, searchResult1.email);
    assert.strictEqual(Number((await userModel.school).id), 1);
    assert.strictEqual(Number(userModel.id), 5);
    assert.strictEqual(authenticationModel.username, searchResult1.username);
    assert.strictEqual(authenticationModel.password, null);
  });

  test('create new user in another school #4830', async function (assert) {
    assert.expect(6);
    this.server.create('user-role', {
      id: 4,
      title: 'Student',
    });
    const searchResult = {
      firstName: 'first',
      lastName: 'last',
      displayName: '',
      campusId: '123',
      email: 'user1@example.edu',
      telephoneNumber: '805',
      username: 'test',
      user: null,
    };
    this.server.get('/application/config', () => {
      return {
        config: {
          locale: 'en',
          type: 'ldap',
          userSearchType: 'ldap',
        },
      };
    });
    this.server.get('/application/directory/search', () => {
      return {
        results: [searchResult],
      };
    });
    this.set('transitionToUser', (userId) => {
      assert.strictEqual(Number(userId), 2, 'after saving we transition to the right user');
    });
    await render(hbs`<NewDirectoryUser
  @close={{(noop)}}
  @setSearchTerms={{(noop)}}
  @transitionToUser={{this.transitionToUser}}
  @searchTerms='searchterm'
/>`);

    assert.strictEqual(component.searchResults.length, 1);
    assert.ok(component.searchResults[0].userCanBeAdded);
    await component.searchResults[0].addUser();
    assert.strictEqual(component.form.school.value, '1');
    await component.form.school.select('2');
    await component.form.submit();

    const userModel = await this.owner.lookup('service:store').findRecord('user', 2);
    const schoolModel = await userModel.school;
    assert.strictEqual(Number(userModel.id), 2);
    assert.strictEqual(Number(schoolModel.id), 2);
  });

  test('create new user in another school with permission in only one school #4830', async function (assert) {
    assert.expect(6);
    class PermissionCheckerMock extends Service {
      async canCreateUser(school) {
        return Number(school.id) === 2;
      }
    }
    this.owner.register('service:permissionChecker', PermissionCheckerMock);
    this.server.create('user-role', {
      id: 4,
      title: 'Student',
    });
    const searchResult = {
      firstName: 'first',
      lastName: 'last',
      displayName: '',
      campusId: '123',
      email: 'user1@example.edu',
      telephoneNumber: '805',
      username: 'test',
      user: null,
    };
    this.server.get('/application/config', () => {
      return {
        config: {
          locale: 'en',
          type: 'ldap',
          userSearchType: 'ldap',
        },
      };
    });
    this.server.get('/application/directory/search', () => {
      return {
        results: [searchResult],
      };
    });
    this.set('transitionToUser', (userId) => {
      assert.strictEqual(Number(userId), 2, 'after saving we transition to the right user');
    });
    await render(hbs`<NewDirectoryUser
  @close={{(noop)}}
  @setSearchTerms={{(noop)}}
  @transitionToUser={{this.transitionToUser}}
  @searchTerms='searchterm'
/>`);

    assert.strictEqual(component.searchResults.length, 1);
    assert.ok(component.searchResults[0].userCanBeAdded);
    await component.searchResults[0].addUser();
    assert.strictEqual(component.form.school.value, '2');
    await component.form.submit();

    const userModel = await this.owner.lookup('service:store').findRecord('user', 2);
    const schoolModel = await userModel.school;
    assert.strictEqual(Number(userModel.id), 2);
    assert.strictEqual(Number(schoolModel.id), 2);
  });

  test('save with custom otherId', async function (assert) {
    this.server.create('user-role', {
      id: 4,
      title: 'Student',
    });
    this.server.get('/application/config', () => {
      return {
        config: {
          locale: 'en',
          type: 'ldap',
          userSearchType: 'ldap',
        },
      };
    });
    this.server.get('/application/directory/search', () => {
      return {
        results: [
          {
            firstName: 'first',
            lastName: 'last',
            displayName: '',
            campusId: '123',
            email: 'user1@example.edu',
            telephoneNumber: '805',
            username: null,
            user: null,
          },
        ],
      };
    });
    await render(hbs`<NewDirectoryUser
  @close={{(noop)}}
  @setSearchTerms={{(noop)}}
  @transitionToUser={{(noop)}}
  @searchTerms='searchterm'
/>`);

    assert.strictEqual(component.searchResults.length, 1);
    assert.ok(component.searchResults[0].userCanBeAdded);
    await component.searchResults[0].addUser();

    assert.strictEqual(component.form.otherId.value, '');
    await component.form.otherId.set('new-other-id');
    await component.form.submit();

    const userModel = await this.owner.lookup('service:store').findRecord('user', 2);
    assert.strictEqual(Number(userModel.id), 2);
    assert.strictEqual(userModel.otherId, 'new-other-id');
  });

  test('save with custom username and password', async function (assert) {
    this.server.create('user-role', {
      id: 4,
      title: 'Student',
    });
    this.server.get('/application/config', () => {
      return {
        config: {
          locale: 'en',
          type: 'form',
          userSearchType: 'ldap',
        },
      };
    });
    this.server.get('/application/directory/search', () => {
      return {
        results: [
          {
            firstName: 'first',
            lastName: 'last',
            displayName: '',
            campusId: '123',
            email: 'user1@example.edu',
            telephoneNumber: '805',
            username: null,
            user: null,
          },
        ],
      };
    });
    await render(hbs`<NewDirectoryUser
  @close={{(noop)}}
  @setSearchTerms={{(noop)}}
  @transitionToUser={{(noop)}}
  @searchTerms='searchterm'
/>`);

    assert.strictEqual(component.searchResults.length, 1);
    assert.ok(component.searchResults[0].userCanBeAdded);
    await component.searchResults[0].addUser();

    assert.strictEqual(component.form.username.value, '');
    assert.strictEqual(component.form.password.value, '');

    await component.form.username.set('new-username');
    await component.form.password.set('new-password');

    await component.form.submit();

    const userModel = await this.owner.lookup('service:store').findRecord('user', 2);
    const authenticationModel = await userModel.authentication;
    assert.strictEqual(Number(userModel.id), 2);
    assert.strictEqual(authenticationModel.username, 'new-username');
    assert.strictEqual(authenticationModel.password, 'new-password');
  });

  test('validation works', async function (assert) {
    this.server.create('user-role', {
      id: 4,
      title: 'Student',
    });
    this.server.get('/application/config', () => {
      return {
        config: {
          locale: 'en',
          type: 'form',
          userSearchType: 'ldap',
        },
      };
    });
    this.server.get('/application/directory/search', () => {
      return {
        results: [
          {
            firstName: 'first',
            lastName: 'last',
            displayName: '',
            campusId: '123',
            email: 'user1@example.edu',
            telephoneNumber: '805',
            username: null,
            user: null,
          },
        ],
      };
    });
    await render(hbs`<NewDirectoryUser
  @close={{(noop)}}
  @setSearchTerms={{(noop)}}
  @transitionToUser={{(noop)}}
  @searchTerms='searchterm'
/>`);

    assert.strictEqual(component.searchResults.length, 1);
    assert.ok(component.searchResults[0].userCanBeAdded);
    await component.searchResults[0].addUser();

    assert.strictEqual(component.form.otherId.errors.length, 0);
    assert.strictEqual(component.form.username.errors.length, 0);
    assert.strictEqual(component.form.password.errors.length, 0);

    assert.strictEqual(component.form.otherId.value, '');
    assert.strictEqual(component.form.username.value, '');
    assert.strictEqual(component.form.password.value, '');

    await component.form.otherId.set('long'.repeat(5));

    await component.form.submit();

    assert.strictEqual(component.form.otherId.errors.length, 1);
    assert.strictEqual(
      component.form.otherId.errors[0].text,
      'This field is too long (maximum is 16 characters)',
    );
    assert.strictEqual(component.form.username.errors.length, 1);
    assert.strictEqual(component.form.username.errors[0].text, 'This field can not be blank');
    assert.strictEqual(component.form.password.errors.length, 1);
    assert.strictEqual(component.form.password.errors[0].text, 'This field can not be blank');
  });
});
