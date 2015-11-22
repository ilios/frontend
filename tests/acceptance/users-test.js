import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import { b as testgroup } from 'ilios/tests/helpers/test-groups';

const { run } = Ember;

let application;
let fixtures = {};
let url = '/users';

module(`Acceptance: Users ${testgroup}`, {
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

function getCellContent(i) {
  return find(`tbody tr td:eq(${i})`).text().trim();
}

test('can see list of users and transition to user route', function(assert) {
  const userSchool = '#school-selection';
  const firstStudent = 'tbody tr td:eq(1) a';

  visit(url);
  andThen(() => {
    assert.equal(find(userSchool).text().trim(), 'Medicine', 'user school is shown');
    assert.equal(getCellContent(0), '', 'user is a student');
    assert.equal(getCellContent(1), '', 'name is shown');
    assert.equal(getCellContent(2), '', 'campus ID is shown');
    assert.equal(getCellContent(3), '', 'email is shown');
    assert.equal(getCellContent(4), '', 'primary school is shown');
  });

  click(firstStudent);
  andThen(() => {
    assert.equal(currentURL(), '/user/12323', 'tranistioned to `user` route');
  });
});

test('can page through list of users', function(assert) {
  const leftArrow = '.left-arrow';
  const rightArrow = '.right-arrow';
  const prevButton = '.prev-button';
  const nextButton = '.next-button';

  visit(url);

  click(nextButton);
  andThen(() => {
    assert.equal(currentURL(), '/users?page=2', 'query param shown');
    assert.equal(getCellContent(1), '', 'content is visible');
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
  const userSearch = '.user-search';
  const leftArrow = '.left-arrow';
  const rightArrow = '.right-arrow';

  visit(url);
  fillIn(userSearch, 'John');
  // triggerEvent(userSearch, 'oninput');
  andThen(() => {
    assert.equal(getCellContent(1), '', 'content is visible');
  });

  click(rightArrow);
  andThen(() => {
    assert.equal(currentURL(), '/users', 'no query params for search');
    assert.equal(getCellContent(1), '', 'content is visible');
  });

  click(leftArrow);
  andThen(() => {
    assert.equal(getCellContent(1), '', 'content is visible');
  });
});
