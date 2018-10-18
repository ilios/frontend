import {
  module,
  test
} from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupAuthentication } from 'ilios-common';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from 'ilios-common/page-objects/session';

module('Acceptance | Session - Leadership', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function() {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school, administeredSchools: [this.school] });
    this.server.create('academicYear', {id: 2013});

    const users = this.server.createList('user', 4);
    const course = this.server.create('course', {
      year: 2013,
      school: this.school,
      directors: [users[0], users[1]],
      administrators: [users[2], users[3]],
    });
    this.session = this.server.create('session', {
      course,
      administrators: [users[2], users[3]],
    });
  });

  test('collapsed leadership', async function (assert) {
    assert.expect(6);
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.equal(page.leadershipCollapsed.title, 'Session Administration');
    assert.equal(page.leadershipCollapsed.headers().count, 1);
    assert.equal(page.leadershipCollapsed.headers(0).title, 'Summary');

    assert.equal(page.leadershipCollapsed.summary().count, 1);
    assert.equal(page.leadershipCollapsed.summary(0).name, 'Administrators');
    assert.equal(page.leadershipCollapsed.summary(0).value, 'There are 2 administrators');
  });

  test('list leadership', async function (assert) {
    assert.expect(4);
    await page.visit({ courseId: 1, sessionId: 1, sessionLeadershipDetails: true });

    assert.equal(page.leadershipExpanded.title, 'Session Administration');
    const { administrators } = page.leadershipExpanded.leadershipList;

    assert.equal(administrators().count, 2);
    assert.equal(administrators(0).text, '3 guy M. Mc3son');
    assert.equal(administrators(1).text, '4 guy M. Mc4son');
  });

  test('search administrators', async function (assert) {
    assert.expect(11);
    await page.visit({ courseId: 1, sessionId: 1, sessionLeadershipDetails: true });
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

  test('manage leadership', async function (assert) {
    assert.expect(6);
    await page.visit({ courseId: 1, sessionId: 1, sessionLeadershipDetails: true });
    await page.leadershipExpanded.manage();
    const manager = page.leadershipExpanded.leadershipManager;

    const { selectedAdministrators } = manager;

    assert.equal(selectedAdministrators().count, 2);
    assert.equal(selectedAdministrators(0).text, '3 guy M. Mc3son');
    assert.equal(selectedAdministrators(1).text, '4 guy M. Mc4son');

    await selectedAdministrators(1).remove();

    await manager.administratorSearch.search('guy');
    await manager.administratorSearch.results(0).add();

    assert.equal(selectedAdministrators().count, 2);
    assert.equal(selectedAdministrators(0).text, '0 guy M. Mc0son');
    assert.equal(selectedAdministrators(1).text, '3 guy M. Mc3son');
  });

  test('cancel leadership changes', async function (assert) {
    assert.expect(3);
    await page.visit({ courseId: 1, sessionId: 1, sessionLeadershipDetails: true });
    await page.leadershipExpanded.manage();
    const manager = page.leadershipExpanded.leadershipManager;
    const { selectedAdministrators } = manager;
    await selectedAdministrators(1).remove();

    await manager.administratorSearch.search('guy');
    await manager.administratorSearch.results(1).add();

    await page.leadershipExpanded.cancel();
    const { administrators } = page.leadershipExpanded.leadershipList;

    assert.equal(administrators().count, 2);
    assert.equal(administrators(0).text, '3 guy M. Mc3son');
    assert.equal(administrators(1).text, '4 guy M. Mc4son');
  });

  test('save leadership changes', async function (assert) {
    assert.expect(3);
    await page.visit({ courseId: 1, sessionId: 1, sessionLeadershipDetails: true });
    await page.leadershipExpanded.manage();
    const manager = page.leadershipExpanded.leadershipManager;
    const { selectedAdministrators } = manager;
    await selectedAdministrators(1).remove();

    await manager.administratorSearch.search('guy');
    await manager.administratorSearch.results(1).add();
    await page.leadershipExpanded.save();
    const { administrators } = page.leadershipExpanded.leadershipList;

    assert.equal(administrators().count, 2);
    assert.equal(administrators(0).text, '1 guy M. Mc1son');
    assert.equal(administrators(1).text, '3 guy M. Mc3son');
  });
});
