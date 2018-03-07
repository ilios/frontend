import { click, fillIn, currentURL, find, triggerEvent, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

let application;
let url = '/admin';

module('Acceptance: Admin', function(hooks) {
  hooks.beforeEach(function() {
    application = startApp();
    this.server.create('school');
    setupAuthentication(application, {id: 4136, schoolId: 1});
  });

  hooks.afterEach(function() {
    destroyApp(application);
  });

  test('can transition to `users` route', async function(assert) {
    const button = '.manage-users-summary a:eq(0)';

    await visit(url);
    await click(button);
    assert.equal(currentURL(), '/users', 'transition occurred');
  });

  test('can search for users', async function(assert) {
    this.server.createList('user', 20, {schoolId: 1});
    this.server.createList('authentication', 20);

    const userSearch = '.user-search input';
    const secondResult = '.user-search .results li:eq(2)';
    const secondResultUsername = `${secondResult} .name`;
    const secondResultEmail = `${secondResult} .email`;
    const name = '.user-display-name';

    await visit(url);
    await fillIn(userSearch, 'son');
    await triggerEvent(userSearch, 'keyup');
    assert.equal(find(secondResultUsername).textContent.trim(), '1 guy M. Mc1son', 'user name is correct');
    assert.equal(find(secondResultEmail).textContent.trim(), 'user@example.edu', 'user email is correct');

    await click(secondResultUsername);
    assert.equal(currentURL(), '/users/2', 'new user profile is shown');
    assert.equal(find(name).textContent.trim(), '1 guy M. Mc1son', 'user name is shown');
  });
});
