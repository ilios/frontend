import { module, test } from 'qunit';
import { currentURL } from '@ember/test-helpers';
import { setupApplicationTest, takeScreenshot } from 'frontend/tests/helpers';
import { setupAuthentication } from 'ilios-common';
import page from 'frontend/tests/pages/school';
import percySnapshot from '@percy/ember';

module('Acceptance | school/competencies', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    await setupAuthentication({ administeredSchools: [this.school] });

    const domains = this.server.createList('competency', 2, {
      school: this.school,
    });
    this.server.create('aamc-pcrs', {
      competencies: [domains[0]],
    });
    this.server.createList('aamc-pcrs', 3);

    this.server.createList('competency', 1, {
      school: this.school,
      parent: domains[0],
    });
  });

  test('collapsed competencies', async function (assert) {
    await page.visit({ schoolId: this.school.id });
    assert.strictEqual(currentURL(), '/schools/1');
    await takeScreenshot(assert);
    await percySnapshot(assert);

    assert.strictEqual(page.manager.schoolCompetenciesCollapsed.title.text, 'Competencies (2/1)');
    const { domains } = page.manager.schoolCompetenciesCollapsed;
    assert.strictEqual(domains.length, 2);
    assert.strictEqual(domains[0].title, 'competency 0');
    assert.strictEqual(domains[0].summary, 'There is 1 subcompetency');
    assert.strictEqual(domains[1].title, 'competency 1');
    assert.strictEqual(domains[1].summary, 'There are 0 subcompetencies');
  });

  test('expanded competencies', async function (assert) {
    await page.visit({ schoolId: this.school.id, schoolCompetencyDetails: true });
    await takeScreenshot(assert);
    await percySnapshot(assert);

    assert.strictEqual(
      page.manager.schoolCompetenciesExpanded.collapser.text,
      'Competencies (2/1)',
    );
    const { items } = page.manager.schoolCompetenciesExpanded.competenciesList;
    assert.strictEqual(items.length, 3);
    assert.strictEqual(items[0].title.text, 'competency 0');
    assert.strictEqual(items[1].title.text, 'competency 2');
    assert.strictEqual(items[2].title.text, 'competency 1');

    assert.strictEqual(items[0].pcrs.items.length, 1);
    assert.strictEqual(items[0].pcrs.items[0].text, '1 aamc pcrs 0');

    assert.strictEqual(items[1].pcrs.items.length, 1);
    assert.strictEqual(items[1].pcrs.items[0].text, 'Click to edit');

    assert.strictEqual(items[2].pcrs.items.length, 1);
    assert.strictEqual(items[2].pcrs.items[0].text, 'Click to edit');
  });

  test('manager', async function (assert) {
    await page.visit({ schoolId: this.school.id, schoolCompetencyDetails: true });

    await page.manager.schoolCompetenciesExpanded.manage();
    await takeScreenshot(assert);
    await percySnapshot(assert);
    const { domains } = page.manager.schoolCompetenciesExpanded.competenciesManager;

    assert.strictEqual(domains.length, 2);
    assert.strictEqual(domains[0].details.editor.text, 'competency 0');
    assert.strictEqual(domains[0].competencies.length, 1);
    assert.strictEqual(domains[0].competencies[0].editor.text, 'competency 2');
    assert.strictEqual(domains[1].details.editor.text, 'competency 1');
  });

  test('add new domain', async function (assert) {
    await page.visit({ schoolId: this.school.id, schoolCompetencyDetails: true });

    const { schoolCompetenciesExpanded: e } = page.manager;
    await e.manage();
    await e.competenciesManager.newDomain.newCompetency.title.set('new domain');
    await e.competenciesManager.newDomain.newCompetency.save();

    const { domains } = e.competenciesManager;
    assert.strictEqual(domains.length, 3);
    assert.strictEqual(domains[0].details.editor.text, 'competency 0');
    assert.strictEqual(domains[0].competencies.length, 1);
    assert.strictEqual(domains[0].competencies[0].editor.text, 'competency 2');
    assert.strictEqual(domains[1].details.editor.text, 'competency 1');
    assert.strictEqual(domains[1].competencies.length, 0);
    assert.strictEqual(domains[2].details.editor.text, 'new domain');
    assert.strictEqual(domains[2].competencies.length, 0);
  });

  test('add new sub competency', async function (assert) {
    await page.visit({ schoolId: this.school.id, schoolCompetencyDetails: true });

    const { schoolCompetenciesExpanded: e } = page.manager;
    await e.manage();
    const { domains } = e.competenciesManager;
    await domains[0].newCompetency.title.set('new sub competency');
    await domains[0].newCompetency.save();

    assert.strictEqual(domains.length, 2);
    assert.strictEqual(domains[0].details.editor.text, 'competency 0');
    assert.strictEqual(domains[0].competencies.length, 2);
    assert.strictEqual(domains[0].competencies[0].editor.text, 'competency 2');
    assert.strictEqual(domains[0].competencies[1].editor.text, 'new sub competency');
    assert.strictEqual(domains[1].details.editor.text, 'competency 1');
    assert.strictEqual(domains[1].competencies.length, 0);
  });

  test('edit domain title', async function (assert) {
    await page.visit({ schoolId: this.school.id, schoolCompetencyDetails: true });

    const { schoolCompetenciesExpanded: e } = page.manager;
    await e.manage();
    const { domains } = e.competenciesManager;
    await domains[0].details.editor.title.edit();
    await domains[0].details.editor.title.set('new title');
    await domains[0].details.editor.title.save();
    assert.strictEqual(domains.length, 2);
    assert.strictEqual(domains[0].details.editor.text, 'competency 1');
    assert.strictEqual(domains[1].details.editor.text, 'new title');
  });

  test('edit competency title', async function (assert) {
    await page.visit({ schoolId: this.school.id, schoolCompetencyDetails: true });

    await page.manager.schoolCompetenciesExpanded.manage();
    await takeScreenshot(assert);
    await percySnapshot(assert);
    const { domains } = page.manager.schoolCompetenciesExpanded.competenciesManager;

    await domains[0].competencies[0].editor.title.edit();
    await domains[0].competencies[0].editor.title.set('new title');
    await domains[0].competencies[0].editor.title.save();

    assert.strictEqual(domains.length, 2);
    assert.strictEqual(domains[0].details.editor.text, 'competency 0');
    assert.strictEqual(domains[0].competencies.length, 1);
    assert.strictEqual(domains[0].competencies[0].editor.text, 'new title');
    assert.strictEqual(domains[1].details.editor.text, 'competency 1');
  });

  test('save changes', async function (assert) {
    await page.visit({ schoolId: this.school.id, schoolCompetencyDetails: true });
    const { schoolCompetenciesExpanded: e } = page.manager;
    await e.manage();
    const { domains } = e.competenciesManager;
    await domains[0].details.editor.title.edit();
    await domains[0].details.editor.title.set('aa domain');
    await domains[0].details.editor.title.save();
    await domains[0].competencies[0].editor.title.edit();
    await domains[0].competencies[0].editor.title.set('aa competency');
    await domains[0].competencies[0].editor.title.save();
    await domains[0].newCompetency.title.set('new sub competency');
    await domains[0].newCompetency.save();
    await domains[1].remove();
    await domains[0].competencies[0].remove();
    await e.competenciesManager.newDomain.newCompetency.title.set('new domain');
    await e.competenciesManager.newDomain.newCompetency.save();

    await e.save();

    const { items } = e.competenciesList;
    assert.strictEqual(items.length, 3);
    assert.strictEqual(items[0].title.text, 'aa domain');
    assert.strictEqual(items[1].title.text, 'new sub competency');
    assert.strictEqual(items[2].title.text, 'new domain');
  });
});
