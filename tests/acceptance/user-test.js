import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import { b as testgroup } from 'ilios/tests/helpers/test-groups';

const { run } = Ember;

let application;
let fixtures = {};
let url = '/users/4136';

module(`Acceptance: User ${testgroup}`, {
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

function getUserContent(i) {
  return find(`.user-info .form-data:eq(${i})`).text().trim();
}

test('can see user profile', function(assert) {
  const name = '.user-display-name';

  visit(url);
  andThen(() => {
    assert.equal(find(name), '', 'user name is shown');
    assert.equal(getUserContent(0), '', 'campus ID is shown');
    assert.equal(getUserContent(1), '', 'email is shown');
    assert.equal(getUserContent(2), '', 'phone is shown');
    assert.equal(getUserContent(3), '', 'primary school is shown');
    assert.equal(getUserContent(4), '', 'primary cohort is shown');
    // assert for sec Cohorts
    // assert for learner groups
  });
});

test('can search for users', function(assert) {
  const userSearch = '.global-search input';
  const firstResult = '';

  visit(url);
  fillIn(userSearch, 'John');
  andThen(() => {
    // assert choice shown
  });

  click(firstResult);
  andThen(() => {
    assert.equal(currentURL(), '/users/23232', 'new user profile is shown');
    // assert profile info
  });
});
