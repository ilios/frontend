import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';

import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import page from 'ilios-common/page-objects/course';

module('Acceptance | Course - Terms', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.user = await setupAuthentication();
    this.school = this.server.create('school');
    this.server.create('vocabulary', {
      school: this.school,
      active: true,
    });
    this.server.create('academicYear', { id: 2013 });

    this.server.create('term', {
      vocabularyId: 1,
      active: true,
    });
    this.server.create('term', {
      vocabularyId: 1,
      active: true,
    });

    this.course = this.server.create('course', {
      year: 2013,
      school: this.school,
      termIds: [1],
    });
  });

  test('taxonomy summary', async function (assert) {
    assert.expect(9);
    await page.visit({ courseId: 1, details: true });
    assert.strictEqual(page.collapsedTaxonomies.title, 'Terms (' + this.course.terms.length + ')');
    assert.strictEqual(page.collapsedTaxonomies.headers.length, 3);
    assert.strictEqual(page.collapsedTaxonomies.headers[0].title, 'Vocabulary');
    assert.strictEqual(page.collapsedTaxonomies.headers[1].title, 'School');
    assert.strictEqual(page.collapsedTaxonomies.headers[2].title, 'Assigned Terms');

    assert.strictEqual(page.collapsedTaxonomies.vocabularies.length, 1);
    assert.strictEqual(page.collapsedTaxonomies.vocabularies[0].name, 'Vocabulary 1');
    assert.strictEqual(page.collapsedTaxonomies.vocabularies[0].school, 'school 0');
    assert.strictEqual(
      page.collapsedTaxonomies.vocabularies[0].terms.length,
      this.course.terms.length
    );
  });

  test('list terms', async function (assert) {
    assert.expect(4);
    await page.visit({
      courseId: 1,
      details: true,
      courseTaxonomyDetails: true,
    });
    assert.strictEqual(page.taxonomies.vocabularies.length, 1);
    assert.strictEqual(page.taxonomies.vocabularies[0].vocabularyName, 'Vocabulary 1');
    assert.strictEqual(page.taxonomies.vocabularies[0].terms.length, 1);
    assert.strictEqual(page.taxonomies.vocabularies[0].terms[0].name, 'term 0');
  });

  test('manage terms', async function (assert) {
    assert.expect(10);
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({
      courseId: 1,
      details: true,
      courseTaxonomyDetails: true,
    });
    assert.strictEqual(page.taxonomies.vocabularies.length, 1);
    await page.taxonomies.manage();

    assert.strictEqual(page.taxonomies.manager.selectedTerms.length, 1);
    assert.strictEqual(page.taxonomies.manager.selectedTerms[0].vocabularyName, 'Vocabulary 1');
    assert.strictEqual(page.taxonomies.manager.selectedTerms[0].terms.length, 1);
    assert.strictEqual(page.taxonomies.manager.selectedTerms[0].terms[0].name, 'term 0');
    assert.strictEqual(page.taxonomies.manager.availableTerms.length, 2);
    assert.strictEqual(page.taxonomies.manager.availableTerms[0].name, 'term 0');
    assert.ok(page.taxonomies.manager.availableTerms[0].isSelected);
    assert.strictEqual(page.taxonomies.manager.availableTerms[1].name, 'term 1');
    assert.ok(page.taxonomies.manager.availableTerms[1].notSelected);
  });

  test('save term changes', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(5);
    await page.visit({
      courseId: 1,
      details: true,
      courseTaxonomyDetails: true,
    });
    assert.strictEqual(page.taxonomies.vocabularies.length, 1);
    await page.taxonomies.manage();
    await page.taxonomies.manager.selectedTerms[0].terms[0].remove();
    await page.taxonomies.manager.availableTerms[1].toggle();
    await page.taxonomies.save();

    assert.strictEqual(page.taxonomies.vocabularies.length, 1);
    assert.strictEqual(page.taxonomies.vocabularies[0].vocabularyName, 'Vocabulary 1');
    assert.strictEqual(page.taxonomies.vocabularies[0].terms.length, 1);
    assert.strictEqual(page.taxonomies.vocabularies[0].terms[0].name, 'term 1');
  });

  test('cancel term changes', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(5);
    await page.visit({
      courseId: 1,
      details: true,
      courseTaxonomyDetails: true,
    });
    assert.strictEqual(page.taxonomies.vocabularies.length, 1);
    await page.taxonomies.manage();
    await page.taxonomies.manager.selectedTerms[0].terms[0].remove();
    await page.taxonomies.manager.availableTerms[1].toggle();
    await page.taxonomies.cancel();

    assert.strictEqual(page.taxonomies.vocabularies.length, 1);
    assert.strictEqual(page.taxonomies.vocabularies[0].vocabularyName, 'Vocabulary 1');
    assert.strictEqual(page.taxonomies.vocabularies[0].terms.length, 1);
    assert.strictEqual(page.taxonomies.vocabularies[0].terms[0].name, 'term 0');
  });
});
