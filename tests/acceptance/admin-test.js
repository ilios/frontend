import { module, test } from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

let application;
let url = '/admin';

module('Acceptance: Admin', {
  beforeEach() {
    application = startApp();
    setupAuthentication(application);
    server.create('school');
  },

  afterEach() {
    destroyApp(application);
  }
});

test('can transition to `users` route', function(assert) {
  const button = '.manage-users-summary a:eq(0)';

  assert.equal(url, '/user', 'transition occurred');

  visit(url);
  click(button);
  andThen(() => {
    assert.equal(currentURL(), '/users', 'transition occurred');
  });
});
