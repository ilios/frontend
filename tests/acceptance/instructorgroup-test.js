import { currentRouteName, visit, currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from '../pages/instructor-group';

const url = '/instructorgroups/1';

module('Acceptance | Instructor Group Details', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
    const users = this.server.createList('user', 4);
    const courses = this.server.createList('course', 2, {
      school: this.school,
    });
    const sessionType = this.server.create('session-type');
    const session1 = this.server.create('session', {
      course: courses[0],
      sessionType,
    });
    const session2 = this.server.create('session', {
      course: courses[1],
      sessionType,
    });
    const instructorGroup1 = this.server.create('instructorGroup', {
      school: this.school,
      users: [users[0], users[1]],
    });
    const instructorGroup2 = this.server.create('instructorGroup', {
      school: this.school,
    });
    this.server.create('instructorGroup', {
      school: this.school,
    });
    this.server.create('offering', {
      session: session1,
      instructorGroups: [instructorGroup1],
    });
    this.server.create('offering', {
      session: session2,
      instructorGroups: [instructorGroup2],
    });
    this.server.create('offering', {
      session: session2,
      instructorGroups: [instructorGroup1],
    });
  });

  test('check fields', async function (assert) {
    await visit(url);
    assert.strictEqual(currentRouteName(), 'instructorGroup');
    assert.strictEqual(page.details.header.title.text, 'instructor group 0');
    assert.strictEqual(page.details.header.members, 'Members: 2');
    assert.strictEqual(page.details.header.breadcrumb.crumbs.length, 3);
    assert.strictEqual(page.details.header.breadcrumb.crumbs[0].text, 'Instructor Groups');
    assert.strictEqual(page.details.header.breadcrumb.crumbs[1].text, 'school 0');
    assert.strictEqual(page.details.header.breadcrumb.crumbs[2].text, 'instructor group 0');
    assert.strictEqual(page.details.overview.users.length, 2);
    assert.strictEqual(page.details.overview.users[0].userNameInfo.fullName, '1 guy M. Mc1son');
    assert.strictEqual(page.details.overview.users[1].userNameInfo.fullName, '2 guy M. Mc2son');
    assert.strictEqual(page.details.overview.courses.length, 2);
    assert.strictEqual(page.details.overview.courses[0].text, 'course 0');
    assert.strictEqual(page.details.overview.courses[1].text, 'course 1');
  });

  test('change title', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await visit(url);
    assert.strictEqual(page.details.header.title.text, 'instructor group 0');
    await page.details.header.title.edit();
    assert.strictEqual(page.details.header.title.value, 'instructor group 0');
    await page.details.header.title.set('test new title');
    await page.details.header.title.save();
    assert.strictEqual(page.details.header.title.text, 'test new title');
  });

  test('search instructors', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await visit(url);
    await page.details.overview.search.searchBox.set('guy');
    assert.strictEqual(page.details.overview.search.results.items.length, 5);
    assert.strictEqual(
      page.details.overview.search.results.items[0].text,
      '0 guy M. Mc0son user@example.edu'
    );
    assert.strictEqual(
      page.details.overview.search.results.items[1].text,
      '1 guy M. Mc1son user@example.edu'
    );
    assert.strictEqual(
      page.details.overview.search.results.items[2].text,
      '2 guy M. Mc2son user@example.edu'
    );
    assert.strictEqual(
      page.details.overview.search.results.items[3].text,
      '3 guy M. Mc3son user@example.edu'
    );
    assert.strictEqual(
      page.details.overview.search.results.items[4].text,
      '4 guy M. Mc4son user@example.edu'
    );
  });

  test('add instructor', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await visit(url);
    assert.strictEqual(page.details.overview.users.length, 2);
    assert.strictEqual(page.details.overview.users[0].userNameInfo.fullName, '1 guy M. Mc1son');
    assert.strictEqual(page.details.overview.users[1].userNameInfo.fullName, '2 guy M. Mc2son');
    await page.details.overview.search.searchBox.set('guy');
    await page.details.overview.search.results.items[3].click();
    assert.strictEqual(page.details.overview.users.length, 3);
    assert.strictEqual(page.details.overview.users[0].userNameInfo.fullName, '1 guy M. Mc1son');
    assert.strictEqual(page.details.overview.users[1].userNameInfo.fullName, '2 guy M. Mc2son');
    assert.strictEqual(page.details.overview.users[2].userNameInfo.fullName, '3 guy M. Mc3son');
  });

  test('remove instructor', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await visit(url);
    assert.strictEqual(page.details.overview.users.length, 2);
    assert.strictEqual(page.details.overview.users[0].userNameInfo.fullName, '1 guy M. Mc1son');
    assert.strictEqual(page.details.overview.users[1].userNameInfo.fullName, '2 guy M. Mc2son');
    await page.details.overview.users[1].remove();
    assert.strictEqual(page.details.overview.users.length, 1);
    assert.strictEqual(page.details.overview.users[0].userNameInfo.fullName, '1 guy M. Mc1son');
  });

  test('follow link to course', async function (assert) {
    await visit(url);
    await page.details.overview.courses[0].visit();
    assert.strictEqual(currentURL(), '/courses/1');
  });

  test('no associated courses', async function (assert) {
    await visit('/instructorgroups/3');
    assert.strictEqual(page.details.header.breadcrumb.crumbs.length, 3);
    assert.strictEqual(page.details.header.breadcrumb.crumbs[0].text, 'Instructor Groups');
    assert.strictEqual(page.details.header.breadcrumb.crumbs[1].text, 'school 0');
    assert.strictEqual(page.details.header.breadcrumb.crumbs[2].text, 'instructor group 2');
    assert.strictEqual(page.details.overview.courses[0].text, 'None');
  });
});
