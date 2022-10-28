import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'ilios/tests/pages/components/new-directory-user';

module('Integration | Component | new directory user', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
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
  });

  test('it renders and is accessible', async function (assert) {
    await render(hbs`<NewDirectoryUser @close={{(noop)}} @setSearchTerms={{(noop)}} />`);
    await a11yAudit();
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
    assert.expect(35);
    this.server.create('user-role', {
      id: 4,
      title: 'Student',
    });
    const user1 = this.server.create('user', {
      firstName: 'user1-first',
      lastName: 'user1-last',
      campusId: 'user1-campus',
      email: 'user1@test.com',
      telephoneNumber: 'user11234',
    });
    const user2 = this.server.create('user', {
      firstName: 'user2-first',
      lastName: 'user2-last',
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
      campusId: null,
      email: null,
      telephoneNumber: 'user31234',
    });
    const searchResult1 = {
      firstName: user1.firstName,
      lastName: user1.lastName,
      campusId: user1.campusId,
      email: user1.email,
      telephoneNumber: user1.telephoneNumber,
      username: 'user1-username',
      user: null,
    };
    const searchResult2 = {
      firstName: user2.firstName,
      lastName: user2.lastName,
      campusId: user2.campusId,
      email: user2.email,
      telephoneNumber: user2.telephoneNumber,
      username: auth2.username,
      user: 4136,
    };
    const searchResult3 = {
      firstName: user3.firstName,
      lastName: user3.lastName,
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
          type: 'ladp',
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
      assert.strictEqual(parseInt(userId, 10), 5, 'after saving we transition to the right user');
    });
    await render(hbs`<NewDirectoryUser
      @close={{(noop)}}
      @setSearchTerms={{(noop)}}
      @transitionToUser={{this.transitionToUser}}
      @searchTerms="searchterm"
    />`);

    assert.strictEqual(component.searchResults.length, 3);
    assert.ok(component.searchResults[0].userCanBeAdded);
    assert.strictEqual(
      component.searchResults[0].name,
      `${searchResult1.firstName} ${searchResult1.lastName}`
    );
    assert.strictEqual(component.searchResults[0].campusId, searchResult1.campusId);
    assert.strictEqual(component.searchResults[0].email, searchResult1.email);
    assert.ok(component.searchResults[1].userAlreadyExists);
    assert.strictEqual(
      component.searchResults[1].name,
      `${searchResult2.firstName} ${searchResult2.lastName}`
    );
    assert.strictEqual(component.searchResults[1].campusId, searchResult2.campusId);
    assert.strictEqual(component.searchResults[1].email, searchResult2.email);
    assert.ok(component.searchResults[2].userCannotBeAdded);
    assert.strictEqual(
      component.searchResults[2].name,
      `${searchResult3.firstName} ${searchResult3.lastName}`
    );
    assert.strictEqual(component.searchResults[2].campusId, '');
    assert.strictEqual(component.searchResults[2].email, '');

    await component.searchResults[0].addUser();

    assert.strictEqual(component.form.firstName, `First Name: ${searchResult1.firstName}`);
    assert.strictEqual(component.form.lastName, `Last Name: ${searchResult1.lastName}`);
    assert.strictEqual(component.form.campusId, `Campus ID: ${searchResult1.campusId}`);
    assert.strictEqual(component.form.email, `Email: ${searchResult1.email}`);
    assert.strictEqual(component.form.phone, `Phone: ${searchResult1.telephoneNumber}`);
    assert.strictEqual(component.form.otherId, `Other ID:`);
    assert.strictEqual(component.form.username.text, `Username: ${searchResult1.username}`);

    await component.form.submit();

    const userModel = await this.owner.lookup('service:store').findRecord('user', 5);
    const authenticationModel = await userModel.get('authentication');
    assert.strictEqual(userModel.firstName, searchResult1.firstName);
    assert.strictEqual(userModel.middleName, null);
    assert.strictEqual(userModel.lastName, searchResult1.lastName);
    assert.strictEqual(userModel.campusId, searchResult1.campusId);
    assert.strictEqual(userModel.otherId, null);
    assert.strictEqual(userModel.phone, searchResult1.telephoneNumber);
    assert.strictEqual(userModel.email, searchResult1.email);
    assert.strictEqual(parseInt(userModel.id, 10), 5);
    assert.strictEqual(authenticationModel.username, searchResult1.username);
    assert.strictEqual(authenticationModel.password, null);
  });
});
