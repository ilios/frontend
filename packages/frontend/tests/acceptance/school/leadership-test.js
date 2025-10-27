import { module, test } from 'qunit';
import { currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'frontend/tests/helpers';
import { setupAuthentication } from 'ilios-common';
import page from 'frontend/tests/pages/school';
import percySnapshot from '@percy/ember';

module('Acceptance | school/leadership', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    await setupAuthentication({ administeredSchools: [this.school] });

    this.server.createList('user', 2, {
      directedSchools: [this.school],
      school: this.school,
    });
    this.server.createList('user', 1, {
      administeredSchools: [this.school],
      school: this.school,
    });
    this.server.createList('user', 2, {
      school: this.school,
    });
  });

  test('collapsed leadership', async function (assert) {
    await page.visit({ schoolId: this.school.id });
    assert.strictEqual(currentURL(), '/schools/1');
    await percySnapshot(assert);

    assert.strictEqual(page.manager.schoolLeadershipCollapsed.title, 'Leadership (4)');
    assert.strictEqual(page.manager.schoolLeadershipCollapsed.headers.length, 1);
    assert.strictEqual(page.manager.schoolLeadershipCollapsed.headers[0].title, 'Summary');

    assert.strictEqual(page.manager.schoolLeadershipCollapsed.summary.length, 2);
    assert.strictEqual(page.manager.schoolLeadershipCollapsed.summary[0].name, 'Directors');
    assert.strictEqual(
      page.manager.schoolLeadershipCollapsed.summary[0].value,
      'There are 2 directors',
    );
    assert.strictEqual(page.manager.schoolLeadershipCollapsed.summary[1].name, 'Administrators');
    assert.strictEqual(
      page.manager.schoolLeadershipCollapsed.summary[1].value,
      'There are 2 administrators',
    );
  });

  test('list leadership', async function (assert) {
    await page.visit({
      schoolId: this.school.id,
      schoolLeadershipDetails: true,
    });
    await percySnapshot(assert);

    assert.strictEqual(page.manager.schoolLeadershipExpanded.title, 'Leadership (4)');
    const { directors, administrators } = page.manager.schoolLeadershipExpanded.leadershipList;
    assert.strictEqual(directors.length, 2);
    assert.strictEqual(directors[0].text, '1 guy M. Mc1son');
    assert.strictEqual(directors[1].text, '2 guy M. Mc2son');

    assert.strictEqual(administrators.length, 2);
    assert.strictEqual(administrators[0].text, '0 guy M. Mc0son');
    assert.strictEqual(administrators[1].text, '3 guy M. Mc3son');
  });

  test('search administrators', async function (assert) {
    await page.visit({
      schoolId: this.school.id,
      schoolLeadershipDetails: true,
    });
    await page.manager.schoolLeadershipExpanded.manage();
    const manager = page.manager.schoolLeadershipExpanded.leadershipManager;
    await manager.administratorSearch.search('guy');
    assert.strictEqual(manager.administratorSearch.results.length, 6);
    assert.strictEqual(
      manager.administratorSearch.results[0].text,
      '0 guy M. Mc0son user@example.edu',
    );
    assert.ok(manager.administratorSearch.results[0].isSelected);
    assert.strictEqual(
      manager.administratorSearch.results[1].text,
      '1 guy M. Mc1son user@example.edu',
    );
    assert.ok(manager.administratorSearch.results[1].isSelectable);
    assert.strictEqual(
      manager.administratorSearch.results[2].text,
      '2 guy M. Mc2son user@example.edu',
    );
    assert.ok(manager.administratorSearch.results[2].isSelectable);
    assert.strictEqual(
      manager.administratorSearch.results[3].text,
      '3 guy M. Mc3son user@example.edu',
    );
    assert.ok(manager.administratorSearch.results[3].isSelected);
    assert.strictEqual(
      manager.administratorSearch.results[4].text,
      '4 guy M. Mc4son user@example.edu',
    );
    assert.ok(manager.administratorSearch.results[4].isSelectable);
    assert.strictEqual(
      manager.administratorSearch.results[5].text,
      '5 guy M. Mc5son user@example.edu',
    );
    assert.ok(manager.administratorSearch.results[5].isSelectable);
  });

  test('search directors', async function (assert) {
    await page.visit({
      schoolId: this.school.id,
      schoolLeadershipDetails: true,
    });
    await page.manager.schoolLeadershipExpanded.manage();
    const manager = page.manager.schoolLeadershipExpanded.leadershipManager;
    await manager.directorSearch.search('guy');
    assert.strictEqual(manager.directorSearch.results.length, 6);
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
  });

  test('manage leadership', async function (assert) {
    await page.visit({
      schoolId: this.school.id,
      schoolLeadershipDetails: true,
    });
    await page.manager.schoolLeadershipExpanded.manage();
    const manager = page.manager.schoolLeadershipExpanded.leadershipManager;

    const { selectedDirectors, selectedAdministrators } = manager;
    assert.strictEqual(selectedDirectors.length, 2);
    assert.strictEqual(selectedDirectors[0].text, '1 guy M. Mc1son');
    assert.strictEqual(selectedDirectors[1].text, '2 guy M. Mc2son');

    assert.strictEqual(selectedAdministrators.length, 2);
    assert.strictEqual(selectedAdministrators[0].text, '0 guy M. Mc0son');
    assert.strictEqual(selectedAdministrators[1].text, '3 guy M. Mc3son');

    await selectedDirectors[0].remove();
    await selectedAdministrators[1].remove();
    await manager.directorSearch.search('guy');
    await manager.directorSearch.results[0].add();

    await manager.administratorSearch.search('guy');
    await manager.administratorSearch.results[1].add();

    assert.strictEqual(selectedDirectors.length, 2);
    assert.strictEqual(selectedDirectors[0].text, '0 guy M. Mc0son');
    assert.strictEqual(selectedDirectors[1].text, '2 guy M. Mc2son');

    assert.strictEqual(selectedAdministrators.length, 2);
    assert.strictEqual(selectedAdministrators[0].text, '0 guy M. Mc0son');
    assert.strictEqual(selectedAdministrators[1].text, '1 guy M. Mc1son');
  });

  test('cancel leadership changes', async function (assert) {
    await page.visit({
      schoolId: this.school.id,
      schoolLeadershipDetails: true,
    });
    await page.manager.schoolLeadershipExpanded.manage();
    const manager = page.manager.schoolLeadershipExpanded.leadershipManager;
    const { selectedDirectors, selectedAdministrators } = manager;
    await selectedDirectors[0].remove();
    await selectedAdministrators[1].remove();

    await manager.directorSearch.search('guy');
    await manager.directorSearch.results[3].add();

    await manager.administratorSearch.search('guy');
    await manager.administratorSearch.results[1].add();

    await page.manager.schoolLeadershipExpanded.cancel();
    const { directors, administrators } = page.manager.schoolLeadershipExpanded.leadershipList;
    assert.strictEqual(directors.length, 2);
    assert.strictEqual(directors[0].text, '1 guy M. Mc1son');
    assert.strictEqual(directors[1].text, '2 guy M. Mc2son');

    assert.strictEqual(administrators.length, 2);
    assert.strictEqual(administrators[0].text, '0 guy M. Mc0son');
    assert.strictEqual(administrators[1].text, '3 guy M. Mc3son');
  });

  test('save leadership changes', async function (assert) {
    await page.visit({
      schoolId: this.school.id,
      schoolLeadershipDetails: true,
    });
    await page.manager.schoolLeadershipExpanded.manage();
    const manager = page.manager.schoolLeadershipExpanded.leadershipManager;
    const { selectedDirectors, selectedAdministrators } = manager;
    await selectedDirectors[0].remove();
    await selectedAdministrators[1].remove();
    await manager.directorSearch.search('guy');
    await manager.directorSearch.results[0].add();

    await manager.administratorSearch.search('guy');
    await manager.administratorSearch.results[1].add();

    await page.manager.schoolLeadershipExpanded.save();
    const { directors, administrators } = page.manager.schoolLeadershipExpanded.leadershipList;
    assert.strictEqual(directors.length, 2);
    assert.strictEqual(directors[0].text, '0 guy M. Mc0son');
    assert.strictEqual(directors[1].text, '2 guy M. Mc2son');

    assert.strictEqual(administrators.length, 2);
    assert.strictEqual(administrators[0].text, '0 guy M. Mc0son');
    assert.strictEqual(administrators[1].text, '1 guy M. Mc1son');
  });
});
