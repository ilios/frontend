import { module, test } from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import Ember from 'ember';

const { run } = Ember;

let application;
let url = '/users';

module('Acceptance: Users', {
  beforeEach() {
    application = startApp();
    setupAuthentication(application, { id: 4136, campusId: '123', email: 'user@example.edu' });

    server.create('school');
    server.createList('user', 90, { school: 1, campusId: '555', email: 'user@example.edu' });
  },

  afterEach() {
    run(application, 'destroy');
  }
});

function getCellContent(i) {
  return find(`tbody tr td:eq(${i})`).text().trim();
}

test('can see list of users and transition to user route', function(assert) {
  const userSchool = '#school-selection';
  const firstStudent = 'tbody tr td:eq(1) a';

  visit(url);
  andThen(() => {
    assert.equal(find(userSchool).text().trim(), 'school 0', 'user school is shown');
    assert.equal(getCellContent(0), '', 'user is a student');
    assert.equal(getCellContent(1), '0 guy M. Mc0son', 'name is shown');
    assert.equal(getCellContent(2), '123', 'campus ID is shown');
    assert.equal(getCellContent(3), 'user@example.edu', 'email is shown');
    assert.equal(getCellContent(4), 'school 0', 'primary school is shown');
  });

  click(firstStudent);
  andThen(() => {
    assert.equal(currentURL(), '/users/4136', 'tranistioned to `user` route');
  });
});

test('can page through list of users', function(assert) {
  const leftArrow = '.prev-arrow';
  const rightArrow = '.next-arrow';
  const prevButton = '.prev-button';
  const nextButton = '.next-button';

  visit(url);
  click(nextButton);
  andThen(() => {
    assert.equal(currentURL(), '/users?page=2', 'query param shown');
    assert.equal(getCellContent(1), '0 guy M. Mc0son', 'content is visible');
  });

  click(rightArrow);
  andThen(() => {
    assert.equal(currentURL(), '/users?page=3', 'query param shown');
  });

  click(leftArrow);
  andThen(() => {
    assert.equal(currentURL(), '/users?page=2', 'query param shown');
  });

  click(prevButton);
  andThen(() => {
    assert.equal(currentURL(), '/users', 'back to first page');
  });
});

test('can search for a user and transition to user route', function(assert) {
  server.createList('user', 40, { firstName: 'Test', lastName: 'Name', school: 1 });

  const userSearch = '.user-search';
  const leftArrow = '.prev-arrow';
  const rightArrow = '.next-arrow';

  visit(url);
  fillIn(userSearch, 'Test Name');
  triggerEvent(userSearch, 'input');
  andThen(() => {
    assert.equal(getCellContent(1), 'Test M. Name', 'content is visible');
  });

  click(rightArrow);
  andThen(() => {
    assert.equal(currentURL(), '/users', 'no query params for search');
    assert.equal(getCellContent(1), 'Test M. Name', 'content is visible');
  });

  click(leftArrow);
  andThen(() => {
    assert.equal(getCellContent(1), 'Test M. Name', 'content is visible');
  });
});
