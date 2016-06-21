import { module, test } from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import Ember from 'ember';

const { run } = Ember;

let application;
let url = '/admin';

module('Acceptance: Admin', {
  beforeEach() {
    application = startApp();
    setupAuthentication(application);
    server.create('school');
  },

  afterEach() {
    run(application, 'destroy');
  }
});

test('can transition to `users` route', function(assert) {
  const button = '.manage-users-summary a:eq(0)';

  visit(url);
  click(button);
  andThen(() => {
    assert.equal(currentURL(), '/users', 'transition occurred');
  });
});

test('can search for users', function(assert) {
  server.createList('user', 20, { email: 'user@example.edu' });

  const userSearch = '.user-search input';
  const secondResult = '.user-search .results li:eq(2)';
  const secondResultUsername = `${secondResult} a .name`;
  const secondResultEmail = `${secondResult} a .email`;
  const name = '.user-display-name';

  visit(url);
  fillIn(userSearch, 'son');
  triggerEvent(userSearch, 'keyup');
  andThen(() => {
    assert.equal(find(secondResultUsername).text().trim(), '1 guy M. Mc1son', 'user name is correct');
    assert.equal(find(secondResultEmail).text().trim(), 'user@example.edu', 'user email is correct');
  });

  click(secondResultUsername);
  andThen(() => {
    assert.equal(currentURL(), '/users/2', 'new user profile is shown');
    assert.equal(find(name).text().trim(), '1 guy M. Mc1son', 'user name is shown');
  });
});
