import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from 'ilios/tests/pages/curriculum-inventory-report';

module('Acceptance | curriculum inventory leadership', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school],
    });
    const program = this.server.create('program', { school: this.school });
    const users = this.server.createList('user', 4);
    this.report = this.server.create('curriculum-inventory-report', {
      program,
      administrators: [users[2], users[3]],
    });
    this.reportModel = await this.owner
      .lookup('service:store')
      .find('curriculumInventoryReport', this.report.id);
  });

  test('collapsed leadership', async function (assert) {
    await page.visit({ reportId: this.reportModel.id });
    assert.strictEqual(
      page.details.leadershipCollapsed.title,
      'Curriculum Inventory Report Leadership'
    );
    assert.strictEqual(page.details.leadershipCollapsed.headers.length, 1);
    assert.strictEqual(page.details.leadershipCollapsed.headers[0].title, 'Summary');
    assert.strictEqual(page.details.leadershipCollapsed.summary.length, 1);
    assert.strictEqual(page.details.leadershipCollapsed.summary[0].name, 'Administrators');
    assert.strictEqual(
      page.details.leadershipCollapsed.summary[0].value,
      'There are 2 administrators'
    );
  });

  test('list leadership', async function (assert) {
    await page.visit({ reportId: this.reportModel.id, leadershipDetails: true });
    assert.strictEqual(
      page.details.leadershipExpanded.collapse.text,
      'Curriculum Inventory Report Leadership'
    );
    const { administrators } = page.details.leadershipExpanded.leadershipList;
    assert.strictEqual(administrators.length, 2);
    assert.strictEqual(administrators[0].text, '3 guy M. Mc3son');
    assert.strictEqual(administrators[1].text, '4 guy M. Mc4son');
  });

  test('search administrators', async function (assert) {
    await page.visit({ reportId: this.reportModel.id, leadershipDetails: true });
    await page.details.leadershipExpanded.manage.click();
    const manager = page.details.leadershipExpanded.leadershipManager;
    await manager.administratorSearch.search('guy');
    assert.strictEqual(manager.administratorSearch.results.length, 5);
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
  });

  test('manage leadership', async function (assert) {
    await page.visit({ reportId: this.reportModel.id, leadershipDetails: true });
    await page.details.leadershipExpanded.manage.click();
    const manager = page.details.leadershipExpanded.leadershipManager;
    const { selectedAdministrators } = manager;
    assert.strictEqual(selectedAdministrators.length, 2);
    assert.strictEqual(selectedAdministrators[0].text, '3 guy M. Mc3son');
    assert.strictEqual(selectedAdministrators[1].text, '4 guy M. Mc4son');
    await selectedAdministrators[1].remove();
    await manager.administratorSearch.search('guy');
    await manager.administratorSearch.results[0].add();
    assert.strictEqual(selectedAdministrators.length, 2);
    assert.strictEqual(selectedAdministrators[0].text, '0 guy M. Mc0son');
    assert.strictEqual(selectedAdministrators[1].text, '3 guy M. Mc3son');
  });

  test('cancel leadership changes', async function (assert) {
    await page.visit({ reportId: this.reportModel.id, leadershipDetails: true });
    await page.details.leadershipExpanded.manage.click();
    const manager = page.details.leadershipExpanded.leadershipManager;
    const { selectedAdministrators } = manager;
    await selectedAdministrators[1].remove();
    await manager.administratorSearch.search('guy');
    await manager.administratorSearch.results[1].add();
    await page.details.leadershipExpanded.cancel.click();
    const { administrators } = page.details.leadershipExpanded.leadershipList;
    assert.strictEqual(administrators.length, 2);
    assert.strictEqual(administrators[0].text, '3 guy M. Mc3son');
    assert.strictEqual(administrators[1].text, '4 guy M. Mc4son');
  });

  test('save leadership changes', async function (assert) {
    await page.visit({ reportId: this.reportModel.id, leadershipDetails: true });
    await page.details.leadershipExpanded.manage.click();
    const manager = page.details.leadershipExpanded.leadershipManager;
    const { selectedAdministrators } = manager;
    await selectedAdministrators[1].remove();
    await manager.administratorSearch.search('guy');
    await manager.administratorSearch.results[1].add();
    await page.details.leadershipExpanded.save.click();
    const { administrators } = page.details.leadershipExpanded.leadershipList;
    assert.strictEqual(administrators.length, 2);
    assert.strictEqual(administrators[0].text, '1 guy M. Mc1son');
    assert.strictEqual(administrators[1].text, '3 guy M. Mc3son');
  });
});
