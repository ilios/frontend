import { click, fillIn, currentURL, find, triggerEvent, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from 'ilios/tests/pages/user';
import { percySnapshot } from 'ember-percy';

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
    percySnapshot(assert);
    assert.equal(find(secondResultUsername).textContent.trim(), '1 guy M. Mc1son', 'user name is correct');
    assert.equal(find(secondResultEmail).textContent.trim(), 'user@example.edu', 'user email is correct');

    await click(secondResultUsername);
    assert.equal(currentURL(), '/users/2', 'new user profile is shown');
    assert.equal(find(name).textContent.trim(), '1 guy M. Mc1son', 'user name is shown');
  });

  test('User roles display', async function (assert) {
    const studentRole = this.server.create('user-role', {
      title: 'Student',
    });
    const formerStudentRole = this.server.create('user-role', {
      title: 'Former Student',
    });
    const user1 = this.server.create('user', {
      enabled: true,
      userSyncIgnore: true,
      roles: [studentRole, formerStudentRole],
      school: this.school
    });
    const user2 = this.server.create('user', {
      enabled: false,
      userSyncIgnore: false,
      roles: [],
      school: this.school
    });
    await page.visit({ userId: user1.id });
    percySnapshot(assert);
    assert.equal(page.roles.student.value, 'Yes');
    assert.equal(page.roles.student.label, 'Student:');
    assert.equal(page.roles.formerStudent.value, 'Yes');
    assert.equal(page.roles.formerStudent.label, 'Former Student:');
    assert.equal(page.roles.enabled.value, 'Yes');
    assert.equal(page.roles.enabled.label, 'Account Enabled:');
    assert.equal(page.roles.excludeFromSync.value, 'Yes');
    assert.equal(page.roles.excludeFromSync.label, 'Exclude From Sync:');
    await page.roles.manage();
    percySnapshot(assert);
    assert.ok(page.roles.formerStudent.selected);
    assert.ok(page.roles.enabled.selected);
    assert.ok(page.roles.excludeFromSync.selected);

    await page.visit({ userId: user2.id });
    percySnapshot(assert);
    assert.equal(page.roles.student.value, 'No');
    assert.equal(page.roles.student.label, 'Student:');
    assert.equal(page.roles.formerStudent.value, 'No');
    assert.equal(page.roles.formerStudent.label, 'Former Student:');
    assert.equal(page.roles.enabled.value, 'No');
    assert.equal(page.roles.enabled.label, 'Account Enabled:');
    assert.equal(page.roles.excludeFromSync.value, 'No');
    assert.equal(page.roles.excludeFromSync.label, 'Exclude From Sync:');
    await page.roles.manage();
    percySnapshot(assert);
    assert.notOk(page.roles.formerStudent.selected);
    assert.notOk(page.roles.enabled.selected);
    assert.notOk(page.roles.excludeFromSync.selected);
  });

  test('Change user roles #3887', async function (assert) {
    const studentRole = this.server.create('user-role', {
      title: 'Student',
    });
    const formerStudentRole = this.server.create('user-role', {
      title: 'Former Student',
    });
    const user = this.server.create('user', {
      enabled: true,
      userSyncIgnore: true,
      roles: [studentRole, formerStudentRole],
      school: this.school
    });
    await page.visit({ userId: user.id });
    assert.equal(page.roles.student.value, 'Yes');
    assert.equal(page.roles.formerStudent.value, 'Yes');
    assert.equal(page.roles.enabled.value, 'Yes');
    assert.equal(page.roles.excludeFromSync.value, 'Yes');
    await page.roles.manage();
    assert.ok(page.roles.formerStudent.selected);
    assert.ok(page.roles.enabled.selected);
    assert.ok(page.roles.excludeFromSync.selected);
    await page.roles.formerStudent.click();
    await page.roles.enabled.click();
    await page.roles.excludeFromSync.click();
    assert.notOk(page.roles.formerStudent.selected);
    assert.notOk(page.roles.enabled.selected);
    assert.notOk(page.roles.excludeFromSync.selected);

    await page.roles.save();
    assert.equal(page.roles.student.value, 'Yes');
    assert.equal(page.roles.formerStudent.value, 'No');
    assert.equal(page.roles.enabled.value, 'No');
    assert.equal(page.roles.excludeFromSync.value, 'No');
    await page.visit({ userId: user.id });
    assert.equal(page.roles.student.value, 'Yes');
    assert.equal(page.roles.formerStudent.value, 'No');
    assert.equal(page.roles.enabled.value, 'No');
    assert.equal(page.roles.excludeFromSync.value, 'No');

  });
});
