import { currentURL, currentRouteName } from '@ember/test-helpers';
import { module, test } from 'qunit';

import page from 'frontend/tests/pages/instructor-groups';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest, takeScreenshot } from 'frontend/tests/helpers';
import percySnapshot from '@percy/ember';

module('Acceptance | Instructor Groups', function (hooks) {
  setupApplicationTest(hooks);

  module('User in single school', function (hooks) {
    hooks.beforeEach(async function () {
      this.school = this.server.create('school');
      this.user = await setupAuthentication({ school: this.school }, true);
    });

    test('visiting /instructorgroups', async function (assert) {
      await page.visit();
      assert.strictEqual(currentRouteName(), 'instructor-groups');
    });

    test('list groups', async function (assert) {
      this.server.createList('user', 5);
      this.server.createList('course', 2, { school: this.school });
      this.server.create('session', {
        courseId: 1,
      });
      this.server.create('session', {
        courseId: 2,
      });
      const firstInstructorGroup = this.server.create('instructor-group', {
        school: this.school,
        userIds: [2, 3, 4, 5, 6],
      });
      const secondInstructorGroup = this.server.create('instructor-group', {
        school: this.school,
      });
      this.server.create('offering', {
        instructorGroupIds: [1],
        sessionId: 1,
      });
      this.server.create('offering', {
        instructorGroupIds: [1],
        sessionId: 2,
      });

      await page.visit();
      await takeScreenshot(assert);
      await percySnapshot(assert);
      assert.strictEqual(page.headerTitle, 'Instructor Groups (2)');
      assert.ok(page.listIsPresent);
      assert.strictEqual(page.list.items.length, 2);
      assert.strictEqual(page.list.items[0].title, firstInstructorGroup.title);
      assert.strictEqual(parseInt(page.list.items[0].users, 10), 5);
      assert.strictEqual(parseInt(page.list.items[0].courses, 10), 2);
      assert.strictEqual(page.list.items[1].title, secondInstructorGroup.title);
      assert.strictEqual(parseInt(page.list.items[1].users, 10), 0);
      assert.strictEqual(parseInt(page.list.items[1].courses, 10), 0);
    });

    test('filters by title', async function (assert) {
      this.server.create('school');
      const firstInstructorGroup = this.server.create('instructor-group', {
        title: 'specialfirstinstructorgroup',
        school: this.school,
      });
      const secondInstructorGroup = this.server.create('instructor-group', {
        title: 'specialsecondinstructorgroup',
        school: this.school,
      });
      const regularInstructorGroup = this.server.create('instructor-group', {
        title: 'regularinstructorgroup',
        school: this.school,
      });
      const regexInstructorGroup = this.server.create('instructor-group', {
        title: '\\yoo hoo',
        school: this.school,
      });
      await page.visit();
      assert.strictEqual(page.headerTitle, 'Instructor Groups (4)');
      assert.strictEqual(page.list.items.length, 4);
      assert.strictEqual(page.list.items[0].title, regexInstructorGroup.title);
      assert.strictEqual(page.list.items[1].title, regularInstructorGroup.title);
      assert.strictEqual(page.list.items[2].title, firstInstructorGroup.title);
      assert.strictEqual(page.list.items[3].title, secondInstructorGroup.title);

      await page.setTitleFilter('first');
      assert.strictEqual(page.headerTitle, 'Instructor Groups (1)');
      assert.strictEqual(page.list.items.length, 1);
      assert.strictEqual(page.list.items[0].title, firstInstructorGroup.title);

      await page.setTitleFilter('  first   ');
      assert.strictEqual(page.headerTitle, 'Instructor Groups (1)');
      assert.strictEqual(page.list.items.length, 1);
      assert.strictEqual(page.list.items[0].title, firstInstructorGroup.title);

      await page.setTitleFilter('second');
      assert.strictEqual(page.headerTitle, 'Instructor Groups (1)');
      assert.strictEqual(page.list.items.length, 1);
      assert.strictEqual(page.list.items[0].title, secondInstructorGroup.title);

      await page.setTitleFilter('special');
      assert.strictEqual(page.headerTitle, 'Instructor Groups (2)');
      assert.strictEqual(page.list.items.length, 2);
      assert.strictEqual(page.list.items[0].title, firstInstructorGroup.title);
      assert.strictEqual(page.list.items[1].title, secondInstructorGroup.title);

      await page.setTitleFilter('\\');
      assert.strictEqual(page.headerTitle, 'Instructor Groups (1)');
      assert.strictEqual(page.list.items.length, 1);
      assert.strictEqual(page.list.items[0].title, regexInstructorGroup.title);

      await page.setTitleFilter('');
      assert.strictEqual(page.headerTitle, 'Instructor Groups (4)');
      assert.strictEqual(page.list.items.length, 4);
      assert.strictEqual(page.list.items[0].title, regexInstructorGroup.title);
      assert.strictEqual(page.list.items[1].title, regularInstructorGroup.title);
      assert.strictEqual(page.list.items[2].title, firstInstructorGroup.title);
      assert.strictEqual(page.list.items[3].title, secondInstructorGroup.title);
    });

    test('add new instructorgroup', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      await page.visit();
      assert.strictEqual(page.headerTitle, 'Instructor Groups (0)');
      const newTitle = 'new test title';
      await page.toggleNewInstructorGroupForm();
      await page.newInstructorGroupForm.title.set(newTitle);
      await page.newInstructorGroupForm.done.click();
      assert.strictEqual(page.savedResult, newTitle + ' saved successfully');
      assert.strictEqual(page.headerTitle, 'Instructor Groups (1)');
      assert.strictEqual(page.list.items.length, 1);
      assert.strictEqual(page.list.items[0].title, newTitle);
      assert.strictEqual(parseInt(page.list.items[0].users, 10), 0);
      assert.strictEqual(parseInt(page.list.items[0].courses, 10), 0);
    });

    test('cancel adding new instructor group', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('instructor-group', {
        school: this.school,
      });
      await page.visit();
      assert.strictEqual(page.list.items.length, 1);
      assert.strictEqual(page.list.items[0].title, 'instructor group 0');
      await page.toggleNewInstructorGroupForm();
      assert.ok(page.newInstructorGroupForm.isVisible);
      await page.newInstructorGroupForm.cancel.click();
      assert.notOk(page.newInstructorGroupForm.isVisible);
      assert.strictEqual(page.list.items.length, 1);
      assert.strictEqual(page.list.items[0].title, 'instructor group 0');
    });

    test('remove instructor group', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('instructor-group', {
        school: this.school,
      });
      await page.visit();
      assert.strictEqual(page.headerTitle, 'Instructor Groups (1)');
      assert.strictEqual(page.list.items.length, 1);
      assert.strictEqual(page.list.items[0].title, 'instructor group 0');
      await page.list.items[0].remove();
      await page.list.confirmRemoval.confirm();
      assert.strictEqual(page.headerTitle, 'Instructor Groups (0)');
      assert.strictEqual(page.list.items.length, 0);
      assert.notOk(page.listIsPresent);
    });

    test('cancel remove instructor group', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('instructor-group', {
        school: this.school,
      });
      await page.visit();
      assert.strictEqual(page.list.items.length, 1);
      assert.strictEqual(page.list.items[0].title, 'instructor group 0');
      await page.list.items[0].remove();
      await page.list.confirmRemoval.cancel();
      assert.strictEqual(page.list.items.length, 1);
      assert.strictEqual(page.list.items[0].title, 'instructor group 0');
    });

    test('confirmation of remove message', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      const users = this.server.createList('user', 5);
      this.server.create('instructor-group', {
        school: this.school,
        users,
      });

      await page.visit();
      assert.strictEqual(page.list.items.length, 1);
      assert.strictEqual(page.list.items[0].title, 'instructor group 0');
      await page.list.items[0].remove();
      assert.strictEqual(
        page.list.confirmRemoval.message,
        'Are you sure you want to delete this instructor group, with 5 instructors? This action cannot be undone. Yes Cancel',
      );
    });

    test('click title takes you to instructor group route', async function (assert) {
      this.server.create('instructor-group', {
        school: this.school,
      });
      await page.visit();
      await page.list.items[0].clickTitle();
      assert.strictEqual(currentURL(), '/instructorgroups/1');
    });

    test('title filter escapes regex', async function (assert) {
      this.server.create('instructor-group', {
        title: 'yes\\no',
        school: this.school,
      });
      await page.visit();
      assert.strictEqual(page.list.items.length, 1);
      assert.strictEqual(page.list.items[0].title, 'yes\\no');
      await page.setTitleFilter('\\');
      assert.strictEqual(page.list.items.length, 1);
      assert.strictEqual(page.list.items[0].title, 'yes\\no');
    });

    test('cannot delete instructor group with attached courses #3767', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      const group1 = this.server.create('instructor-group', {
        school: this.school,
      });
      const group2 = this.server.create('instructor-group', {
        school: this.school,
      });
      const course = this.server.create('course');
      const session1 = this.server.create('session', { course });
      const session2 = this.server.create('session', { course });
      this.server.create('ilm-session', { session: session1, instructorGroups: [group1] });
      this.server.create('offering', { session: session2, instructorGroups: [group2] });
      await page.visit();
      assert.strictEqual(page.list.items.length, 2);
      assert.strictEqual(page.list.items[0].title, 'instructor group 0');
      assert.strictEqual(page.list.items[1].title, 'instructor group 1');
      assert.notOk(page.list.items[0].canBeDeleted);
      assert.notOk(page.list.items[1].canBeDeleted);
    });
  });

  test('filters options', async function (assert) {
    const schools = this.server.createList('school', 2);
    await setupAuthentication({ school: schools[1] }, true);

    await page.visit();
    await takeScreenshot(assert);
    await percySnapshot(assert);
    assert.strictEqual(page.schoolFilter.schools.length, 2);
    assert.strictEqual(page.schoolFilter.schools[0].text, 'school 0');
    assert.strictEqual(page.schoolFilter.schools[1].text, 'school 1');
    assert.strictEqual(parseInt(page.schoolFilter.selectedSchool, 10), 2);
  });
});
