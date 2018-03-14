import {
  module,
  test
} from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from 'ilios/tests/pages/session';

module('Acceptance: Session - Terms', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.user = await setupAuthentication();
    this.server.create('school');
    this.server.create('vocabulary', {
      schoolId: 1,
      active: true,
    });
    this.server.create('academicYear', {id: 2013});

    server.create('term', {
      vocabularyId: 1,
      active: true
    });
    server.create('term', {
      vocabularyId: 1,
      active: true
    });

    const course = this.server.create('course', {
      year: 2013,
      schoolId: 1,
    });
    this.server.create('session', {
      course,
      termIds: [1]
    });
  });

  test('taxonomy summary', async function(assert) {
    assert.expect(9);
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.equal(page.collapsedTaxonomies.title, 'Terms (1)');
    assert.equal(page.collapsedTaxonomies.headers().count, 3);
    assert.equal(page.collapsedTaxonomies.headers(0).title, 'Vocabulary');
    assert.equal(page.collapsedTaxonomies.headers(1).title, 'School');
    assert.equal(page.collapsedTaxonomies.headers(2).title, 'Assigned Terms');

    assert.equal(page.collapsedTaxonomies.vocabularies().count, 1);
    assert.equal(page.collapsedTaxonomies.vocabularies(0).name, 'Vocabulary 1');
    assert.equal(page.collapsedTaxonomies.vocabularies(0).school, 'school 0');
    assert.equal(page.collapsedTaxonomies.vocabularies(0).terms, 1);
  });

  test('list terms', async function(assert) {
    assert.expect(4);
    await page.visit({ courseId: 1, sessionId: 1, sessionTaxonomyDetails: true });
    assert.equal(page.taxonomies.vocabularies().count, 1);
    assert.equal(page.taxonomies.vocabularies(0).name, 'Vocabulary 1');
    assert.equal(page.taxonomies.vocabularies(0).terms().count, 1);
    assert.equal(page.taxonomies.vocabularies(0).terms(0).name, 'term 0');
  });

  test('manage terms', async function(assert) {
    assert.expect(8);
    await page.visit({ courseId: 1, sessionId: 1, sessionTaxonomyDetails: true });
    assert.equal(page.taxonomies.vocabularies().count, 1);
    await page.taxonomies.manage();

    assert.equal(page.taxonomies.manager.selectedTerms().count, 1);
    assert.equal(page.taxonomies.manager.selectedTerms(0).name, 'term 0');
    assert.equal(page.taxonomies.manager.availableTerms().count, 2);
    assert.equal(page.taxonomies.manager.availableTerms(0).name, 'term 0');
    assert.ok(page.taxonomies.manager.availableTerms(0).isSelected);
    assert.equal(page.taxonomies.manager.availableTerms(1).name, 'term 1');
    assert.ok(page.taxonomies.manager.availableTerms(1).notSelected);
  });

  test('save term changes', async function(assert) {
    assert.expect(5);
    await page.visit({ courseId: 1, sessionId: 1, sessionTaxonomyDetails: true });
    assert.equal(page.taxonomies.vocabularies().count, 1);
    await page.taxonomies.manage();
    await page.taxonomies.manager.selectedTerms(0).remove();
    await page.taxonomies.manager.availableTerms(1).add();
    await page.taxonomies.save();


    assert.equal(page.taxonomies.vocabularies().count, 1);
    assert.equal(page.taxonomies.vocabularies(0).name, 'Vocabulary 1');
    assert.equal(page.taxonomies.vocabularies(0).terms().count, 1);
    assert.equal(page.taxonomies.vocabularies(0).terms(0).name, 'term 1');
  });

  test('cancel term changes', async function(assert) {
    assert.expect(5);
    await page.visit({ courseId: 1, sessionId: 1, sessionTaxonomyDetails: true });
    assert.equal(page.taxonomies.vocabularies().count, 1);
    await page.taxonomies.manage();
    await page.taxonomies.manager.selectedTerms(0).remove();
    await page.taxonomies.manager.availableTerms(1).add();
    await page.taxonomies.cancel();

    assert.equal(page.taxonomies.vocabularies().count, 1);
    assert.equal(page.taxonomies.vocabularies(0).name, 'Vocabulary 1');
    assert.equal(page.taxonomies.vocabularies(0).terms().count, 1);
    assert.equal(page.taxonomies.vocabularies(0).terms(0).name, 'term 0');
  });
});
