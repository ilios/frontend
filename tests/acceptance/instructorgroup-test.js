import { currentRouteName, visit, currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
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
    assert.equal(currentRouteName(), 'instructorGroup');
    assert.equal(page.details.header.title.text, 'instructor group 0');
    assert.equal(page.details.header.members, 'Members: 2');
    assert.equal(page.details.header.breadcrumb.crumbs.length, 3);
    assert.equal(page.details.header.breadcrumb.crumbs[0].text, 'Instructor Groups');
    assert.equal(page.details.header.breadcrumb.crumbs[1].text, 'school 0');
    assert.equal(page.details.header.breadcrumb.crumbs[2].text, 'instructor group 0');

    assert.equal(page.details.list.length, 2);
    assert.equal(page.details.list[0].name, '1 guy M. Mc1son');
    assert.equal(page.details.list[1].name, '2 guy M. Mc2son');

    assert.equal(page.associatedCourses.list.length, 2);
    assert.equal(page.associatedCourses.list[0].title, 'course 0');
    assert.equal(page.associatedCourses.list[1].title, 'course 1');
  });

  test('change title', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await visit(url);
    assert.equal(page.details.header.title.text, 'instructor group 0');
    await page.details.header.title.edit();
    assert.equal(page.details.header.title.value, 'instructor group 0');
    await page.details.header.title.set('test new title');
    await page.details.header.title.save();
    assert.equal(page.details.header.title.text, 'test new title');
  });

  test('search instructors', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await visit(url);
    await page.search.input.fillInput('guy');
    assert.equal(page.search.results.length, 5);
    assert.equal(page.search.results[0].text, '0 guy M. Mc0son user@example.edu');
    assert.equal(page.search.results[1].text, '1 guy M. Mc1son user@example.edu');
    assert.equal(page.search.results[2].text, '2 guy M. Mc2son user@example.edu');
    assert.equal(page.search.results[3].text, '3 guy M. Mc3son user@example.edu');
    assert.equal(page.search.results[4].text, '4 guy M. Mc4son user@example.edu');
  });

  test('add instructor', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await visit(url);

    assert.equal(page.details.list.length, 2);
    assert.equal(page.details.list[0].name, '1 guy M. Mc1son');
    assert.equal(page.details.list[1].name, '2 guy M. Mc2son');

    await page.search.input.fillInput('guy');
    await page.search.results[3].add();

    assert.equal(page.details.list.length, 3);
    assert.equal(page.details.list[0].name, '1 guy M. Mc1son');
    assert.equal(page.details.list[1].name, '2 guy M. Mc2son');
    assert.equal(page.details.list[2].name, '3 guy M. Mc3son');
  });

  test('remove instructor', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await visit(url);
    assert.equal(page.details.list.length, 2);
    assert.equal(page.details.list[0].name, '1 guy M. Mc1son');
    assert.equal(page.details.list[1].name, '2 guy M. Mc2son');
    await page.details.list[0].remove();
    assert.equal(page.details.list.length, 1);
    assert.equal(page.details.list[0].name, '2 guy M. Mc2son');
  });

  test('follow link to course', async function (assert) {
    await visit(url);
    await page.associatedCourses.list[0].visit();
    assert.equal(currentURL(), '/courses/1');
  });

  test('no associated courses', async function (assert) {
    await visit('/instructorgroups/3');
    assert.equal(page.details.header.breadcrumb.crumbs.length, 3);
    assert.equal(page.details.header.breadcrumb.crumbs[0].text, 'Instructor Groups');
    assert.equal(page.details.header.breadcrumb.crumbs[1].text, 'school 0');
    assert.equal(page.details.header.breadcrumb.crumbs[2].text, 'instructor group 2');
    assert.equal(page.associatedCourses.text, 'Associated Courses: None');
  });
});
