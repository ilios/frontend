import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

let application;
let url = '/users/4136';

module('Acceptance: User', {
  beforeEach() {
    application = startApp();
    let userObject = {
      id: 4136,
      campusId: '123',
      email: 'user@example.edu',
      phone: '111-111-1111',
      primaryCohort: 1,
      cohorts: [1, 2, 3],
      learnerGroups: [3, 5]
    };
    setupAuthentication(application, userObject);

    server.create('school', { programs: [1]});
    server.create('program', {programYears: [1, 2, 3]});
    server.createList('programYear', 3, { program: 1});
    server.create('cohort', { title: 'Medicine', users: [ 4136 ], learnerGroups: [1, 2, 3, 4, 5] });
    server.createList('cohort', 2, {  users: [ 4136 ] });
    server.createList('learnerGroup', 5, { title: 'Group 1', users: [ 4136 ], cohort: 1 });
  },

  afterEach() {
    run(application, 'destroy');
  }
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
