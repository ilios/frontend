import {
  module,
  test
} from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from 'ilios/tests/pages/course';

module('Acceptance | Course - Leadership', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function() {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school, administeredSchools: [this.school] });
    this.server.create('academicYear', {id: 2013});

    const users = this.server.createList('user', 4);
    this.course = this.server.create('course', {
      year: 2013,
      school: this.school,
      directors: [users[0], users[1]],
      administrators: [users[2], users[3]],
    });
  });

  test('collapsed leadership', async function (assert) {
    assert.expect(8);
    await page.visit({ courseId: 1, details: true });

    assert.equal(page.leadershipCollapsed.title, 'Course Leadership');
    assert.equal(page.leadershipCollapsed.headers().count, 1);
    assert.equal(page.leadershipCollapsed.headers(0).title, 'Summary');

    assert.equal(page.leadershipCollapsed.summary().count, 2);
    assert.equal(page.leadershipCollapsed.summary(0).name, 'Directors');
    assert.equal(page.leadershipCollapsed.summary(0).value, 'There are 2 directors');
    assert.equal(page.leadershipCollapsed.summary(1).name, 'Administrators');
    assert.equal(page.leadershipCollapsed.summary(1).value, 'There are 2 administrators');
  });

  test('list leadership', async function (assert) {
    assert.expect(7);
    await page.visit({ courseId: 1, details: true, courseLeadershipDetails: true });

    assert.equal(page.leadershipExpanded.title, 'Course Leadership');
    const { directors, administrators } = page.leadershipExpanded.leadershipList;
    assert.equal(directors().count, 2);
    assert.equal(directors(0).text, '1 guy M. Mc1son');
    assert.equal(directors(1).text, '2 guy M. Mc2son');

    assert.equal(administrators().count, 2);
    assert.equal(administrators(0).text, '3 guy M. Mc3son');
    assert.equal(administrators(1).text, '4 guy M. Mc4son');
  });

  test('search administrators', async function (assert) {
    assert.expect(11);
    await page.visit({ courseId: 1, details: true, courseLeadershipDetails: true });
    await page.leadershipExpanded.manage();
    const manager = page.leadershipExpanded.leadershipManager;
    await manager.administratorSearch.search('guy');
    assert.equal(manager.administratorSearch.results().count, 5);
    assert.equal(manager.administratorSearch.results(0).text, '0 guy M. Mc0son user@example.edu');
    assert.ok(manager.administratorSearch.results(0).isSelectable);
    assert.equal(manager.administratorSearch.results(1).text, '1 guy M. Mc1son user@example.edu');
    assert.ok(manager.administratorSearch.results(1).isSelectable);
    assert.equal(manager.administratorSearch.results(2).text, '2 guy M. Mc2son user@example.edu');
    assert.ok(manager.administratorSearch.results(2).isSelectable);
    assert.equal(manager.administratorSearch.results(3).text, '3 guy M. Mc3son user@example.edu');
    assert.ok(manager.administratorSearch.results(3).isSelected);
    assert.equal(manager.administratorSearch.results(4).text, '4 guy M. Mc4son user@example.edu');
    assert.ok(manager.administratorSearch.results(4).isSelected);
  });

  test('search directors', async function (assert) {
    assert.expect(11);
    await page.visit({ courseId: 1, details: true, courseLeadershipDetails: true });
    await page.leadershipExpanded.manage();
    const manager = page.leadershipExpanded.leadershipManager;
    await manager.directorSearch.search('guy');
    assert.equal(manager.directorSearch.results().count, 5);
    assert.equal(manager.directorSearch.results(0).text, '0 guy M. Mc0son user@example.edu');
    assert.ok(manager.directorSearch.results(0).isSelectable);
    assert.equal(manager.directorSearch.results(1).text, '1 guy M. Mc1son user@example.edu');
    assert.ok(manager.directorSearch.results(1).isSelected);
    assert.equal(manager.directorSearch.results(2).text, '2 guy M. Mc2son user@example.edu');
    assert.ok(manager.directorSearch.results(2).isSelected);
    assert.equal(manager.directorSearch.results(3).text, '3 guy M. Mc3son user@example.edu');
    assert.ok(manager.directorSearch.results(3).isSelectable);
    assert.equal(manager.directorSearch.results(4).text, '4 guy M. Mc4son user@example.edu');
    assert.ok(manager.directorSearch.results(4).isSelectable);
  });

  test('manage leadership', async function (assert) {
    assert.expect(12);
    await page.visit({ courseId: 1, details: true, courseLeadershipDetails: true });
    await page.leadershipExpanded.manage();
    const manager = page.leadershipExpanded.leadershipManager;

    const { selectedDirectors, selectedAdministrators } = manager;
    assert.equal(selectedDirectors().count, 2);
    assert.equal(selectedDirectors(0).text, '1 guy M. Mc1son');
    assert.equal(selectedDirectors(1).text, '2 guy M. Mc2son');

    assert.equal(selectedAdministrators().count, 2);
    assert.equal(selectedAdministrators(0).text, '3 guy M. Mc3son');
    assert.equal(selectedAdministrators(1).text, '4 guy M. Mc4son');

    await selectedDirectors(0).remove();
    await selectedAdministrators(1).remove();
    await manager.directorSearch.search('guy');
    await manager.directorSearch.results(0).add();

    await manager.administratorSearch.search('guy');
    await manager.administratorSearch.results(0).add();

    assert.equal(selectedDirectors().count, 2);
    assert.equal(selectedDirectors(0).text, '0 guy M. Mc0son');
    assert.equal(selectedDirectors(1).text, '2 guy M. Mc2son');

    assert.equal(selectedAdministrators().count, 2);
    assert.equal(selectedAdministrators(0).text, '0 guy M. Mc0son');
    assert.equal(selectedAdministrators(1).text, '3 guy M. Mc3son');
  });

  test('cancel leadership changes', async function (assert) {
    assert.expect(6);
    await page.visit({ courseId: 1, details: true, courseLeadershipDetails: true });
    await page.leadershipExpanded.manage();
    const manager = page.leadershipExpanded.leadershipManager;
    const { selectedDirectors, selectedAdministrators } = manager;
    await selectedDirectors(0).remove();
    await selectedAdministrators(1).remove();
    await manager.directorSearch.search('guy');
    await manager.directorSearch.results(3).add();

    await manager.administratorSearch.search('guy');
    await manager.administratorSearch.results(1).add();

    await page.leadershipExpanded.cancel();
    const { directors, administrators } = page.leadershipExpanded.leadershipList;
    assert.equal(directors().count, 2);
    assert.equal(directors(0).text, '1 guy M. Mc1son');
    assert.equal(directors(1).text, '2 guy M. Mc2son');

    assert.equal(administrators().count, 2);
    assert.equal(administrators(0).text, '3 guy M. Mc3son');
    assert.equal(administrators(1).text, '4 guy M. Mc4son');
  });

  test('save leadership changes', async function (assert) {
    assert.expect(6);
    await page.visit({ courseId: 1, details: true, courseLeadershipDetails: true });
    await page.leadershipExpanded.manage();
    const manager = page.leadershipExpanded.leadershipManager;
    const { selectedDirectors, selectedAdministrators } = manager;
    await selectedDirectors(0).remove();
    await selectedAdministrators(1).remove();
    await manager.directorSearch.search('guy');
    await manager.directorSearch.results(3).add();

    await manager.administratorSearch.search('guy');
    await manager.administratorSearch.results(1).add();
    await page.leadershipExpanded.save();
    const { directors, administrators } = page.leadershipExpanded.leadershipList;
    assert.equal(directors().count, 2);
    assert.equal(directors(0).text, '2 guy M. Mc2son');
    assert.equal(directors(1).text, '3 guy M. Mc3son');

    assert.equal(administrators().count, 2);
    assert.equal(administrators(0).text, '1 guy M. Mc1son');
    assert.equal(administrators(1).text, '3 guy M. Mc3son');
  });
});
