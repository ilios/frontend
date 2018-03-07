import { click, fillIn, currentURL, find, triggerEvent, visit } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

let application;
let url = '/users';

module('Acceptance: Users', function(hooks) {
  hooks.beforeEach(function() {
    application = startApp();
    this.server.create('school');
    setupAuthentication(application, { id: 4136, schoolId: 1, campusId: '123' });

    this.server.createList('user', 90, { schoolId: 1, campusId: '555' });
    this.server.createList('authentication', 90);
  });

  hooks.afterEach(function() {
    run(application, 'destroy');
  });

  function getCellContent(i) {
    return find(`tbody tr td:eq(${i})`).textContent.trim();
  }

  test('can see list of users and transition to user route', async function(assert) {
    const firstStudent = 'tbody tr td:eq(1) a';

    await visit(url);
    assert.equal(getCellContent(0), '', 'user is a student');
    assert.equal(getCellContent(1), '0 guy M. Mc0son', 'name is shown');
    assert.equal(getCellContent(2), '123', 'campus ID is shown');
    assert.equal(getCellContent(3), 'user@example.edu', 'email is shown');
    assert.equal(getCellContent(4), 'school 0', 'primary school is shown');

    await click(firstStudent);
    assert.equal(currentURL(), '/users/4136', 'tranistioned to `user` route');
  });

  test('can page through list of users', async function(assert) {
    const leftArrow = '.backward';
    const rightArrow = '.forward';

    await visit(url);
    await click(rightArrow);
    assert.equal(currentURL(), '/users?offset=25', 'query param shown');

    await click(rightArrow);
    assert.equal(currentURL(), '/users?offset=50', 'query param shown');

    await click(leftArrow);
    assert.equal(currentURL(), '/users?offset=25', 'query param shown');

    await click(leftArrow);
    assert.equal(currentURL(), '/users', 'back to first page');
  });

  test('can search for a user and transition to user route', async function(assert) {
    this.server.createList('user', 40, { firstName: 'Test', lastName: 'Name', schoolId: 1 });

    const userSearch = '.user-search input';
    const firstStudent = 'tbody tr:eq(0) td:eq(1) a';

    await visit(url);
    await fillIn(userSearch, 'Test Name');
    await triggerEvent(userSearch, 'input');

    assert.equal(getCellContent(1), 'Test M. Name', 'content is visible');
    assert.equal(currentURL(), '/users?filter=Test%20Name', 'no query params for search');

    await click(firstStudent);
    assert.equal(currentURL(), '/users/92', 'tranistioned to `user` route');

  });
});
