import { module, test } from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from 'ilios/tests/pages/program-year';

module('Acceptance | Program Year - Competencies', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
    this.server.create('program', {
      school: this.school,
    });
    this.server.create('programYear', {
      programId: 1,
    });
    this.server.create('cohort', {
      programYearId: 1,
    });
    this.server.create('competency', {
      school: this.school,
    });
    this.server.createList('competency', 2, {
      parentId: 1,
      school: this.school,
      programYearIds: [1],
    });
    this.server.create('competency', {
      school: this.school,
    });
    this.server.createList('competency', 2, {
      school: this.school,
      parentId: 4,
    });
  });

  test('list', async function (assert) {
    await page.visit({ programId: 1, programYearId: 1, pyCompetencyDetails: true });
    assert.strictEqual(page.details.competencies.title, 'Competencies (2)');
    assert.strictEqual(page.details.competencies.list.domains.length, 1);
    assert.strictEqual(page.details.competencies.list.domains[0].title, 'competency 0');
    assert.strictEqual(page.details.competencies.list.domains[0].competencies.length, 2);
    assert.strictEqual(
      page.details.competencies.list.domains[0].competencies[0].text,
      'competency 1'
    );
    assert.strictEqual(
      page.details.competencies.list.domains[0].competencies[1].text,
      'competency 2'
    );
  });

  test('list with permission to edit', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ programId: 1, programYearId: 1, pyCompetencyDetails: true });
    assert.strictEqual(page.details.competencies.title, 'Competencies (2)');
    assert.strictEqual(page.details.competencies.list.domains.length, 1);
    assert.strictEqual(page.details.competencies.list.domains[0].title, 'competency 0');
    assert.strictEqual(page.details.competencies.list.domains[0].competencies.length, 2);
    assert.strictEqual(
      page.details.competencies.list.domains[0].competencies[0].text,
      'competency 1'
    );
    assert.strictEqual(
      page.details.competencies.list.domains[0].competencies[1].text,
      'competency 2'
    );
  });

  test('manager list', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ programId: 1, programYearId: 1, pyCompetencyDetails: true });
    await page.details.competencies.manage();

    const { manager } = page.details.competencies;

    assert.strictEqual(manager.domains.length, 2);
    assert.strictEqual(manager.domains[0].title, 'competency 0');
    assert.ok(manager.domains[0].isIndeterminate);
    assert.strictEqual(manager.domains[0].competencies.length, 2);
    assert.strictEqual(manager.domains[0].competencies[0].text, 'competency 1');
    assert.ok(manager.domains[0].competencies[0].isChecked);
    assert.strictEqual(manager.domains[0].competencies[1].text, 'competency 2');
    assert.ok(manager.domains[0].competencies[1].isChecked);
  });

  test('change and save', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ programId: 1, programYearId: 1, pyCompetencyDetails: true });
    await page.details.competencies.manage();

    const { manager } = page.details.competencies;

    assert.strictEqual(manager.domains[1].title, 'competency 3');
    assert.strictEqual(manager.domains[1].competencies.length, 2);
    assert.strictEqual(manager.domains[1].competencies[0].text, 'competency 4');
    assert.notOk(manager.domains[1].competencies[0].isChecked);
    assert.strictEqual(manager.domains[1].competencies[1].text, 'competency 5');
    assert.notOk(manager.domains[1].competencies[1].isChecked);

    await manager.domains[1].click();
    await manager.domains[1].competencies[0].click();
    await manager.domains[0].competencies[1].click();
    await page.details.competencies.save();

    assert.strictEqual(page.details.competencies.title, 'Competencies (3)');
    assert.strictEqual(page.details.competencies.list.domains.length, 2);
    assert.strictEqual(page.details.competencies.list.domains[0].title, 'competency 0');
    assert.strictEqual(page.details.competencies.list.domains[0].competencies.length, 1);
    assert.strictEqual(
      page.details.competencies.list.domains[0].competencies[0].text,
      'competency 1'
    );

    assert.strictEqual(page.details.competencies.list.domains[1].title, 'competency 3');
    assert.strictEqual(page.details.competencies.list.domains[1].competencies.length, 1);
    assert.strictEqual(
      page.details.competencies.list.domains[1].competencies[0].text,
      'competency 5'
    );
  });

  test('change and cancel', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ programId: 1, programYearId: 1, pyCompetencyDetails: true });
    await page.details.competencies.manage();

    const { manager } = page.details.competencies;

    assert.strictEqual(manager.domains[1].title, 'competency 3');
    assert.strictEqual(manager.domains[1].competencies.length, 2);
    assert.strictEqual(manager.domains[1].competencies[0].text, 'competency 4');
    assert.notOk(manager.domains[1].competencies[0].isChecked);
    assert.strictEqual(manager.domains[1].competencies[1].text, 'competency 5');
    assert.notOk(manager.domains[1].competencies[1].isChecked);

    await manager.domains[1].click();
    await manager.domains[1].competencies[0].click();
    await manager.domains[0].competencies[1].click();
    await page.details.competencies.cancel();

    assert.strictEqual(page.details.competencies.title, 'Competencies (2)');
    assert.strictEqual(page.details.competencies.list.domains.length, 1);
    assert.strictEqual(page.details.competencies.list.domains[0].title, 'competency 0');
    assert.strictEqual(page.details.competencies.list.domains[0].competencies.length, 2);
    assert.strictEqual(
      page.details.competencies.list.domains[0].competencies[0].text,
      'competency 1'
    );
    assert.strictEqual(
      page.details.competencies.list.domains[0].competencies[1].text,
      'competency 2'
    );
  });
});
