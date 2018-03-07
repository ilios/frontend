import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

let application;
let url = '/users/4136';

module('Acceptance: User', function(hooks) {
  hooks.beforeEach(function() {
    application = startApp();
    let userObject = {
      id: 4136,
      campusId: '123',
      email: 'user@example.edu',
      phone: '111-111-1111',
      primaryCohortId: 1,
      cohortIds: [1, 2, 3],
      learnerGroupIds: [3, 5],
      schoolId: 1
    };

    server.create('school');
    server.create('program');
    server.createList('programYear', 3, { programId: 1});
    server.create('cohort', { title: 'Medicine', programYearId: 1 });
    server.create('cohort', { programYearId: 2 });
    server.create('cohort', { programYearId: 3 });
    server.createList('learnerGroup', 5, { title: 'Group 1', cohortId: 1 });
    setupAuthentication(application, userObject);
  });

  hooks.afterEach(function() {
    run(application, 'destroy');
  });

  test('can search for users', async function(assert) {
    server.createList('user', 20, { email: 'user@example.edu' });
    server.createList('authentication', 20);

    const userSearch = '.user-search input';
    const secondResult = '.user-search .results li:eq(2)';
    const secondResultUsername = `${secondResult} .name`;
    const secondResultEmail = `${secondResult} .email`;
    const name = '.user-display-name';

    await visit(url);
    await fillIn(userSearch, 'son');
    await triggerEvent(userSearch, 'keyup');
    assert.equal(find(secondResultUsername).text().trim(), '1 guy M. Mc1son', 'user name is correct');
    assert.equal(find(secondResultEmail).text().trim(), 'user@example.edu', 'user email is correct');

    await click(secondResultUsername);
    assert.equal(currentURL(), '/users/2', 'new user profile is shown');
    assert.equal(find(name).text().trim(), '1 guy M. Mc1son', 'user name is shown');
  });
});
