import {
  currentURL,
  currentRouteName
} from '@ember/test-helpers';
import {
  module,
  test
} from 'qunit';

import page from 'ilios/tests/pages/instructor-groups';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Instructor Groups', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('User in single school', function (hooks) {
    hooks.beforeEach(async function () {
      this.school = this.server.create('school');
      this.user = await setupAuthentication( { school: this.school } );
    });

    test('visiting /instructorgroups', async function(assert) {
      await page.visit();
      assert.equal(currentRouteName(), 'instructorGroups');
    });

    test('list groups', async function(assert) {
      this.server.createList('user', 5);
      this.server.createList('course', 2, {school: this.school});
      this.server.create('session', {
        courseId: 1,
      });
      this.server.create('session', {
        courseId: 2,
      });
      const firstInstructorgroup = this.server.create('instructorGroup', {
        school: this.school,
        userIds: [2, 3, 4, 5, 6]
      });
      const secondInstructorgroup = this.server.create('instructorGroup', {
        school: this.school
      });
      this.server.create('offering', {
        instructorGroupIds: [1],
        sessionId: 1
      });
      this.server.create('offering', {
        instructorGroupIds: [1],
        sessionId: 2
      });

      assert.expect(7);
      await page.visit();
      assert.equal(page.instructorGroups().count, 2);
      assert.equal(page.instructorGroups(0).title , firstInstructorgroup.title);
      assert.equal(page.instructorGroups(0).members, 5);
      assert.equal(page.instructorGroups(0).courses, 2);
      assert.equal(page.instructorGroups(1).title, secondInstructorgroup.title);
      assert.equal(page.instructorGroups(1).members, 0);
      assert.equal(page.instructorGroups(1).courses, 0);
    });

    test('filters by title', async function(assert) {
      this.server.create('school');
      const firstInstructorgroup = this.server.create('instructorGroup', {
        title: 'specialfirstinstructorgroup',
        school: this.school,
      });
      const secondInstructorgroup = this.server.create('instructorGroup', {
        title: 'specialsecondinstructorgroup',
        school: this.school
      });
      const regularInstructorgroup = this.server.create('instructorGroup', {
        title: 'regularinstructorgroup',
        school: this.school
      });
      const regexInstructorgroup = this.server.create('instructorGroup', {
        title: '\\yoo hoo',
        school: this.school
      });
      assert.expect(19);
      await page.visit();
      assert.equal(page.instructorGroups().count,  4);
      assert.equal(page.instructorGroups(0).title, regexInstructorgroup.title);
      assert.equal(page.instructorGroups(1).title, regularInstructorgroup.title);
      assert.equal(page.instructorGroups(2).title, firstInstructorgroup.title);
      assert.equal(page.instructorGroups(3).title, secondInstructorgroup.title);

      await page.filterByTitle('first');
      assert.equal(page.instructorGroups().count,  1);
      assert.equal(page.instructorGroups(0).title, firstInstructorgroup.title);

      await page.filterByTitle('second');
      assert.equal(page.instructorGroups().count,  1);
      assert.equal(page.instructorGroups(0).title, secondInstructorgroup.title);

      await page.filterByTitle('special');
      assert.equal(page.instructorGroups().count,  2);
      assert.equal(page.instructorGroups(0).title, firstInstructorgroup.title);
      assert.equal(page.instructorGroups(1).title, secondInstructorgroup.title);

      await page.filterByTitle('\\');
      assert.equal(page.instructorGroups().count,  1);
      assert.equal(page.instructorGroups(0).title, regexInstructorgroup.title);

      await page.filterByTitle('');
      assert.equal(page.instructorGroups().count,  4);
      assert.equal(page.instructorGroups(0).title, regexInstructorgroup.title);
      assert.equal(page.instructorGroups(1).title, regularInstructorgroup.title);
      assert.equal(page.instructorGroups(2).title, firstInstructorgroup.title);
      assert.equal(page.instructorGroups(3).title, secondInstructorgroup.title);
    });

    test('add new instructorgroup', async function(assert) {
      this.user.update({ administeredSchools: [this.school] });
      assert.expect(5);
      await page.visit();
      const newTitle = 'new test title';
      await page.toggleNewInstructorGroupForm();
      await page.newInstructorGroupForm.title(newTitle);
      await page.newInstructorGroupForm.save();
      assert.equal(page.savedResult, newTitle + ' Saved Successfully');
      assert.equal(page.instructorGroups().count, 1);
      assert.equal(page.instructorGroups(0).title, newTitle);
      assert.equal(page.instructorGroups(0).members, 0);
      assert.equal(page.instructorGroups(0).courses, 0);
    });

    test('cancel adding new instructorgroup', async function(assert) {
      this.user.update({ administeredSchools: [this.school] });
      assert.expect(6);
      this.server.create('instructorGroup', {
        school: this.school,
      });
      await page.visit();
      assert.equal(page.instructorGroups().count, 1);
      assert.equal(page.instructorGroups(0).title, 'instructor group 0');
      await page.toggleNewInstructorGroupForm();
      assert.ok(page.newInstructorGroupForm.isVisible);
      await page.newInstructorGroupForm.cancel();
      assert.notOk(page.newInstructorGroupForm.isVisible);
      assert.equal(page.instructorGroups().count, 1);
      assert.equal(page.instructorGroups(0).title, 'instructor group 0');
    });

    test('remove instructorgroup', async function(assert) {
      this.user.update({ administeredSchools: [this.school] });
      assert.expect(4);
      this.server.create('instructorGroup', {
        school: this.school,
      });
      await page.visit();
      assert.equal(page.instructorGroups().count, 1);
      assert.equal(page.instructorGroups(0).title, 'instructor group 0');
      await page.instructorGroups(0).remove();
      await page.confirmInstructorGroupRemoval();
      assert.equal(page.instructorGroups().count, 0);
      assert.ok(page.emptyListRowIsVisible);
    });

    test('cancel remove instructorgroup', async function(assert) {
      this.user.update({ administeredSchools: [this.school] });
      assert.expect(4);
      this.server.create('instructorGroup', {
        school: this.school,
      });
      await page.visit();
      assert.equal(page.instructorGroups().count, 1);
      assert.equal(page.instructorGroups(0).title, 'instructor group 0');
      await page.instructorGroups(0).remove();
      await page.cancelInstructorGroupRemoval();
      assert.equal(page.instructorGroups().count, 1);
      assert.equal(page.instructorGroups(0).title, 'instructor group 0');
    });

    test('confirmation of remove message', async function(assert) {
      this.user.update({ administeredSchools: [this.school] });
      const users = this.server.createList('user', 5);
      this.server.create('instructorGroup', {
        school: this.school,
        users,
      });

      assert.expect(3);
      await page.visit();
      assert.equal(page.instructorGroups().count, 1);
      assert.equal(page.instructorGroups(0).title, 'instructor group 0');
      await page.instructorGroups(0).remove();
      assert.equal(
        page.removalConfirmationMessage,
        'Are you sure you want to delete this instructor group, with 5 instructors? This action cannot be undone. Yes Cancel'
      );
    });

    test('click edit takes you to instructorgroup route', async function(assert) {
      assert.expect(1);
      this.server.create('instructorGroup', {
        school: this.school,
      });
      await page.visit();
      await page.instructorGroups(0).edit();
      assert.equal(currentURL(), '/instructorgroups/1');
    });

    test('click title takes you to instructorgroup route', async function(assert) {
      assert.expect(1);
      this.server.create('instructorGroup', {
        school: this.school,
      });
      await page.visit();
      await page.instructorGroups(0).clickTitle();
      assert.equal(currentURL(), '/instructorgroups/1');
    });

    test('title filter escapes regex', async function(assert) {
      assert.expect(4);
      this.server.create('instructorGroup', {
        title: 'yes\\no',
        school: this.school,
      });
      await page.visit();
      assert.equal(page.instructorGroups().count, 1);
      assert.equal(page.instructorGroups(0).title, 'yes\\no');
      await page.filterByTitle('\\');
      assert.equal(page.instructorGroups().count, 1);
      assert.equal(page.instructorGroups(0).title, 'yes\\no');
    });

    test('cannot delete instructorgroup with attached courses #3767', async function(assert) {
      this.user.update({ administeredSchools: [this.school] });
      assert.expect(5);
      const group1 = this.server.create('instructorGroup', {
        school: this.school,
      });
      const group2 = this.server.create('instructorGroup', {
        school: this.school,
      });
      const course = this.server.create('course');
      const session1 = this.server.create('session', { course });
      const session2 = this.server.create('session', { course });
      this.server.create('ilm-session', { session: session1, instructorGroups: [group1] });
      this.server.create('offering', { session: session2, instructorGroups: [group2] });
      await page.visit();
      assert.equal(page.instructorGroups().count, 2);
      assert.equal(page.instructorGroups(0).title, 'instructor group 0');
      assert.equal(page.instructorGroups(1).title, 'instructor group 1');
      assert.notOk(page.instructorGroups(0).canBeDeleted);
      assert.notOk(page.instructorGroups(1).canBeDeleted);
    });
  });

  test('filters options', async function(assert) {
    assert.expect(5);
    const schools = this.server.createList('school', 2);
    await setupAuthentication({
      school: schools[1],
    });

    await page.visit();
    assert.equal(page.schoolFilters().count, 2);
    assert.equal(page.schoolFilters(0).text, 'school 0');
    assert.equal(page.schoolFilters(1).text, 'school 1');
    assert.notOk(page.schoolFilters(0).selected);
    assert.ok(page.schoolFilters(1).selected);
  });
});
