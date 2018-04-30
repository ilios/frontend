import {
  module,
  test
} from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from 'ilios/tests/pages/program';

module('Acceptance: Program - Leadership', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function() {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school, administeredSchools: [this.school] });

    const users = this.server.createList('user', 4);
    this.server.create('program', {
      directors: [users[2], users[3]],
      school: this.school,
    });
  });

  test('collapsed leadership', async function (assert) {
    assert.expect(6);
    await page.visit({ programId: 1 });

    assert.equal(page.leadershipCollapsed.title, 'Program Leadership');
    assert.equal(page.leadershipCollapsed.headers().count, 1);
    assert.equal(page.leadershipCollapsed.headers(0).title, 'Summary');

    assert.equal(page.leadershipCollapsed.summary().count, 1);
    assert.equal(page.leadershipCollapsed.summary(0).name, 'Directors');
    assert.equal(page.leadershipCollapsed.summary(0).value, 'There are 2 directors');
  });

  test('list leadership', async function (assert) {
    assert.expect(4);
    await page.visit({ programId: 1, leadershipDetails: true });

    assert.equal(page.leadershipExpanded.title, 'Program Leadership');
    const { directors } = page.leadershipExpanded.leadershipList;

    assert.equal(directors().count, 2);
    assert.equal(directors(0).text, '3 guy M. Mc3son');
    assert.equal(directors(1).text, '4 guy M. Mc4son');
  });

  test('search directors', async function (assert) {
    assert.expect(11);
    await page.visit({ programId: 1, leadershipDetails: true });
    await page.leadershipExpanded.manage();
    const manager = page.leadershipExpanded.leadershipManager;
    await manager.directorSearch.search('guy');
    assert.equal(manager.directorSearch.results().count, 5);
    assert.equal(manager.directorSearch.results(0).text, '0 guy M. Mc0son user@example.edu');
    assert.ok(manager.directorSearch.results(0).isSelectable);
    assert.equal(manager.directorSearch.results(1).text, '1 guy M. Mc1son user@example.edu');
    assert.ok(manager.directorSearch.results(1).isSelectable);
    assert.equal(manager.directorSearch.results(2).text, '2 guy M. Mc2son user@example.edu');
    assert.ok(manager.directorSearch.results(2).isSelectable);
    assert.equal(manager.directorSearch.results(3).text, '3 guy M. Mc3son user@example.edu');
    assert.ok(manager.directorSearch.results(3).isSelected);
    assert.equal(manager.directorSearch.results(4).text, '4 guy M. Mc4son user@example.edu');
    assert.ok(manager.directorSearch.results(4).isSelected);
  });

  test('manage leadership', async function (assert) {
    assert.expect(6);
    await page.visit({ programId: 1, leadershipDetails: true });
    await page.leadershipExpanded.manage();
    const manager = page.leadershipExpanded.leadershipManager;

    const { selectedDirectors } = manager;

    assert.equal(selectedDirectors().count, 2);
    assert.equal(selectedDirectors(0).text, '3 guy M. Mc3son');
    assert.equal(selectedDirectors(1).text, '4 guy M. Mc4son');

    await selectedDirectors(1).remove();

    await manager.directorSearch.search('guy');
    await manager.directorSearch.results(0).add();

    assert.equal(selectedDirectors().count, 2);
    assert.equal(selectedDirectors(0).text, '0 guy M. Mc0son');
    assert.equal(selectedDirectors(1).text, '3 guy M. Mc3son');
  });

  test('cancel leadership changes', async function (assert) {
    assert.expect(3);
    await page.visit({ programId: 1, leadershipDetails: true });
    await page.leadershipExpanded.manage();
    const manager = page.leadershipExpanded.leadershipManager;
    const { selectedDirectors } = manager;
    await selectedDirectors(1).remove();

    await manager.directorSearch.search('guy');
    await manager.directorSearch.results(1).add();

    await page.leadershipExpanded.cancel();
    const { directors } = page.leadershipExpanded.leadershipList;

    assert.equal(directors().count, 2);
    assert.equal(directors(0).text, '3 guy M. Mc3son');
    assert.equal(directors(1).text, '4 guy M. Mc4son');
  });

  test('save leadership changes', async function (assert) {
    assert.expect(3);
    await page.visit({ programId: 1, leadershipDetails: true });
    await page.leadershipExpanded.manage();
    const manager = page.leadershipExpanded.leadershipManager;
    const { selectedDirectors } = manager;
    await selectedDirectors(1).remove();

    await manager.directorSearch.search('guy');
    await manager.directorSearch.results(1).add();
    await page.leadershipExpanded.save();
    const { directors } = page.leadershipExpanded.leadershipList;

    assert.equal(directors().count, 2);
    assert.equal(directors(0).text, '1 guy M. Mc1son');
    assert.equal(directors(1).text, '3 guy M. Mc3son');
  });
});
