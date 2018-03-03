import { module, test } from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

let application;
module('Acceptance | assign students', {
  beforeEach: function() {
    application = startApp();
    server.createList('school', 2);
    setupAuthentication(application, { id: 4136, schoolId: 1});
  },
  afterEach: function() {
    destroyApp(application);
  }
});

test('visiting /admin/assignstudents', async function(assert) {
  await visit('/admin/assignstudents');

  assert.equal(getElementText('.schoolsfilter'), getText('school 0'));

  assert.equal(currentURL(), '/admin/assignstudents');
});
