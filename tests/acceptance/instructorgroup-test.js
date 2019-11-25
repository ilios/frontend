import {
  currentRouteName,
  visit,
  currentURL,
} from '@ember/test-helpers';
import {
  module,
  test
} from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from '../pages/instructor-group';

const url = '/instructorgroups/1';

module('Acceptance | Instructor Group Details', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
    this.server.createList('user', 4);
    this.server.createList('course', 2, {
      school: this.school
    });
    this.server.create('session', {
      courseId: 1,
    });
    this.server.create('session', {
      courseId: 2,
    });
    this.server.create('instructorGroup', {
      school: this.school,
      userIds: [2,3],
    });
    this.server.create('instructorGroup', {
      school: this.school,
    });
    this.server.create('instructorGroup', {
      school: this.school
    });
    this.server.create('offering', {
      sessionId: 1,
      instructorGroupIds: [1]
    });
    this.server.create('offering', {
      sessionId: 2,
      instructorGroupIds: [2]
    });
    this.server.create('offering', {
      sessionId: 2,
      instructorGroupIds: [1]
    });
  });

  test('check fields', async function(assert) {
    await visit(url);
    assert.equal(currentRouteName(), 'instructorGroup');
    assert.equal(page.header.schoolTitle, 'school 0 >');
    assert.equal(page.header.groupTitle.text, 'instructor group 0');
    assert.equal(page.header.membersInfo, 'Members: 2');
    assert.equal(page.details.title, 'instructor group 0 Members (2)');

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
    assert.equal(page.header.groupTitle.text, 'instructor group 0');
    await page.header.groupTitle.edit();
    assert.equal(page.header.groupTitle.inputValue, 'instructor group 0');
    page.header.groupTitle.fillInput('test new title');
    await page.header.groupTitle.save();
    assert.equal(page.header.groupTitle.text, 'test new title');
  });

  test('search instructors', async function(assert) {
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

  test('add instructor', async function(assert) {
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

  test('remove instructor', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    await visit(url);
    assert.equal(page.details.list.length, 2);
    assert.equal(page.details.list[0].name, '1 guy M. Mc1son');
    assert.equal(page.details.list[1].name, '2 guy M. Mc2son');
    await page.details.list[0].remove();
    assert.equal(page.details.list.length, 1);
    assert.equal(page.details.list[0].name, '2 guy M. Mc2son');
  });

  test('follow link to course', async function(assert) {
    await visit(url);
    await page.associatedCourses.list[0].visit();
    assert.equal(currentURL(), '/courses/1');
  });

  test('no associated courses', async function(assert) {
    await visit('/instructorgroups/3');
    assert.equal(page.header.schoolTitle, 'school 0 >');
    assert.equal(page.header.groupTitle.text, 'instructor group 2');
    assert.equal(page.associatedCourses.text, 'Associated Courses: None');
  });
});
