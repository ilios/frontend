import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupAuthentication } from 'ilios-common';
import { setupMirage } from 'ember-cli-mirage/test-support';
import page from 'ilios-common/page-objects/course';

module('Acceptance | Course - Leadership', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    this.server.create('academicYear', { id: 2013 });

    const users = this.server.createList('user', 6);
    this.course = this.server.create('course', {
      year: 2013,
      school: this.school,
      directors: [users[0], users[1]],
      administrators: [users[2], users[3]],
      studentAdvisors: [users[4], users[5]],
    });
  });

  test('collapsed leadership', async function (assert) {
    assert.expect(10);
    await page.visit({ courseId: this.course.id, details: true });

    assert.strictEqual(page.details.leadershipCollapsed.title, 'Course Leadership');
    assert.strictEqual(page.details.leadershipCollapsed.headers.length, 1);
    assert.strictEqual(page.details.leadershipCollapsed.headers[0].title, 'Summary');

    assert.strictEqual(page.details.leadershipCollapsed.summary.length, 3);
    assert.strictEqual(page.details.leadershipCollapsed.summary[0].name, 'Directors');
    assert.strictEqual(page.details.leadershipCollapsed.summary[0].value, 'There are 2 directors');
    assert.strictEqual(page.details.leadershipCollapsed.summary[1].name, 'Administrators');
    assert.strictEqual(
      page.details.leadershipCollapsed.summary[1].value,
      'There are 2 administrators'
    );
    assert.strictEqual(page.details.leadershipCollapsed.summary[2].name, 'Student Advisors');
    assert.strictEqual(
      page.details.leadershipCollapsed.summary[2].value,
      'There are 2 student advisors'
    );
  });

  test('list leadership', async function (assert) {
    assert.expect(10);
    await page.visit({
      courseId: this.course.id,
      details: true,
      courseLeadershipDetails: true,
    });

    assert.strictEqual(page.details.leadershipExpanded.title, 'Course Leadership');
    const { directors, administrators, studentAdvisors } =
      page.details.leadershipExpanded.leadershipList;
    assert.strictEqual(directors.length, 2);
    assert.strictEqual(directors[0].text, '1 guy M. Mc1son');
    assert.strictEqual(directors[1].text, '2 guy M. Mc2son');

    assert.strictEqual(administrators.length, 2);
    assert.strictEqual(administrators[0].text, '3 guy M. Mc3son');
    assert.strictEqual(administrators[1].text, '4 guy M. Mc4son');

    assert.strictEqual(studentAdvisors.length, 2);
    assert.strictEqual(studentAdvisors[0].text, '5 guy M. Mc5son');
    assert.strictEqual(studentAdvisors[1].text, '6 guy M. Mc6son');
  });

  test('search administrators', async function (assert) {
    assert.expect(15);
    await page.visit({
      courseId: this.course.id,
      details: true,
      courseLeadershipDetails: true,
    });
    await page.details.leadershipExpanded.manage();
    const manager = page.details.leadershipExpanded.leadershipManager;
    await manager.administratorSearch.search('guy');
    assert.strictEqual(manager.administratorSearch.results.length, 7);
    assert.strictEqual(
      manager.administratorSearch.results[0].text,
      '0 guy M. Mc0son user@example.edu'
    );
    assert.ok(manager.administratorSearch.results[0].isSelectable);
    assert.strictEqual(
      manager.administratorSearch.results[1].text,
      '1 guy M. Mc1son user@example.edu'
    );
    assert.ok(manager.administratorSearch.results[1].isSelectable);
    assert.strictEqual(
      manager.administratorSearch.results[2].text,
      '2 guy M. Mc2son user@example.edu'
    );
    assert.ok(manager.administratorSearch.results[2].isSelectable);
    assert.strictEqual(
      manager.administratorSearch.results[3].text,
      '3 guy M. Mc3son user@example.edu'
    );
    assert.ok(manager.administratorSearch.results[3].isSelected);
    assert.strictEqual(
      manager.administratorSearch.results[4].text,
      '4 guy M. Mc4son user@example.edu'
    );
    assert.ok(manager.administratorSearch.results[4].isSelected);
    assert.strictEqual(
      manager.administratorSearch.results[5].text,
      '5 guy M. Mc5son user@example.edu'
    );
    assert.ok(manager.administratorSearch.results[5].isSelectable);
    assert.strictEqual(
      manager.administratorSearch.results[6].text,
      '6 guy M. Mc6son user@example.edu'
    );
    assert.ok(manager.administratorSearch.results[6].isSelectable);
  });

  test('search directors', async function (assert) {
    assert.expect(15);
    await page.visit({
      courseId: this.course.id,
      details: true,
      courseLeadershipDetails: true,
    });
    await page.details.leadershipExpanded.manage();
    const manager = page.details.leadershipExpanded.leadershipManager;
    await manager.directorSearch.search('guy');
    assert.strictEqual(manager.directorSearch.results.length, 7);
    assert.strictEqual(manager.directorSearch.results[0].text, '0 guy M. Mc0son user@example.edu');
    assert.ok(manager.directorSearch.results[0].isSelectable);
    assert.strictEqual(manager.directorSearch.results[1].text, '1 guy M. Mc1son user@example.edu');
    assert.ok(manager.directorSearch.results[1].isSelected);
    assert.strictEqual(manager.directorSearch.results[2].text, '2 guy M. Mc2son user@example.edu');
    assert.ok(manager.directorSearch.results[2].isSelected);
    assert.strictEqual(manager.directorSearch.results[3].text, '3 guy M. Mc3son user@example.edu');
    assert.ok(manager.directorSearch.results[3].isSelectable);
    assert.strictEqual(manager.directorSearch.results[4].text, '4 guy M. Mc4son user@example.edu');
    assert.ok(manager.directorSearch.results[4].isSelectable);
    assert.strictEqual(manager.directorSearch.results[5].text, '5 guy M. Mc5son user@example.edu');
    assert.ok(manager.directorSearch.results[5].isSelectable);
    assert.strictEqual(manager.directorSearch.results[6].text, '6 guy M. Mc6son user@example.edu');
    assert.ok(manager.directorSearch.results[6].isSelectable);
  });

  test('search student advisors', async function (assert) {
    assert.expect(15);
    await page.visit({
      courseId: this.course.id,
      details: true,
      courseLeadershipDetails: true,
    });
    await page.details.leadershipExpanded.manage();
    const manager = page.details.leadershipExpanded.leadershipManager;
    await manager.studentAdvisorSearch.search('guy');
    assert.strictEqual(manager.studentAdvisorSearch.results.length, 7);
    assert.strictEqual(
      manager.studentAdvisorSearch.results[0].text,
      '0 guy M. Mc0son user@example.edu'
    );
    assert.ok(manager.studentAdvisorSearch.results[0].isSelectable);
    assert.strictEqual(
      manager.studentAdvisorSearch.results[1].text,
      '1 guy M. Mc1son user@example.edu'
    );
    assert.ok(manager.studentAdvisorSearch.results[1].isSelectable);
    assert.strictEqual(
      manager.studentAdvisorSearch.results[2].text,
      '2 guy M. Mc2son user@example.edu'
    );
    assert.ok(manager.studentAdvisorSearch.results[2].isSelectable);
    assert.strictEqual(
      manager.studentAdvisorSearch.results[3].text,
      '3 guy M. Mc3son user@example.edu'
    );
    assert.ok(manager.studentAdvisorSearch.results[3].isSelectable);
    assert.strictEqual(
      manager.studentAdvisorSearch.results[4].text,
      '4 guy M. Mc4son user@example.edu'
    );
    assert.ok(manager.studentAdvisorSearch.results[4].isSelectable);
    assert.strictEqual(
      manager.studentAdvisorSearch.results[5].text,
      '5 guy M. Mc5son user@example.edu'
    );
    assert.ok(manager.studentAdvisorSearch.results[5].isSelected);
    assert.strictEqual(
      manager.studentAdvisorSearch.results[6].text,
      '6 guy M. Mc6son user@example.edu'
    );
    assert.ok(manager.studentAdvisorSearch.results[6].isSelected);
  });

  test('manage leadership', async function (assert) {
    assert.expect(18);
    await page.visit({
      courseId: this.course.id,
      details: true,
      courseLeadershipDetails: true,
    });
    await page.details.leadershipExpanded.manage();
    const manager = page.details.leadershipExpanded.leadershipManager;

    const { selectedDirectors, selectedAdministrators, selectedStudentAdvisors } = manager;
    assert.strictEqual(selectedDirectors.length, 2);
    assert.strictEqual(selectedDirectors[0].text, '1 guy M. Mc1son');
    assert.strictEqual(selectedDirectors[1].text, '2 guy M. Mc2son');

    assert.strictEqual(selectedAdministrators.length, 2);
    assert.strictEqual(selectedAdministrators[0].text, '3 guy M. Mc3son');
    assert.strictEqual(selectedAdministrators[1].text, '4 guy M. Mc4son');

    assert.strictEqual(selectedStudentAdvisors.length, 2);
    assert.strictEqual(selectedStudentAdvisors[0].text, '5 guy M. Mc5son');
    assert.strictEqual(selectedStudentAdvisors[1].text, '6 guy M. Mc6son');

    await selectedDirectors[0].remove();
    await selectedAdministrators[1].remove();
    await selectedStudentAdvisors[1].remove();
    await manager.directorSearch.search('guy');
    await manager.directorSearch.results[0].add();

    await manager.administratorSearch.search('guy');
    await manager.administratorSearch.results[0].add();

    await manager.studentAdvisorSearch.search('guy');
    await manager.studentAdvisorSearch.results[0].add();

    assert.strictEqual(selectedDirectors.length, 2);
    assert.strictEqual(selectedDirectors[0].text, '0 guy M. Mc0son');
    assert.strictEqual(selectedDirectors[1].text, '2 guy M. Mc2son');

    assert.strictEqual(selectedAdministrators.length, 2);
    assert.strictEqual(selectedAdministrators[0].text, '0 guy M. Mc0son');
    assert.strictEqual(selectedAdministrators[1].text, '3 guy M. Mc3son');

    assert.strictEqual(selectedStudentAdvisors.length, 2);
    assert.strictEqual(selectedStudentAdvisors[0].text, '0 guy M. Mc0son');
    assert.strictEqual(selectedStudentAdvisors[1].text, '5 guy M. Mc5son');
  });

  test('cancel leadership changes', async function (assert) {
    assert.expect(9);
    await page.visit({
      courseId: this.course.id,
      details: true,
      courseLeadershipDetails: true,
    });
    await page.details.leadershipExpanded.manage();
    const manager = page.details.leadershipExpanded.leadershipManager;
    const { selectedDirectors, selectedAdministrators, selectedStudentAdvisors } = manager;
    await selectedDirectors[0].remove();
    await selectedAdministrators[1].remove();
    await selectedStudentAdvisors[1].remove();

    await manager.directorSearch.search('guy');
    await manager.directorSearch.results[3].add();

    await manager.administratorSearch.search('guy');
    await manager.administratorSearch.results[1].add();

    await manager.studentAdvisorSearch.search('guy');
    await manager.studentAdvisorSearch.results[1].add();

    await page.details.leadershipExpanded.cancel();
    const { directors, administrators, studentAdvisors } =
      page.details.leadershipExpanded.leadershipList;
    assert.strictEqual(directors.length, 2);
    assert.strictEqual(directors[0].text, '1 guy M. Mc1son');
    assert.strictEqual(directors[1].text, '2 guy M. Mc2son');

    assert.strictEqual(administrators.length, 2);
    assert.strictEqual(administrators[0].text, '3 guy M. Mc3son');
    assert.strictEqual(administrators[1].text, '4 guy M. Mc4son');

    assert.strictEqual(studentAdvisors.length, 2);
    assert.strictEqual(studentAdvisors[0].text, '5 guy M. Mc5son');
    assert.strictEqual(studentAdvisors[1].text, '6 guy M. Mc6son');
  });

  test('save leadership changes', async function (assert) {
    assert.expect(9);
    await page.visit({
      courseId: this.course.id,
      details: true,
      courseLeadershipDetails: true,
    });
    await page.details.leadershipExpanded.manage();
    const manager = page.details.leadershipExpanded.leadershipManager;
    const { selectedDirectors, selectedAdministrators, selectedStudentAdvisors } = manager;
    await selectedDirectors[0].remove();
    await selectedAdministrators[1].remove();
    await selectedStudentAdvisors[1].remove();

    await manager.directorSearch.search('guy');
    await manager.directorSearch.results[3].add();

    await manager.administratorSearch.search('guy');
    await manager.administratorSearch.results[1].add();

    await manager.studentAdvisorSearch.search('guy');
    await manager.studentAdvisorSearch.results[0].add();

    await page.details.leadershipExpanded.save();
    const { directors, administrators, studentAdvisors } =
      page.details.leadershipExpanded.leadershipList;
    assert.strictEqual(directors.length, 2);
    assert.strictEqual(directors[0].text, '2 guy M. Mc2son');
    assert.strictEqual(directors[1].text, '3 guy M. Mc3son');

    assert.strictEqual(administrators.length, 2);
    assert.strictEqual(administrators[0].text, '1 guy M. Mc1son');
    assert.strictEqual(administrators[1].text, '3 guy M. Mc3son');

    assert.strictEqual(studentAdvisors.length, 2);
    assert.strictEqual(studentAdvisors[0].text, '0 guy M. Mc0son');
    assert.strictEqual(studentAdvisors[1].text, '5 guy M. Mc5son');
  });
});
