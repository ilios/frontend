import { currentRouteName } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import page from 'ilios-common/page-objects/session';

module('Acceptance | Session - Independent Learning', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
    this.server.createList('user', 6);
    this.server.create('academicYear');
    this.course = this.server.create('course', { school: this.school });
    this.server.createList('instructorGroup', 5, { school: this.school });
    this.server.createList('user', 2, { instructorGroupIds: [1] });
    this.server.createList('user', 3, { instructorGroupIds: [2] });
    this.server.create('sessionType', { school: this.school });
    const ilmSession = this.server.create('ilmSession', {
      instructorGroupIds: [1, 2, 3],
      instructorIds: [2, 3, 4],
    });
    this.ilmSession = this.server.create('session', {
      course: this.course,
      ilmSession,
    });
  });

  test('initial selected instructors', async function (assert) {
    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionLearnergroupDetails: true,
    });
    assert.strictEqual(currentRouteName(), 'session.index');
    assert.strictEqual(page.details.instructors.title, 'Instructors and Instructor Groups (3/3)');

    assert.strictEqual(
      page.details.instructors.selectedInstructorGroups.instructorGroups.length,
      3
    );
    assert.strictEqual(
      page.details.instructors.selectedInstructorGroups.instructorGroups[0].title,
      'instructor group 0'
    );
    assert.strictEqual(
      page.details.instructors.selectedInstructorGroups.instructorGroups[0].members.length,
      2
    );
    assert.strictEqual(
      page.details.instructors.selectedInstructorGroups.instructorGroups[0].members[0].text,
      '7 guy M. Mc7son'
    );
    assert.strictEqual(
      page.details.instructors.selectedInstructorGroups.instructorGroups[0].members[1].text,
      '8 guy M. Mc8son'
    );
    assert.strictEqual(
      page.details.instructors.selectedInstructorGroups.instructorGroups[1].title,
      'instructor group 1'
    );
    assert.strictEqual(
      page.details.instructors.selectedInstructorGroups.instructorGroups[1].members.length,
      3
    );
    assert.strictEqual(
      page.details.instructors.selectedInstructorGroups.instructorGroups[1].members[0].text,
      '10 guy M. Mc10son'
    );
    assert.strictEqual(
      page.details.instructors.selectedInstructorGroups.instructorGroups[1].members[1].text,
      '11 guy M. Mc11son'
    );
    assert.strictEqual(
      page.details.instructors.selectedInstructorGroups.instructorGroups[1].members[2].text,
      '9 guy M. Mc9son'
    );
    assert.strictEqual(
      page.details.instructors.selectedInstructorGroups.instructorGroups[2].title,
      'instructor group 2'
    );
    assert.strictEqual(
      page.details.instructors.selectedInstructorGroups.instructorGroups[2].members.length,
      0
    );

    assert.strictEqual(page.details.instructors.selectedInstructors.instructors.length, 3);
    assert.strictEqual(
      page.details.instructors.selectedInstructors.instructors[0].userNameInfo.fullName,
      '1 guy M. Mc1son'
    );
    assert.strictEqual(
      page.details.instructors.selectedInstructors.instructors[1].userNameInfo.fullName,
      '2 guy M. Mc2son'
    );
    assert.strictEqual(
      page.details.instructors.selectedInstructors.instructors[2].userNameInfo.fullName,
      '3 guy M. Mc3son'
    );
  });

  test('manage instructors lists', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionLearnergroupDetails: true,
    });
    assert.strictEqual(currentRouteName(), 'session.index');
    await page.details.instructors.manage();
    const { manager } = page.details.instructors;

    assert.strictEqual(manager.selectedInstructorGroups.instructorGroups.length, 3);
    assert.strictEqual(
      manager.selectedInstructorGroups.instructorGroups[0].title,
      'instructor group 0'
    );
    assert.strictEqual(manager.selectedInstructorGroups.instructorGroups[0].members.length, 2);
    assert.strictEqual(
      manager.selectedInstructorGroups.instructorGroups[0].members[0].userNameInfo.fullName,
      '7 guy M. Mc7son'
    );
    assert.strictEqual(
      manager.selectedInstructorGroups.instructorGroups[0].members[1].userNameInfo.fullName,
      '8 guy M. Mc8son'
    );
    assert.strictEqual(
      manager.selectedInstructorGroups.instructorGroups[1].title,
      'instructor group 1'
    );
    assert.strictEqual(
      manager.selectedInstructorGroups.instructorGroups[1].members[0].userNameInfo.fullName,
      '10 guy M. Mc10son'
    );
    assert.strictEqual(
      manager.selectedInstructorGroups.instructorGroups[1].members[1].userNameInfo.fullName,
      '11 guy M. Mc11son'
    );
    assert.strictEqual(
      manager.selectedInstructorGroups.instructorGroups[1].members[2].userNameInfo.fullName,
      '9 guy M. Mc9son'
    );
    assert.strictEqual(manager.selectedInstructorGroups.instructorGroups[1].members.length, 3);
    assert.strictEqual(
      manager.selectedInstructorGroups.instructorGroups[2].text,
      'instructor group 2'
    );
    assert.strictEqual(manager.selectedInstructorGroups.instructorGroups[2].members.length, 0);
    assert.strictEqual(manager.selectedInstructors.instructors.length, 3);
    assert.strictEqual(
      manager.selectedInstructors.instructors[0].userNameInfo.fullName,
      '1 guy M. Mc1son'
    );
    assert.strictEqual(
      manager.selectedInstructors.instructors[1].userNameInfo.fullName,
      '2 guy M. Mc2son'
    );
    assert.strictEqual(
      manager.selectedInstructors.instructors[2].userNameInfo.fullName,
      '3 guy M. Mc3son'
    );
  });

  test('manage instructors search users', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionLearnergroupDetails: true,
    });
    assert.strictEqual(currentRouteName(), 'session.index');
    await page.details.instructors.manage();
    const { manager } = page.details.instructors;

    await manager.search.searchBox.set('guy');
    assert.strictEqual(manager.search.results.items.length, 12);
    assert.strictEqual(manager.search.results.items[0].text, '0 guy M. Mc0son user@example.edu');
    assert.ok(manager.search.results.items[0].isActive);
    assert.strictEqual(manager.search.results.items[1].text, '1 guy M. Mc1son user@example.edu');
    assert.notOk(manager.search.results.items[1].isActive);
    assert.strictEqual(manager.search.results.items[2].text, '2 guy M. Mc2son user@example.edu');
    assert.notOk(manager.search.results.items[2].isActive);
    assert.strictEqual(manager.search.results.items[3].text, '3 guy M. Mc3son user@example.edu');
    assert.notOk(manager.search.results.items[3].isActive);
    assert.strictEqual(manager.search.results.items[4].text, '4 guy M. Mc4son user@example.edu');
    assert.ok(manager.search.results.items[4].isActive);
    assert.strictEqual(manager.search.results.items[5].text, '5 guy M. Mc5son user@example.edu');
    assert.ok(manager.search.results.items[5].isActive);
    assert.strictEqual(manager.search.results.items[6].text, '6 guy M. Mc6son user@example.edu');
    assert.ok(manager.search.results.items[6].isActive);
    assert.strictEqual(manager.search.results.items[7].text, '7 guy M. Mc7son user@example.edu');
    assert.ok(manager.search.results.items[7].isActive);
    assert.strictEqual(manager.search.results.items[8].text, '8 guy M. Mc8son user@example.edu');
    assert.ok(manager.search.results.items[8].isActive);
    assert.strictEqual(manager.search.results.items[9].text, '9 guy M. Mc9son user@example.edu');
    assert.ok(manager.search.results.items[9].isActive);
    assert.strictEqual(manager.search.results.items[10].text, '10 guy M. Mc10son user@example.edu');
    assert.ok(manager.search.results.items[10].isActive);
    assert.strictEqual(manager.search.results.items[11].text, '11 guy M. Mc11son user@example.edu');
    assert.ok(manager.search.results.items[11].isActive);
  });

  test('manage instructors search groups', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionLearnergroupDetails: true,
    });
    assert.strictEqual(currentRouteName(), 'session.index');
    await page.details.instructors.manage();
    const { manager } = page.details.instructors;

    await manager.search.searchBox.set('group');
    assert.strictEqual(manager.search.results.items.length, 5);
    assert.strictEqual(manager.search.results.items[0].text, 'instructor group 0');
    assert.notOk(manager.search.results.items[0].isActive);
    assert.strictEqual(manager.search.results.items[1].text, 'instructor group 1');
    assert.notOk(manager.search.results.items[1].isActive);
    assert.strictEqual(manager.search.results.items[2].text, 'instructor group 2');
    assert.notOk(manager.search.results.items[2].isActive);
    assert.strictEqual(manager.search.results.items[3].text, 'instructor group 3');
    assert.ok(manager.search.results.items[3].isActive);
    assert.strictEqual(manager.search.results.items[4].text, 'instructor group 4');
    assert.ok(manager.search.results.items[4].isActive);
  });

  test('add instructor group', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionLearnergroupDetails: true,
    });
    assert.strictEqual(currentRouteName(), 'session.index');
    await page.details.instructors.manage();
    const { manager } = page.details.instructors;

    await manager.search.searchBox.set('group');
    await manager.search.results.items[3].click();

    assert.strictEqual(manager.selectedInstructorGroups.instructorGroups.length, 4);
    assert.strictEqual(
      manager.selectedInstructorGroups.instructorGroups[0].title,
      'instructor group 0'
    );
    assert.strictEqual(
      manager.selectedInstructorGroups.instructorGroups[1].title,
      'instructor group 1'
    );
    assert.strictEqual(
      manager.selectedInstructorGroups.instructorGroups[2].title,
      'instructor group 2'
    );
    assert.strictEqual(
      manager.selectedInstructorGroups.instructorGroups[3].title,
      'instructor group 3'
    );
    assert.strictEqual(manager.selectedInstructors.instructors.length, 3);
    assert.strictEqual(
      manager.selectedInstructors.instructors[0].userNameInfo.fullName,
      '1 guy M. Mc1son'
    );
    assert.strictEqual(
      manager.selectedInstructors.instructors[1].userNameInfo.fullName,
      '2 guy M. Mc2son'
    );
    assert.strictEqual(
      manager.selectedInstructors.instructors[2].userNameInfo.fullName,
      '3 guy M. Mc3son'
    );

    await page.details.instructors.save();

    assert.strictEqual(
      page.details.instructors.selectedInstructorGroups.instructorGroups.length,
      4
    );
    assert.strictEqual(
      page.details.instructors.selectedInstructorGroups.instructorGroups[0].title,
      'instructor group 0'
    );
    assert.strictEqual(
      page.details.instructors.selectedInstructorGroups.instructorGroups[1].title,
      'instructor group 1'
    );
    assert.strictEqual(
      page.details.instructors.selectedInstructorGroups.instructorGroups[2].title,
      'instructor group 2'
    );
    assert.strictEqual(
      page.details.instructors.selectedInstructorGroups.instructorGroups[3].title,
      'instructor group 3'
    );
    assert.strictEqual(page.details.instructors.selectedInstructors.instructors.length, 3);
    assert.strictEqual(
      page.details.instructors.selectedInstructors.instructors[0].userNameInfo.fullName,
      '1 guy M. Mc1son'
    );
    assert.strictEqual(
      page.details.instructors.selectedInstructors.instructors[1].userNameInfo.fullName,
      '2 guy M. Mc2son'
    );
    assert.strictEqual(
      page.details.instructors.selectedInstructors.instructors[2].userNameInfo.fullName,
      '3 guy M. Mc3son'
    );
  });

  test('add instructor', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionLearnergroupDetails: true,
    });
    assert.strictEqual(currentRouteName(), 'session.index');
    await page.details.instructors.manage();
    const { manager } = page.details.instructors;

    await manager.search.searchBox.set('guy');
    await manager.search.results.items[4].click();

    assert.strictEqual(manager.selectedInstructorGroups.instructorGroups.length, 3);
    assert.strictEqual(
      manager.selectedInstructorGroups.instructorGroups[0].title,
      'instructor group 0'
    );
    assert.strictEqual(
      manager.selectedInstructorGroups.instructorGroups[1].title,
      'instructor group 1'
    );
    assert.strictEqual(
      manager.selectedInstructorGroups.instructorGroups[2].title,
      'instructor group 2'
    );
    assert.strictEqual(manager.selectedInstructors.instructors.length, 4);
    assert.strictEqual(
      manager.selectedInstructors.instructors[0].userNameInfo.fullName,
      '1 guy M. Mc1son'
    );
    assert.strictEqual(
      manager.selectedInstructors.instructors[1].userNameInfo.fullName,
      '2 guy M. Mc2son'
    );
    assert.strictEqual(
      manager.selectedInstructors.instructors[2].userNameInfo.fullName,
      '3 guy M. Mc3son'
    );
    assert.strictEqual(
      manager.selectedInstructors.instructors[3].userNameInfo.fullName,
      '4 guy M. Mc4son'
    );

    await page.details.instructors.save();

    assert.strictEqual(
      page.details.instructors.selectedInstructorGroups.instructorGroups.length,
      3
    );
    assert.strictEqual(
      page.details.instructors.selectedInstructorGroups.instructorGroups[0].title,
      'instructor group 0'
    );
    assert.strictEqual(
      page.details.instructors.selectedInstructorGroups.instructorGroups[1].title,
      'instructor group 1'
    );
    assert.strictEqual(
      page.details.instructors.selectedInstructorGroups.instructorGroups[2].title,
      'instructor group 2'
    );
    assert.strictEqual(page.details.instructors.selectedInstructors.instructors.length, 4);
    assert.strictEqual(
      page.details.instructors.selectedInstructors.instructors[0].userNameInfo.fullName,
      '1 guy M. Mc1son'
    );
    assert.strictEqual(
      page.details.instructors.selectedInstructors.instructors[1].userNameInfo.fullName,
      '2 guy M. Mc2son'
    );
    assert.strictEqual(
      page.details.instructors.selectedInstructors.instructors[2].userNameInfo.fullName,
      '3 guy M. Mc3son'
    );
    assert.strictEqual(
      page.details.instructors.selectedInstructors.instructors[3].userNameInfo.fullName,
      '4 guy M. Mc4son'
    );
  });

  test('remove instructor group', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionLearnergroupDetails: true,
    });
    assert.strictEqual(currentRouteName(), 'session.index');
    await page.details.instructors.manage();
    const { manager } = page.details.instructors;

    await manager.selectedInstructorGroups.instructorGroups[0].remove();

    assert.strictEqual(manager.selectedInstructorGroups.instructorGroups.length, 2);
    assert.strictEqual(
      manager.selectedInstructorGroups.instructorGroups[0].title,
      'instructor group 1'
    );
    assert.strictEqual(
      manager.selectedInstructorGroups.instructorGroups[1].title,
      'instructor group 2'
    );
    assert.strictEqual(manager.selectedInstructors.instructors.length, 3);
    assert.strictEqual(
      manager.selectedInstructors.instructors[0].userNameInfo.fullName,
      '1 guy M. Mc1son'
    );
    assert.strictEqual(
      manager.selectedInstructors.instructors[1].userNameInfo.fullName,
      '2 guy M. Mc2son'
    );
    assert.strictEqual(
      manager.selectedInstructors.instructors[2].userNameInfo.fullName,
      '3 guy M. Mc3son'
    );

    await page.details.instructors.save();

    assert.strictEqual(
      page.details.instructors.selectedInstructorGroups.instructorGroups.length,
      2
    );
    assert.strictEqual(
      page.details.instructors.selectedInstructorGroups.instructorGroups[0].title,
      'instructor group 1'
    );
    assert.strictEqual(
      page.details.instructors.selectedInstructorGroups.instructorGroups[1].title,
      'instructor group 2'
    );
    assert.strictEqual(page.details.instructors.selectedInstructors.instructors.length, 3);
    assert.strictEqual(
      page.details.instructors.selectedInstructors.instructors[0].userNameInfo.fullName,
      '1 guy M. Mc1son'
    );
    assert.strictEqual(
      page.details.instructors.selectedInstructors.instructors[1].userNameInfo.fullName,
      '2 guy M. Mc2son'
    );
    assert.strictEqual(
      page.details.instructors.selectedInstructors.instructors[2].userNameInfo.fullName,
      '3 guy M. Mc3son'
    );
  });

  test('remove instructor', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionLearnergroupDetails: true,
    });
    assert.strictEqual(currentRouteName(), 'session.index');
    await page.details.instructors.manage();
    const { manager } = page.details.instructors;

    await manager.selectedInstructors.instructors[0].remove();

    assert.strictEqual(manager.selectedInstructorGroups.instructorGroups.length, 3);
    assert.strictEqual(
      manager.selectedInstructorGroups.instructorGroups[0].title,
      'instructor group 0'
    );
    assert.strictEqual(
      manager.selectedInstructorGroups.instructorGroups[1].title,
      'instructor group 1'
    );
    assert.strictEqual(
      manager.selectedInstructorGroups.instructorGroups[2].title,
      'instructor group 2'
    );
    assert.strictEqual(manager.selectedInstructors.instructors.length, 2);
    assert.strictEqual(
      manager.selectedInstructors.instructors[0].userNameInfo.fullName,
      '2 guy M. Mc2son'
    );
    assert.strictEqual(
      manager.selectedInstructors.instructors[1].userNameInfo.fullName,
      '3 guy M. Mc3son'
    );

    await page.details.instructors.save();

    assert.strictEqual(
      page.details.instructors.selectedInstructorGroups.instructorGroups.length,
      3
    );
    assert.strictEqual(
      page.details.instructors.selectedInstructorGroups.instructorGroups[0].title,
      'instructor group 0'
    );
    assert.strictEqual(
      page.details.instructors.selectedInstructorGroups.instructorGroups[1].title,
      'instructor group 1'
    );
    assert.strictEqual(
      page.details.instructors.selectedInstructorGroups.instructorGroups[2].title,
      'instructor group 2'
    );
    assert.strictEqual(page.details.instructors.selectedInstructors.instructors.length, 2);
    assert.strictEqual(
      page.details.instructors.selectedInstructors.instructors[0].userNameInfo.fullName,
      '2 guy M. Mc2son'
    );
    assert.strictEqual(
      page.details.instructors.selectedInstructors.instructors[1].userNameInfo.fullName,
      '3 guy M. Mc3son'
    );
  });

  test('undo instructor/group changes', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionLearnergroupDetails: true,
    });
    assert.strictEqual(currentRouteName(), 'session.index');
    await page.details.instructors.manage();
    const { manager } = page.details.instructors;

    await manager.selectedInstructorGroups.instructorGroups[0].remove();
    await manager.selectedInstructors.instructors[0].remove();

    await page.details.instructors.cancel();

    assert.strictEqual(
      page.details.instructors.selectedInstructorGroups.instructorGroups.length,
      3
    );
    assert.strictEqual(
      page.details.instructors.selectedInstructorGroups.instructorGroups[0].title,
      'instructor group 0'
    );
    assert.strictEqual(
      page.details.instructors.selectedInstructorGroups.instructorGroups[1].title,
      'instructor group 1'
    );
    assert.strictEqual(
      page.details.instructors.selectedInstructorGroups.instructorGroups[2].title,
      'instructor group 2'
    );
    assert.strictEqual(page.details.instructors.selectedInstructors.instructors.length, 3);
    assert.strictEqual(
      page.details.instructors.selectedInstructors.instructors[0].userNameInfo.fullName,
      '1 guy M. Mc1son'
    );
    assert.strictEqual(
      page.details.instructors.selectedInstructors.instructors[1].userNameInfo.fullName,
      '2 guy M. Mc2son'
    );
    assert.strictEqual(
      page.details.instructors.selectedInstructors.instructors[2].userNameInfo.fullName,
      '3 guy M. Mc3son'
    );
  });

  test('ilm due date is visible if session has no post-requisite', async function (assert) {
    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionLearnergroupDetails: true,
    });
    assert.ok(page.details.overview.ilmDueDateAndTime.isVisible);
  });

  test('ilm due date should not be visible if session has post-requisite', async function (assert) {
    const postRequisite = this.server.create('session', {
      course: this.course,
    });
    this.ilmSession.update('postrequisite', postRequisite);
    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionLearnergroupDetails: true,
    });
    assert.ok(page.details.overview.ilmDueDateAndTime.isHidden);
  });

  test('ilm-only subcomponents disappear/reappear if ilm gets toggled off/on', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionLearnergroupDetails: true,
    });
    assert.strictEqual(currentRouteName(), 'session.index');

    assert.ok(page.details.learnersAreVisible);
    assert.ok(page.details.instructorsAreVisible);

    await page.details.overview.toggleIlm.yesNoToggle.click();

    assert.notOk(page.details.learnersAreVisible);
    assert.notOk(page.details.instructorsAreVisible);

    await page.details.overview.toggleIlm.yesNoToggle.click();

    assert.ok(page.details.learnersAreVisible);
    assert.ok(page.details.instructorsAreVisible);
  });
});
