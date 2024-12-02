import { currentRouteName, visit, currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'frontend/tests/helpers';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import page from '../pages/instructor-group';

const url = '/instructorgroups/1';
import percySnapshot from '@percy/ember';

module('Acceptance | Instructor Group', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school }, true);
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
    const instructorGroup1 = this.server.create('instructor-group', {
      school: this.school,
      users: [users[0], users[1]],
    });
    const instructorGroup2 = this.server.create('instructor-group', {
      school: this.school,
    });
    this.server.create('instructor-group', {
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

  test('it renders', async function (assert) {
    assert.expect(13);
    await visit(url);
    await percySnapshot(assert);
    assert.strictEqual(currentRouteName(), 'instructor-group');
    assert.strictEqual(page.root.header.title.text, 'instructor group 0');
    assert.strictEqual(page.root.header.members, 'Members: 2');
    assert.strictEqual(page.root.header.breadcrumb.crumbs.length, 3);
    assert.strictEqual(page.root.header.breadcrumb.crumbs[0].text, 'Instructor Groups');
    assert.strictEqual(page.root.header.breadcrumb.crumbs[1].text, 'school 0');
    assert.strictEqual(page.root.header.breadcrumb.crumbs[2].text, 'instructor group 0');
    assert.strictEqual(page.root.users.users.length, 2);
    assert.strictEqual(page.root.users.users[0].userNameInfo.fullName, '1 guy M. Mc1son');
    assert.strictEqual(page.root.users.users[0].userNameInfo.fullName, '1 guy M. Mc1son');
    assert.strictEqual(page.root.users.users[1].userNameInfo.fullName, '2 guy M. Mc2son');
    assert.strictEqual(page.root.courses.courses.length, 2);
    await a11yAudit();
    assert.ok(true, 'no a11y errors found!');
  });

  test('course year shows as single year if calendar year boundary IS NOT crossed', async function (assert) {
    await setupAuthentication({ school: this.school });
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: false,
          apiVersion,
        },
      };
    });
    await visit(url);
    assert.strictEqual(page.root.courses.courses[0].text, 'course 0 (2013)');
    assert.strictEqual(page.root.courses.courses[1].text, 'course 1 (2013)');
  });

  test('course year shows as range if calendar year boundary IS crossed', async function (assert) {
    await setupAuthentication({ school: this.school });
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
          apiVersion,
        },
      };
    });
    await visit(url);
    assert.strictEqual(page.root.courses.courses[0].text, 'course 0 (2013 - 2014)');
    assert.strictEqual(page.root.courses.courses[1].text, 'course 1 (2013 - 2014)');
  });

  test('change title', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await visit(url);
    assert.strictEqual(page.root.header.title.text, 'instructor group 0');
    await page.root.header.title.edit();
    assert.strictEqual(page.root.header.title.value, 'instructor group 0');
    await page.root.header.title.set('test new title');
    await page.root.header.title.save();
    assert.strictEqual(page.root.header.title.text, 'test new title');
  });

  test('add instructor', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await visit(url);
    assert.strictEqual(page.root.users.users.length, 2);
    assert.strictEqual(page.root.users.users[0].userNameInfo.fullName, '1 guy M. Mc1son');
    assert.strictEqual(page.root.users.users[1].userNameInfo.fullName, '2 guy M. Mc2son');
    assert.strictEqual(page.root.header.members, 'Members: 2');
    await page.root.users.manage.click();
    assert.strictEqual(page.root.users.manager.selectedInstructors.users.length, 2);
    assert.strictEqual(
      page.root.users.manager.selectedInstructors.users[0].userNameInfo.fullName,
      '1 guy M. Mc1son',
    );
    assert.strictEqual(
      page.root.users.manager.selectedInstructors.users[1].userNameInfo.fullName,
      '2 guy M. Mc2son',
    );
    await page.root.users.manager.availableInstructors.userSearch.searchBox.set('guy');
    assert.strictEqual(
      page.root.users.manager.availableInstructors.userSearch.results.items.length,
      5,
    );
    assert.strictEqual(
      page.root.users.manager.availableInstructors.userSearch.results.items[0].text,
      '0 guy M. Mc0son user@example.edu',
    );
    assert.strictEqual(
      page.root.users.manager.availableInstructors.userSearch.results.items[1].text,
      '1 guy M. Mc1son user@example.edu',
    );
    assert.strictEqual(
      page.root.users.manager.availableInstructors.userSearch.results.items[2].text,
      '2 guy M. Mc2son user@example.edu',
    );
    assert.strictEqual(
      page.root.users.manager.availableInstructors.userSearch.results.items[3].text,
      '3 guy M. Mc3son user@example.edu',
    );
    assert.strictEqual(
      page.root.users.manager.availableInstructors.userSearch.results.items[4].text,
      '4 guy M. Mc4son user@example.edu',
    );
    await page.root.users.manager.availableInstructors.userSearch.results.items[3].click();
    assert.strictEqual(page.root.users.manager.selectedInstructors.users.length, 3);
    assert.strictEqual(
      page.root.users.manager.selectedInstructors.users[0].userNameInfo.fullName,
      '1 guy M. Mc1son',
    );
    assert.strictEqual(
      page.root.users.manager.selectedInstructors.users[1].userNameInfo.fullName,
      '2 guy M. Mc2son',
    );
    assert.strictEqual(
      page.root.users.manager.selectedInstructors.users[2].userNameInfo.fullName,
      '3 guy M. Mc3son',
    );
    await page.root.users.save.click();
    assert.strictEqual(page.root.users.users.length, 3);
    assert.strictEqual(page.root.users.users[0].userNameInfo.fullName, '1 guy M. Mc1son');
    assert.strictEqual(page.root.users.users[1].userNameInfo.fullName, '2 guy M. Mc2son');
    assert.strictEqual(page.root.users.users[2].userNameInfo.fullName, '3 guy M. Mc3son');
    assert.strictEqual(page.root.header.members, 'Members: 3');
  });

  test('remove instructor', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await visit(url);
    assert.strictEqual(page.root.users.users.length, 2);
    assert.strictEqual(page.root.users.users[0].userNameInfo.fullName, '1 guy M. Mc1son');
    assert.strictEqual(page.root.users.users[1].userNameInfo.fullName, '2 guy M. Mc2son');
    assert.strictEqual(page.root.header.members, 'Members: 2');
    await page.root.users.manage.click();
    assert.strictEqual(page.root.users.manager.selectedInstructors.users.length, 2);
    assert.strictEqual(
      page.root.users.manager.selectedInstructors.users[0].userNameInfo.fullName,
      '1 guy M. Mc1son',
    );
    assert.strictEqual(
      page.root.users.manager.selectedInstructors.users[1].userNameInfo.fullName,
      '2 guy M. Mc2son',
    );
    await page.root.users.manager.selectedInstructors.users[0].remove();
    assert.strictEqual(page.root.users.manager.selectedInstructors.users.length, 1);
    assert.strictEqual(
      page.root.users.manager.selectedInstructors.users[0].userNameInfo.fullName,
      '2 guy M. Mc2son',
    );
    await page.root.users.save.click();
    assert.strictEqual(page.root.users.users.length, 1);
    assert.strictEqual(page.root.users.users[0].userNameInfo.fullName, '2 guy M. Mc2son');
    assert.strictEqual(page.root.header.members, 'Members: 1');
  });

  test('follow link to course', async function (assert) {
    await visit(url);
    await page.root.courses.courses[0].visit();
    assert.strictEqual(currentURL(), '/courses/1');
  });

  test('no associated courses', async function (assert) {
    await visit('/instructorgroups/3');
    assert.strictEqual(page.root.header.breadcrumb.crumbs.length, 3);
    assert.strictEqual(page.root.header.breadcrumb.crumbs[0].text, 'Instructor Groups');
    assert.strictEqual(page.root.header.breadcrumb.crumbs[1].text, 'school 0');
    assert.strictEqual(page.root.header.breadcrumb.crumbs[2].text, 'instructor group 2');
    assert.strictEqual(page.root.courses.title, 'Associated Courses (0)');
    assert.strictEqual(page.root.courses.courses.length, 0);
  });
});
