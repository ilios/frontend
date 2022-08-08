import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from 'ilios/tests/pages/program-year';

module('Acceptance | Program Year - Terms', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
    const vocabulary = this.server.create('vocabulary', {
      school: this.school,
      active: true,
    });
    const program = this.server.create('program', {
      school: this.school,
    });
    const programYear = this.server.create('programYear', {
      program,
    });
    this.server.create('cohort', { programYear });
    this.server.create('term', {
      programYears: [programYear],
      vocabulary,
      active: true,
    });
    this.server.create('term', {
      vocabulary,
      active: true,
    });
    this.program = program;
    this.programYear = programYear;
  });

  test('list terms', async function (assert) {
    await page.visit({
      programId: this.program.id,
      programYearId: this.programYear.id,
      pyTaxonomyDetails: true,
    });
    assert.strictEqual(page.details.detailTaxonomies.vocabularies.length, 1);
    assert.strictEqual(page.details.detailTaxonomies.vocabularies[0].terms.length, 1);
    assert.strictEqual(page.details.detailTaxonomies.vocabularies[0].terms[0].name, 'term 0');
  });

  test('manage terms', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({
      programId: this.program.id,
      programYearId: this.programYear.id,
      pyTaxonomyDetails: true,
    });
    await page.details.detailTaxonomies.manage();
    assert.strictEqual(page.details.detailTaxonomies.manager.selectedTerms.length, 1);
    assert.strictEqual(
      page.details.detailTaxonomies.manager.selectedTerms[0].title,
      'Vocabulary 1 (school 0)'
    );
    assert.strictEqual(page.details.detailTaxonomies.manager.selectedTerms[0].terms.length, 1);
    assert.strictEqual(
      page.details.detailTaxonomies.manager.selectedTerms[0].terms[0].name,
      'term 0'
    );
    assert.strictEqual(page.details.detailTaxonomies.manager.availableTerms.length, 2);
    assert.strictEqual(page.details.detailTaxonomies.manager.availableTerms[0].name, 'term 0');
    assert.strictEqual(page.details.detailTaxonomies.manager.availableTerms[1].name, 'term 1');
  });

  test('save term changes', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({
      programId: this.program.id,
      programYearId: this.programYear.id,
      pyTaxonomyDetails: true,
    });
    assert.strictEqual(page.details.detailTaxonomies.vocabularies[0].terms.length, 1);
    assert.strictEqual(page.details.detailTaxonomies.vocabularies[0].terms[0].name, 'term 0');
    await page.details.detailTaxonomies.manage();
    await page.details.detailTaxonomies.manager.selectedTerms[0].terms[0].remove();
    await page.details.detailTaxonomies.manager.availableTerms[1].toggle();
    await page.details.detailTaxonomies.save();
    assert.strictEqual(page.details.detailTaxonomies.vocabularies[0].terms.length, 1);
    assert.strictEqual(page.details.detailTaxonomies.vocabularies[0].terms[0].name, 'term 1');
  });

  test('cancel term changes', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({
      programId: this.program.id,
      programYearId: this.programYear.id,
      pyTaxonomyDetails: true,
    });
    assert.strictEqual(page.details.detailTaxonomies.vocabularies[0].terms.length, 1);
    assert.strictEqual(page.details.detailTaxonomies.vocabularies[0].terms[0].name, 'term 0');
    await page.details.detailTaxonomies.manage();
    await page.details.detailTaxonomies.manager.selectedTerms[0].terms[0].remove();
    await page.details.detailTaxonomies.manager.availableTerms[1].toggle();
    await page.details.detailTaxonomies.cancel();
    assert.strictEqual(page.details.detailTaxonomies.vocabularies[0].terms.length, 1);
    assert.strictEqual(page.details.detailTaxonomies.vocabularies[0].terms[0].name, 'term 0');
  });
});
