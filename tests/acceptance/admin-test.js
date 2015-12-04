import { module, test } from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import Ember from 'ember';

const { run } = Ember;

let application;
let fixtures = {};
let url = '/admin';

module('Acceptance: Admin', {
  beforeEach() {
    application = startApp();
    authenticateSession();

    fixtures.user = server.create('user', { id: 4136 });
    server.create('school');
  },

  afterEach() {
    run(application, 'destroy');
  }
});

test('can transition to `users` route', function(assert) {
  const button = '.manage-users';

  visit(url);
  click(button);
  andThen(() => {
    assert.equal(currentURL(), '/users', 'transition occurred');
  });
});

test('can search for users', function(assert) {
  server.createList('user', 20, { email: 'user@example.edu' });

  const userSearch = '.global-search input';
  const secondResult = '.global-search .results li:eq(1)';
  const secondResultUsername = `${secondResult} a .livesearch-user-name`;
  const secondResultEmail = `${secondResult} a .livesearch-user-email`;
  const name = '.user-display-name';

  visit(url);
  fillIn(userSearch, 'son');
  triggerEvent(userSearch, 'keyup');
  andThen(() => {
    assert.equal(find(secondResultUsername).text(), '10 guy M. Mc10son', 'user name is correct');
    assert.equal(find(secondResultEmail).text(), 'user@example.edu', 'user email is correct');
  });

  click(secondResultUsername);
  andThen(() => {
    assert.equal(currentURL(), '/users/11', 'new user profile is shown');
    assert.equal(find(name).text(), '10 guy M. Mc10son', 'user name is shown');
  });
});
