import {
  click,
  fillIn,
  currentURL,
  triggerEvent,
  visit
} from '@ember/test-helpers';
import { module, test } from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import { percySnapshot } from 'ember-percy';

let url = '/admin';

import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Admin', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    await setupAuthentication({ school, administeredSchools: [school] }, true);
  });

  test('can transition to `users` route', async function(assert) {
    const button = '.manage-users-summary a:nth-of-type(1)';

    await visit(url);
    await click(button);
    assert.equal(currentURL(), '/users', 'transition occurred');
    percySnapshot(assert);
  });

  test('can search for users', async function(assert) {
    this.server.createList('user', 20, {schoolId: 1});
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
    assert.equal(currentURL(), '/users/2', 'new user profile is shown');
    assert.dom(name).hasText('1 guy M. Mc1son', 'user name is shown');
    percySnapshot(assert);
  });
});
