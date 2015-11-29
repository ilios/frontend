import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';

const { run } = Ember;

let application;
let fixtures = {};
let url = '/users/4136';

module('Acceptance: User', {
  beforeEach() {
    application = startApp();
    authenticateSession();

    fixtures.user = server.create('user', {
      id: 4136,
      campusId: '123',
      email: 'user@example.edu',
      phone: '111-111-1111',
      primaryCohort: 1,
      cohorts: [1, 2, 3],
      learnerGroups: [3, 5]
    });
    server.create('school');
    server.create('cohort', { title: 'Medicine', users: [ 4136 ] });
    server.createList('cohort', 2, {  users: [ 4136 ] });
    server.createList('learnerGroup', 5, { title: 'Group 1', users: [ 4136 ] });
  },

  afterEach() {
    run(application, 'destroy');
  }
});

function getUserContent(i) {
  return find(`.user-info .form-data:eq(${i})`).text().trim();
}

test('can see user profile', function(assert) {
  const name = '.user-display-name';
  const learnerGroups = '.learner-group';
  const secondaryCohorts = '.secondary-cohort';

  visit(url);
  andThen(() => {
    assert.equal(find(name).text().trim(), '0 guy M. Mc0son', 'user name is shown');
    assert.equal(getUserContent(0), '123', 'campus ID is shown');
    assert.equal(getUserContent(1), 'user@example.edu', 'email is shown');
    assert.equal(getUserContent(2), '111-111-1111', 'phone is shown');
    assert.equal(getUserContent(3), 'school 0', 'primary school is shown');
    assert.equal(getUserContent(4), 'Medicine', 'primary cohort is shown');
    assert.equal(find(`${secondaryCohorts}:first`).text(), 'cohort 1', 'secondary cohort is shown');
    assert.equal(find(`${secondaryCohorts}:last`).text(), 'cohort 2', 'secondary cohort is shown');
    assert.equal(find(`${learnerGroups}:first`).text(), 'Group 1', 'learner group is shown');
    assert.equal(find(`${learnerGroups}:last`).text(), 'Group 1', 'learner group is shown');
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
