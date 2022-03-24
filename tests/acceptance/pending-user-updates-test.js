import { currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from 'ilios/tests/pages/pending-user-updates';

module('Acceptance | pending user updates', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('visiting /admin/userupdates', async function (assert) {
    const school = this.server.create('school');
    await setupAuthentication({ school, administeredSchools: [school] });
    await page.visit();
    assert.strictEqual(currentURL(), '/admin/userupdates');
  });

  test('one school', async function (assert) {
    const school = this.server.create('school');
    await setupAuthentication({ school, administeredSchools: [school] });
    await page.visit();
    assert.strictEqual(page.schoolFilter.text, 'school 0');
    assert.notOk(page.schoolFilter.isSelectable);
  });

  test('multiple schools, default school selection', async function (assert) {
    const schools = this.server.createList('school', 3);
    const usersInSchool1 = this.server.createList('user', 2, { school: schools[0] });
    const userInSchool2 = this.server.create('user', { school: schools[1] });
    this.server.create('pending-user-update', {
      user: usersInSchool1[0],
      type: 'emailMismatch',
      value: 'dev@null.com',
    });
    this.server.create('pending-user-update', {
      user: usersInSchool1[1],
      type: 'emailMismatch',
      value: 'dev@null.com',
    });
    this.server.create('pending-user-update', {
      user: userInSchool2,
      type: 'emailMismatch',
      value: 'dev@null.com',
    });
    await setupAuthentication({ school: schools[0], administeredSchools: schools });
    await page.visit();
    assert.ok(page.schoolFilter.isSelectable);
    assert.strictEqual(page.schoolFilter.options.length, 3);
    assert.ok(page.schoolFilter.options[0].selected);
    assert.notOk(page.schoolFilter.options[1].selected);
    assert.notOk(page.schoolFilter.options[2].selected);
    assert.strictEqual(page.updates.length, 2);
    assert.strictEqual(page.updates[0].userNameInfo.fullName, '0 guy M. Mc0son');
    assert.strictEqual(page.updates[1].userNameInfo.fullName, '1 guy M. Mc1son');
  });

  test('multiple schools, explicit school selection', async function (assert) {
    const schools = this.server.createList('school', 3);
    const usersInSchool1 = this.server.createList('user', 2, { school: schools[0] });
    const userInSchool2 = this.server.create('user', { school: schools[1] });
    this.server.create('pending-user-update', {
      user: usersInSchool1[0],
      type: 'emailMismatch',
      value: 'dev@null.com',
    });
    this.server.create('pending-user-update', {
      user: usersInSchool1[1],
      type: 'emailMismatch',
      value: 'dev@null.com',
    });
    this.server.create('pending-user-update', {
      user: userInSchool2,
      type: 'emailMismatch',
      value: 'dev@null.com',
    });
    await setupAuthentication({ school: schools[0], administeredSchools: schools });
    await page.visit({ school: 2 });
    assert.notOk(page.schoolFilter.options[0].selected);
    assert.ok(page.schoolFilter.options[1].selected);
    assert.notOk(page.schoolFilter.options[2].selected);
    assert.strictEqual(page.updates.length, 1);
    assert.strictEqual(page.updates[0].userNameInfo.fullName, '2 guy M. Mc2son');
  });

  test('pending update types', async function (assert) {
    const school = this.server.create('school');
    const users = this.server.createList('user', 2, { school });
    this.server.create('pending-user-update', {
      user: users[0],
      type: 'emailMismatch',
      value: 'dev@null.com',
    });
    this.server.create('pending-user-update', {
      user: users[1],
      type: 'missingFromDirectory',
    });
    await setupAuthentication({ school, administeredSchools: [school] });
    await page.visit();
    assert.strictEqual(page.updates.length, 2);
    assert.strictEqual(
      page.updates[0].updateType,
      'The email address in the directory (dev@null.com) does not match the email in ilios (user@example.edu).'
    );
    assert.ok(page.updates[0].canUpdateEmailAddress);
    assert.strictEqual(
      page.updates[1].updateType,
      'Unable to find user in the directory, please update, disable, or exclude their account from synchronization.'
    );
    assert.notOk(page.updates[1].canUpdateEmailAddress);
  });

  test('update email address', async function (assert) {
    const school = this.server.create('school');
    const user = this.server.create('user', { school });
    this.server.create('pending-user-update', {
      user,
      type: 'emailMismatch',
      value: 'dev@null.com',
    });
    await setupAuthentication({ school, administeredSchools: [school] });
    await page.visit();

    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    assert.strictEqual(userModel.email, 'user@example.edu');
    assert.strictEqual(page.updates.length, 1);
    assert.strictEqual(
      page.updates[0].updateType,
      'The email address in the directory (dev@null.com) does not match the email in ilios (user@example.edu).'
    );
    await page.updates[0].updateEmailAddress();
    assert.strictEqual(page.updates.length, 0);
    assert.strictEqual(userModel.email, 'dev@null.com');
  });

  test('exclude from sync', async function (assert) {
    const school = this.server.create('school');
    const user = this.server.create('user', {
      school,
      userSyncIgnore: false,
    });
    this.server.create('pending-user-update', {
      user,
      type: 'missingFromDirectory',
    });
    await setupAuthentication({ school, administeredSchools: [school] });
    await page.visit();

    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    assert.notOk(userModel.userSyncIgnore);
    assert.strictEqual(page.updates.length, 1);
    assert.strictEqual(
      page.updates[0].updateType,
      'Unable to find user in the directory, please update, disable, or exclude their account from synchronization.'
    );
    await page.updates[0].excludeFromSync();
    assert.strictEqual(page.updates.length, 0);
    assert.ok(userModel.userSyncIgnore);
  });

  test('disable user', async function (assert) {
    const school = this.server.create('school');
    const user = this.server.create('user', {
      school,
      enabled: true,
    });
    this.server.create('pending-user-update', {
      user,
      type: 'missingFromDirectory',
    });
    await setupAuthentication({ school, administeredSchools: [school] });
    await page.visit();

    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    assert.ok(userModel.enabled);
    assert.strictEqual(page.updates.length, 1);
    assert.strictEqual(
      page.updates[0].updateType,
      'Unable to find user in the directory, please update, disable, or exclude their account from synchronization.'
    );
    await page.updates[0].disableUser();
    assert.strictEqual(page.updates.length, 0);
    assert.notOk(userModel.enabled);
  });
});
