import { module, test } from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import Ember from 'ember';

const { run } = Ember;

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
    assert.equal(getUserContent(4).search(/school 0\s+\|\s+program 0\s+\|\s+Medicine/), 0, 'primary cohort is shown');
    assert.ok(find(`${secondaryCohorts}:first`).text().search(/school 0\s+\|\s+program 0\s+\|\s+cohort 2/) > 0, 'secondary cohort is shown');
    assert.ok(find(`${secondaryCohorts}:last`).text().search(/school 0\s+\|\s+program 0\s+\|\s+cohort 1/) > 0, 'secondary cohort is shown');
    assert.equal(find(`${learnerGroups}:first`).text(), 'Group 1', 'learner group is shown');
    assert.equal(find(`${learnerGroups}:last`).text(), 'Group 1', 'learner group is shown');
  });
});

test('can search for users', function(assert) {
  server.createList('user', 20, { email: 'user@example.edu' });

  const userSearch = '.global-search input';
  const secondResult = '.global-search .results li:eq(2)';
  const secondResultUsername = `${secondResult} a .livesearch-user-name`;
  const secondResultEmail = `${secondResult} a .livesearch-user-email`;
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

function clickCheckBox(i) {
  return click(`.user-permissions-row input:eq(${i})`);
}

function checkMarked(i) {
  return find(`.user-permissions-row input:eq(${i})`).prop('checked');
}

test('can set user-roles', function(assert) {
  server.create('userRole', { title: 'Course Director'});
  server.create('userRole', { title: 'Faculty'});
  server.create('userRole', { title: 'Developer'});
  server.create('userRole', { title: 'Former Student'});

  visit(url);
  andThen(() => {
    assert.notOk(checkMarked(0), 'unchecked: Course Director');
    assert.notOk(checkMarked(1), 'unchecked: Instructor');
    assert.notOk(checkMarked(2), 'unchecked: Developer');
    assert.notOk(checkMarked(3), 'unchecked: Former Student');
    assert.notOk(checkMarked(4), 'unchecked: Disable User');
    assert.notOk(checkMarked(5), 'unchecked: Exclude From Sync');
  });

  clickCheckBox(0);
  clickCheckBox(1);
  clickCheckBox(2);
  clickCheckBox(3);
  clickCheckBox(4);
  clickCheckBox(5);
  andThen(() => {
    assert.ok(checkMarked(0), 'checked: Course Director');
    assert.ok(checkMarked(1), 'checked: Instructor');
    assert.ok(checkMarked(2), 'checked: Developer');
    assert.ok(checkMarked(3), 'checked: Former Student');
    assert.ok(checkMarked(4), 'checked: Disable User');
    assert.ok(checkMarked(5), 'checked: Exclude From Sync');
  });

  clickCheckBox(0);
  clickCheckBox(1);
  clickCheckBox(2);
  clickCheckBox(3);
  clickCheckBox(4);
  clickCheckBox(5);
  andThen(() => {
    assert.notOk(checkMarked(0), 'unchecked: Course Director');
    assert.notOk(checkMarked(1), 'unchecked: Instructor');
    assert.notOk(checkMarked(2), 'unchecked: Developer');
    assert.notOk(checkMarked(3), 'unchecked: Former Student');
    assert.notOk(checkMarked(4), 'unchecked: Disable User');
    assert.notOk(checkMarked(5), 'unchecked: Exclude From Sync');
  });
});
