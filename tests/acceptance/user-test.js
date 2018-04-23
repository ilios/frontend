import { click, fillIn, currentURL, find, triggerEvent, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance: User', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    let userObject = {
      id: 100,
      campusId: '123',
      email: 'user@example.edu',
      phone: '111-111-1111',
      primaryCohortId: 1,
      cohortIds: [1, 2, 3],
      learnerGroupIds: [3, 5],
      school: this.school
    };
    this.server.create('program', { school: this.school });
    this.server.createList('programYear', 3, { programId: 1});
    this.server.create('cohort', { title: 'Medicine', programYearId: 1 });
    this.server.create('cohort', { programYearId: 2 });
    this.server.create('cohort', { programYearId: 3 });
    this.server.createList('learnerGroup', 5, { title: 'Group 1', cohortId: 1 });
    await setupAuthentication( userObject );
  });

  test('can search for users', async function(assert) {
    this.server.createList('user', 20, { email: 'user@example.edu', school: this.school });
    this.server.createList('authentication', 20);

    const userSearch = '.user-search input';
    const secondResult = '.user-search .results li:nth-of-type(3)';
    const secondResultUsername = `${secondResult} .name`;
    const secondResultEmail = `${secondResult} .email`;
    const name = '.user-display-name';

    await visit('/users/100');
    await fillIn(userSearch, 'son');
    await triggerEvent(userSearch, 'keyup');
    assert.equal(find(secondResultUsername).textContent.trim(), '1 guy M. Mc1son', 'user name is correct');
    assert.equal(find(secondResultEmail).textContent.trim(), 'user@example.edu', 'user email is correct');

    await click(secondResultUsername);
    assert.equal(currentURL(), '/users/2', 'new user profile is shown');
    assert.equal(find(name).textContent.trim(), '1 guy M. Mc1son', 'user name is shown');
  });
});
