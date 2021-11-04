import { click, fillIn, currentURL, triggerEvent, visit, waitFor } from '@ember/test-helpers';
import { module, test } from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

const url = '/admin';

import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Admin', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    await setupAuthentication({ school, administeredSchools: [school] }, true);
  });

  test('can transition to `users` route', async function (assert) {
    const button = '.manage-users-summary a:nth-of-type(1)';

    await visit(url);
    await click(button);
    assert.strictEqual(currentURL(), '/users', 'transition occurred');
  });

  test('can search for users', async function (assert) {
    this.server.createList('user', 20, { schoolId: 1 });
    this.server.createList('authentication', 20);

    const userSearch = '.user-search input';
    const secondResult = '.user-search .results li:nth-of-type(3)';
    const secondResultUsername = `${secondResult} .name`;
    const secondResultEmail = `${secondResult} .email`;
    const name = '.user-display-name';

    await visit(url);
    await fillIn(userSearch, 'son');
    await triggerEvent(userSearch, 'keyup');
    assert.dom(secondResultUsername).hasText('1 guy M. Mc1son', 'user name is correct');
    assert.dom(secondResultEmail).hasText('user@example.edu', 'user email is correct');

    await click(secondResultUsername);
    await waitFor('[data-test-user-profile]');
    assert.strictEqual(currentURL(), '/users/2', 'new user profile is shown');
    assert.dom(name).hasText('1 guy M. Mc1son', 'user name is shown');
  });

  test('api lookup when search is disabled', async function (assert) {
    assert.expect(4);
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
    this.server.createList('user', 2, { schoolId: 1 });
    this.server.createList('authentication', 2);

    const userSearch = '.user-search input';
    await visit(url);

    this.server.get('api/users', (schema, { queryParams }) => {
      assert.ok('order_by[lastName]' in queryParams);
      assert.ok('order_by[firstName]' in queryParams);
      assert.strictEqual(queryParams['order_by[lastName]'], 'ASC');
      assert.strictEqual(queryParams['order_by[firstName]'], 'ASC');

      return schema.users.all();
    });

    await fillIn(userSearch, 'son');
    await triggerEvent(userSearch, 'keyup');
  });

  test('index search when search is enabled', async function (assert) {
    assert.expect(6);
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
    this.server.createList('user', 2, { schoolId: 1 });
    this.server.createList('authentication', 2);

    const userSearch = '.user-search input';
    await visit(url);

    this.server.get('api/search/v1/users', ({ db }, { queryParams }) => {
      assert.ok('q' in queryParams);
      assert.strictEqual(queryParams.q, 'son');
      assert.ok('size' in queryParams);
      assert.strictEqual(parseInt(queryParams.size, 10), 100);
      assert.notOk('order_by[firstName]' in queryParams);
      assert.notOk('order_by[firstName]' in queryParams);

      return {
        results: {
          autocomplete: [],
          users: db.users,
        },
      };
    });

    await fillIn(userSearch, 'son');
    await triggerEvent(userSearch, 'keyup');
  });
});
