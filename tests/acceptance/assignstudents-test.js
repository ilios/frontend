import { test } from 'qunit';
import moduleForAcceptance from 'ilios/tests/helpers/module-for-acceptance';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import startApp from 'ilios/tests/helpers/start-app';
import destroyApp from 'ilios/tests/helpers/destroy-app';

let application;
moduleForAcceptance('Acceptance | assign students', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);

    server.createList('school', 2);

  },
  afterEach: function() {
    destroyApp(application);
  }
});

test('visiting /admin/assignstudents', async function(assert) {
  await visit('/admin/assignstudents');

  assert.equal(getElementText('#school-selection'), getText('school 0'));

  assert.equal(currentURL(), '/admin/assignstudents');
});
