import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupAuthentication } from 'ilios-common';
import { setupMirage } from 'ember-cli-mirage/test-support';
import page from 'ilios-common/page-objects/session';

module('Acceptance | Session - Leadership', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    this.server.create('academicYear', { id: 2013 });

    const users = this.server.createList('user', 5);
    const course = this.server.create('course', {
      year: 2013,
      school: this.school,
      directors: [users[0], users[1]],
      administrators: [users[2], users[3]],
    });
    this.session = this.server.create('session', {
      course,
      administrators: [users[2], users[3]],
      studentAdvisors: [users[4]],
    });
  });

  test('collapsed leadership', async function (assert) {
    assert.expect(8);
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.strictEqual(page.leadershipCollapsed.title, 'Session Leadership');
    assert.strictEqual(page.leadershipCollapsed.headers.length, 1);
    assert.strictEqual(page.leadershipCollapsed.headers[0].title, 'Summary');

    assert.strictEqual(page.leadershipCollapsed.summary.length, 2);
    assert.strictEqual(page.leadershipCollapsed.summary[0].name, 'Administrators');
    assert.strictEqual(page.leadershipCollapsed.summary[0].value, 'There are 2 administrators');
    assert.strictEqual(page.leadershipCollapsed.summary[1].name, 'Student Advisors');
    assert.strictEqual(page.leadershipCollapsed.summary[1].value, 'There is 1 student advisor');
  });

  test('list leadership', async function (assert) {
    assert.expect(6);
    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionLeadershipDetails: true,
    });

    assert.strictEqual(page.leadershipExpanded.title, 'Session Leadership');
    const { administrators, studentAdvisors } = page.leadershipExpanded.leadershipList;

    assert.strictEqual(administrators.length, 2);
    assert.strictEqual(administrators[0].text, '3 guy M. Mc3son');
    assert.strictEqual(administrators[1].text, '4 guy M. Mc4son');
    assert.strictEqual(studentAdvisors.length, 1);
    assert.strictEqual(studentAdvisors[0].text, '5 guy M. Mc5son');
  });

  test('search administrators', async function (assert) {
    assert.expect(13);
    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionLeadershipDetails: true,
    });
    await page.leadershipExpanded.manage();
    const manager = page.leadershipExpanded.leadershipManager;
    await manager.administratorSearch.search('guy');
    assert.strictEqual(manager.administratorSearch.results.length, 6);
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
  });

  test('search student advisors', async function (assert) {
    assert.expect(13);
    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionLeadershipDetails: true,
    });
    await page.leadershipExpanded.manage();
    const manager = page.leadershipExpanded.leadershipManager;
    await manager.studentAdvisorSearch.search('guy');
    assert.strictEqual(manager.studentAdvisorSearch.results.length, 6);
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
  });

  test('manage leadership', async function (assert) {
    assert.expect(10);
    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionLeadershipDetails: true,
    });
    await page.leadershipExpanded.manage();
    const manager = page.leadershipExpanded.leadershipManager;

    const { selectedAdministrators, selectedStudentAdvisors } = manager;

    assert.strictEqual(selectedAdministrators.length, 2);
    assert.strictEqual(selectedAdministrators[0].text, '3 guy M. Mc3son');
    assert.strictEqual(selectedAdministrators[1].text, '4 guy M. Mc4son');
    assert.strictEqual(selectedStudentAdvisors.length, 1);
    assert.strictEqual(selectedStudentAdvisors[0].text, '5 guy M. Mc5son');

    await selectedAdministrators[1].remove();
    await selectedStudentAdvisors[0].remove();

    await manager.administratorSearch.search('guy');
    await manager.administratorSearch.results[0].add();
    await manager.studentAdvisorSearch.search('guy');
    await manager.studentAdvisorSearch.results[0].add();

    assert.strictEqual(selectedAdministrators.length, 2);
    assert.strictEqual(selectedAdministrators[0].text, '0 guy M. Mc0son');
    assert.strictEqual(selectedAdministrators[1].text, '3 guy M. Mc3son');

    assert.strictEqual(selectedStudentAdvisors.length, 1);
    assert.strictEqual(selectedStudentAdvisors[0].text, '0 guy M. Mc0son');
  });

  test('cancel leadership changes', async function (assert) {
    assert.expect(5);
    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionLeadershipDetails: true,
    });
    await page.leadershipExpanded.manage();
    const manager = page.leadershipExpanded.leadershipManager;
    const { selectedAdministrators, selectedStudentAdvisors } = manager;
    await selectedAdministrators[1].remove();
    await selectedStudentAdvisors[0].remove();

    await manager.administratorSearch.search('guy');
    await manager.administratorSearch.results[1].add();

    await manager.studentAdvisorSearch.search('guy');
    await manager.studentAdvisorSearch.results[1].add();

    await page.leadershipExpanded.cancel();
    const { administrators, studentAdvisors } = page.leadershipExpanded.leadershipList;

    assert.strictEqual(administrators.length, 2);
    assert.strictEqual(administrators[0].text, '3 guy M. Mc3son');
    assert.strictEqual(administrators[1].text, '4 guy M. Mc4son');

    assert.strictEqual(studentAdvisors.length, 1);
    assert.strictEqual(studentAdvisors[0].text, '5 guy M. Mc5son');
  });

  test('save leadership changes', async function (assert) {
    assert.expect(5);
    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionLeadershipDetails: true,
    });
    await page.leadershipExpanded.manage();
    const manager = page.leadershipExpanded.leadershipManager;
    const { selectedAdministrators, selectedStudentAdvisors } = manager;
    await selectedAdministrators[1].remove();
    await selectedStudentAdvisors[0].remove();

    await manager.administratorSearch.search('guy');
    await manager.administratorSearch.results[1].add();
    await manager.studentAdvisorSearch.search('guy');
    await manager.studentAdvisorSearch.results[1].add();

    await page.leadershipExpanded.save();
    const { administrators, studentAdvisors } = page.leadershipExpanded.leadershipList;

    assert.strictEqual(administrators.length, 2);
    assert.strictEqual(administrators[0].text, '1 guy M. Mc1son');
    assert.strictEqual(administrators[1].text, '3 guy M. Mc3son');

    assert.strictEqual(studentAdvisors.length, 1);
    assert.strictEqual(studentAdvisors[0].text, '1 guy M. Mc1son');
  });
});
