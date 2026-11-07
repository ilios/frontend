import { currentURL, waitFor } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication, setupApplicationTest, takeScreenshot } from 'frontend/tests/helpers';
import { formatJsonApi } from 'frontend/tests/msw/utils/json-api-formatter.js';
import page from 'frontend/tests/pages/admin';

module('Acceptance | Admin', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    this.school = await this.server.create('school');
    await setupAuthentication({ school: this.school, administeredSchools: [this.school] });
  });

  test('can transition to `users` route', async function (assert) {
    await page.visit();
    await page.manageUsersSummary.visitUsers();
    assert.strictEqual(currentURL(), '/users', 'transition occurred');
  });

  test('can search for users', async function (assert) {
    await this.server.createList('user', 20, { school: this.school });
    await this.server.createList('authentication', 20);

    await page.visit();
    await takeScreenshot(assert, 'default');
    await page.manageUsersSummary.userSearch.input('son');
    await takeScreenshot(assert, 'search results dropdown');
    assert.strictEqual(
      page.manageUsersSummary.userSearch.results[2].name,
      '1 guy M. Mc1son',
      'user name is correct',
    );
    assert.strictEqual(
      page.manageUsersSummary.userSearch.results[2].email,
      'user@example.edu',
      'user email is correct',
    );

    await page.manageUsersSummary.userSearch.results[2].click();
    await waitFor('[data-test-user-profile]');
    assert.strictEqual(currentURL(), '/users/2', 'new user profile is shown');
    assert.dom('.user-display-name').hasText('1 guy M. Mc1son', 'user name is shown');
  });

  test('api lookup when search is disabled', async function (assert) {
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    this.server.get('/application/config', function () {
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

    await page.visit();

    this.server.get('/api/users', async ({ request }) => {
      assert.step('API called');
      const { searchParams } = new URL(request.url);
      assert.strictEqual(searchParams.get('order_by[lastName]'), 'ASC');
      assert.strictEqual(searchParams.get('order_by[firstName]'), 'ASC');
      const rhett = await this.server.db.user.all();
      return formatJsonApi(rhett, 'user');
    });

    await page.manageUsersSummary.userSearch.input('son');
    assert.verifySteps(['API called']);
  });

  test('index search when search is enabled', async function (assert) {
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    this.server.get('/application/config', function () {
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

    await page.visit();

    this.server.get('/api/search/v1/users', async ({ request }) => {
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

    await page.manageUsersSummary.userSearch.input('son');
    assert.verifySteps(['API called']);
  });

  test('search results exceed threshold', async function (assert) {
    const firstName = 'Janusz';
    await this.server.createList('user', 100, { school: this.school, firstName });

    await page.visit();
    await page.manageUsersSummary.userSearch.input(firstName);
    assert.strictEqual(page.manageUsersSummary.userSearch.results.length, 101);
  });
});
