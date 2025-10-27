import { module, test } from 'qunit';
import { currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'frontend/tests/helpers';
import { setupAuthentication } from 'ilios-common';
import page from 'frontend/tests/pages/school';
import percySnapshot from '@percy/ember';

module('Acceptance | school/vocabularies', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    await setupAuthentication({ administeredSchools: [this.school] });

    this.server.create('vocabulary', {
      school: this.school,
      terms: this.server.createList('term', 2),
    });

    this.server.create('vocabulary', {
      school: this.school,
      terms: this.server.createList('term', 1),
    });
  });

  test('collapsed', async function (assert) {
    await page.visit({ schoolId: this.school.id });
    assert.strictEqual(currentURL(), '/schools/1');
    await percySnapshot(assert);
    const { schoolVocabulariesCollapsed: c } = page.manager;

    assert.strictEqual(c.title, 'Vocabularies (2)');
    assert.strictEqual(c.vocabularies.length, 2);
    assert.strictEqual(c.vocabularies[0].title, 'Vocabulary 1');
    assert.strictEqual(c.vocabularies[0].summary, 'There are 2 terms');
    assert.strictEqual(c.vocabularies[1].title, 'Vocabulary 2');
    assert.strictEqual(c.vocabularies[1].summary, 'There is 1 term');
  });

  test('expanded', async function (assert) {
    await page.visit({ schoolId: this.school.id, schoolVocabularyDetails: true });
    await percySnapshot(assert);
    const { schoolVocabulariesExpanded: c } = page.manager;

    assert.strictEqual(c.title, 'Vocabularies (2)');
    assert.strictEqual(c.vocabulariesList.vocabularies.length, 2);
    assert.strictEqual(c.vocabulariesList.vocabularies[0].title.text, 'Vocabulary 1');
    assert.strictEqual(c.vocabulariesList.vocabularies[0].termsCount, '2');
    assert.notOk(c.vocabulariesList.vocabularies[0].hasDeleteButton);
    assert.strictEqual(c.vocabulariesList.vocabularies[1].title.text, 'Vocabulary 2');
    assert.strictEqual(c.vocabulariesList.vocabularies[1].termsCount, '1');
    assert.notOk(c.vocabulariesList.vocabularies[1].hasDeleteButton);
  });

  test('add new vocabulary', async function (assert) {
    await page.visit({ schoolId: this.school.id, schoolVocabularyDetails: true });
    const { schoolVocabulariesExpanded: c } = page.manager;

    await c.openNewVocabularyForm();
    await c.newVocabularyForm.title.set('New Vocabulary');
    await c.newVocabularyForm.submit.click();

    assert.strictEqual(c.title, 'Vocabularies (3)');
    assert.strictEqual(c.vocabulariesList.vocabularies.length, 3);
    assert.strictEqual(c.vocabulariesList.vocabularies[0].title.text, 'New Vocabulary');
    assert.strictEqual(c.vocabulariesList.vocabularies[1].title.text, 'Vocabulary 1');
    assert.strictEqual(c.vocabulariesList.vocabularies[2].title.text, 'Vocabulary 2');
  });

  test('add new term', async function (assert) {
    await page.visit({ schoolId: this.school.id, schoolVocabularyDetails: true });
    const { schoolVocabulariesExpanded: c } = page.manager;

    await c.vocabulariesList.vocabularies[0].manage();
    assert.ok(c.vocabularyManager.isVisible);
    await c.vocabularyManager.terms.newTermForm.setTitle('New Term');
    await c.vocabularyManager.terms.newTermForm.save();
    await c.vocabularyManager.breadcrumbs.returnToList();

    await c.vocabulariesList.vocabularies[1].manage();
    assert.ok(c.vocabularyManager.isVisible);
    await c.vocabularyManager.terms.newTermForm.setTitle('New Term 2');
    await c.vocabularyManager.terms.newTermForm.save();
    await c.vocabularyManager.terms.newTermForm.setTitle('New Term 3');
    await c.vocabularyManager.terms.newTermForm.save();
    await c.vocabularyManager.terms.newTermForm.setTitle('New Term 4');
    await c.vocabularyManager.terms.newTermForm.save();
    await c.vocabularyManager.breadcrumbs.returnToList();

    assert.strictEqual(c.vocabulariesList.vocabularies.length, 2);
    assert.strictEqual(c.vocabulariesList.vocabularies[0].title.text, 'Vocabulary 1');
    assert.strictEqual(c.vocabulariesList.vocabularies[0].termsCount, '3');
    assert.strictEqual(c.vocabulariesList.vocabularies[1].title.text, 'Vocabulary 2');
    assert.strictEqual(c.vocabulariesList.vocabularies[1].termsCount, '4');
  });

  test('delete terms', async function (assert) {
    await page.visit({ schoolId: this.school.id, schoolVocabularyDetails: true });
    const { schoolVocabulariesExpanded: c } = page.manager;

    await c.vocabulariesList.vocabularies[0].manage();
    assert.ok(c.vocabularyManager.isVisible);
    await c.vocabularyManager.terms.list[1].click();
    assert.ok(c.termManager.isVisible);
    await c.termManager.delete();
    await c.vocabularyManager.breadcrumbs.returnToList();

    await c.vocabulariesList.vocabularies[1].manage();
    assert.ok(c.vocabularyManager.isVisible);
    await c.vocabularyManager.terms.list[0].click();
    assert.ok(c.termManager.isVisible);
    await c.termManager.delete();
    await c.vocabularyManager.breadcrumbs.returnToList();

    assert.strictEqual(c.vocabulariesList.vocabularies.length, 2);
    assert.strictEqual(c.vocabulariesList.vocabularies[0].title.text, 'Vocabulary 1');
    assert.strictEqual(c.vocabulariesList.vocabularies[0].termsCount, '1');
    assert.strictEqual(c.vocabulariesList.vocabularies[1].title.text, 'Vocabulary 2');
    assert.strictEqual(c.vocabulariesList.vocabularies[1].termsCount, '0');
  });

  test('delete vocabulary', async function (assert) {
    this.server.create('vocabulary', {
      school: this.school,
    });
    await page.visit({ schoolId: this.school.id, schoolVocabularyDetails: true });
    const { schoolVocabulariesExpanded: c } = page.manager;

    assert.strictEqual(c.vocabulariesList.vocabularies.length, 3);
    assert.strictEqual(c.vocabulariesList.vocabularies[2].title.text, 'Vocabulary 3');
    assert.ok(c.vocabulariesList.vocabularies[2].hasDeleteButton);
    await c.vocabulariesList.vocabularies[2].delete();
    assert.ok(c.vocabulariesList.deletionConfirmation.isVisible);
    await c.vocabulariesList.deletionConfirmation.submit();

    assert.strictEqual(c.vocabulariesList.vocabularies.length, 2);
    assert.strictEqual(c.vocabulariesList.vocabularies[0].title.text, 'Vocabulary 1');
    assert.strictEqual(c.vocabulariesList.vocabularies[1].title.text, 'Vocabulary 2');
  });
});
