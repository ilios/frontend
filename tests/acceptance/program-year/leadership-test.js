import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupAuthentication } from 'ilios-common';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from 'ilios/tests/pages/program-year';

module('Acceptance | Program Year - Leadership', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    const users = this.server.createList('user', 4);
    const program = this.server.create('program', {
      school: this.school,
    });
    this.server.create('programYear', {
      program,
      directors: [users[2], users[3]],
    });
  });

  test('collapsed leadership', async function (assert) {
    await page.visit({ programId: 1, programYearId: 1 });
    assert.strictEqual(page.details.collapsedLeadership.title, 'Program Year Leadership');
    assert.strictEqual(page.details.collapsedLeadership.headers.length, 1);
    assert.strictEqual(page.details.collapsedLeadership.headers[0].title, 'Summary');
    assert.strictEqual(page.details.collapsedLeadership.summary.length, 1);
    assert.strictEqual(page.details.collapsedLeadership.summary[0].name, 'Directors');
    assert.strictEqual(page.details.collapsedLeadership.summary[0].value, 'There are 2 directors');
  });

  test('list leadership', async function (assert) {
    await page.visit({ programId: 1, programYearId: 1, pyLeadershipDetails: true });
    assert.strictEqual(page.details.expandedLeadership.title, 'Program Year Leadership');
    const { directors } = page.details.expandedLeadership.leadershipList;
    assert.strictEqual(directors.length, 2);
    assert.strictEqual(directors[0].text, '3 guy M. Mc3son');
    assert.strictEqual(directors[1].text, '4 guy M. Mc4son');
  });

  test('search directors', async function (assert) {
    await page.visit({ programId: 1, programYearId: 1, pyLeadershipDetails: true });
    await page.details.expandedLeadership.manage();
    const manager = page.details.expandedLeadership.leadershipManager;
    await manager.directorSearch.search('guy');
    assert.strictEqual(manager.directorSearch.results.length, 5);
    assert.strictEqual(manager.directorSearch.results[0].text, '0 guy M. Mc0son user@example.edu');
    assert.ok(manager.directorSearch.results[0].isSelectable);
    assert.strictEqual(manager.directorSearch.results[1].text, '1 guy M. Mc1son user@example.edu');
    assert.ok(manager.directorSearch.results[1].isSelectable);
    assert.strictEqual(manager.directorSearch.results[2].text, '2 guy M. Mc2son user@example.edu');
    assert.ok(manager.directorSearch.results[2].isSelectable);
    assert.strictEqual(manager.directorSearch.results[3].text, '3 guy M. Mc3son user@example.edu');
    assert.ok(manager.directorSearch.results[3].isSelected);
    assert.strictEqual(manager.directorSearch.results[4].text, '4 guy M. Mc4son user@example.edu');
    assert.ok(manager.directorSearch.results[4].isSelected);
  });

  test('manage leadership', async function (assert) {
    await page.visit({ programId: 1, programYearId: 1, pyLeadershipDetails: true });
    await page.details.expandedLeadership.manage();
    const manager = page.details.expandedLeadership.leadershipManager;
    const { selectedDirectors } = manager;
    assert.strictEqual(selectedDirectors.length, 2);
    assert.strictEqual(selectedDirectors[0].text, '3 guy M. Mc3son');
    assert.strictEqual(selectedDirectors[1].text, '4 guy M. Mc4son');
    await selectedDirectors[1].remove();
    await manager.directorSearch.search('guy');
    await manager.directorSearch.results[0].add();
    assert.strictEqual(selectedDirectors.length, 2);
    assert.strictEqual(selectedDirectors[0].text, '0 guy M. Mc0son');
    assert.strictEqual(selectedDirectors[1].text, '3 guy M. Mc3son');
  });

  test('cancel leadership changes', async function (assert) {
    await page.visit({ programId: 1, programYearId: 1, pyLeadershipDetails: true });
    await page.details.expandedLeadership.manage();
    const manager = page.details.expandedLeadership.leadershipManager;
    const { selectedDirectors } = manager;
    await selectedDirectors[1].remove();
    await manager.directorSearch.search('guy');
    await manager.directorSearch.results[1].add();
    await page.details.expandedLeadership.cancel();
    const { directors } = page.details.expandedLeadership.leadershipList;
    assert.strictEqual(directors.length, 2);
    assert.strictEqual(directors[0].text, '3 guy M. Mc3son');
    assert.strictEqual(directors[1].text, '4 guy M. Mc4son');
  });

  test('save leadership changes', async function (assert) {
    await page.visit({ programId: 1, programYearId: 1, pyLeadershipDetails: true });
    await page.details.expandedLeadership.manage();
    const manager = page.details.expandedLeadership.leadershipManager;
    const { selectedDirectors } = manager;
    await selectedDirectors[1].remove();
    await manager.directorSearch.search('guy');
    await manager.directorSearch.results[1].add();
    await page.details.expandedLeadership.save();
    const { directors } = page.details.expandedLeadership.leadershipList;
    assert.strictEqual(directors.length, 2);
    assert.strictEqual(directors[0].text, '1 guy M. Mc1son');
    assert.strictEqual(directors[1].text, '3 guy M. Mc3son');
  });
});
