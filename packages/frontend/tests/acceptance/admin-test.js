import { click, fillIn, currentURL, triggerEvent, visit, waitFor } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { formatJsonApi } from 'ilios-common/msw/utils/json-api-formatter.js';
const url = '/admin';
import { setupApplicationTest, takeScreenshot } from 'frontend/tests/helpers';

module('Acceptance | Admin', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    this.school = await this.server.create('school');
    await setupAuthentication({ school: this.school, administeredSchools: [this.school] }, true);
  });

  test('can transition to `users` route', async function (assert) {
    const button = '.manage-users-summary a:nth-of-type(1)';

    await visit(url);
    await click(button);
    assert.strictEqual(currentURL(), '/users', 'transition occurred');
  });

  test('can search for users', async function (assert) {
    await this.server.createList('user', 20, { school: this.school });
    await this.server.createList('authentication', 20);

    const userSearch = '.user-search input';
    const secondResult = '.user-search .results li:nth-of-type(3)';
    const secondResultUsername = `${secondResult} .name`;
    const secondResultEmail = `${secondResult} .email`;
    const name = '.user-display-name';

    await visit(url);
    await takeScreenshot(assert, 'default');
    await fillIn(userSearch, 'son');
    await triggerEvent(userSearch, 'keyup');
    await takeScreenshot(assert, 'search results dropdown');
    assert.dom(secondResultUsername).hasText('1 guy M. Mc1son', 'user name is correct');
    assert.dom(secondResultEmail).hasText('user@example.edu', 'user email is correct');

    await click(secondResultUsername);
    await waitFor('[data-test-user-profile]');
    assert.strictEqual(currentURL(), '/users/2', 'new user profile is shown');
    assert.dom(name).hasText('1 guy M. Mc1son', 'user name is shown');
  });

  test('api lookup when search is disabled', async function (assert) {
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    this.server.get('application/config', function () {
      return {
        config: {
          type: 'form',
          apiVersion,
          searchEnabled: false,
        },
      };
    });
    await this.server.createList('user', 2, { school: this.school });
    await this.server.createList('authentication', 2);

    const userSearch = '.user-search input';
    await visit(url);

    this.server.get('api/users', async ({ request }) => {
      assert.step('API called');
      const { searchParams } = new URL(request.url);
      assert.strictEqual(searchParams.get('order_by[lastName]'), 'ASC');
      assert.strictEqual(searchParams.get('order_by[firstName]'), 'ASC');
      const rhett = await this.server.db.user.all();
      return formatJsonApi(rhett, 'user');
    });

    await fillIn(userSearch, 'son');
    await triggerEvent(userSearch, 'keyup');
    assert.verifySteps(['API called']);
  });

  test('index search when search is enabled', async function (assert) {
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    this.server.get('application/config', function () {
      return {
        config: {
          type: 'form',
          apiVersion,
          searchEnabled: true,
        },
      };
    });
    await this.server.createList('user', 2, { school: this.school });
    await this.server.createList('authentication', 2);

    const userSearch = '.user-search input';
    await visit(url);

    this.server.get('api/search/v1/users', async ({ request }) => {
      assert.step('API called');
      const { searchParams } = new URL(request.url);
      assert.strictEqual(searchParams.get('q'), 'son');
      assert.strictEqual(Number(searchParams.get('size')), 100);
      assert.notOk(searchParams.has('order_by[firstName]'));
      assert.notOk(searchParams.has('order_by[firstName]'));
      // user search is non-standard API, we need to remap records here so the payload
      // adheres to the expected shape.
      const users = (await this.server.db.user.all()).map((user) => {
        return {
          lastName: user.lastName,
          firstName: user.firstName,
          displayName: user.displayName,
          campusId: user.campusId,
          middleName: user.middleName,
          id: user.id,
          enabled: user.enabled,
          email: user.email,
        };
      });
      return {
        results: {
          autocomplete: [],
          users,
        },
      };
    });

    await fillIn(userSearch, 'son');
    await triggerEvent(userSearch, 'keyup');
    assert.verifySteps(['API called']);
  });

  test('search results exceed threshold', async function (assert) {
    const firstName = 'Janusz';
    await this.server.createList('user', 100, { school: this.school, firstName });

    const userSearch = '.user-search input';
    const results = '.user-search .results li';
    const summary = `${results}:nth-of-type(1)`;
    const viewAll = `${summary} [data-test-view-all-results]`;
    await visit(url);
    await fillIn(userSearch, firstName);
    await triggerEvent(userSearch, 'keyup');
    assert.dom(results).exists({ count: 101 });
    assert.dom(summary).hasText('100 results View All');
    assert.dom(viewAll).hasAttribute('href', `/users?filter=${firstName}`);
  });
});
