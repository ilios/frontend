import { module, test } from 'qunit';
import { currentURL } from '@ember/test-helpers';
import { setupApplicationTest, takeScreenshot, setupAuthentication } from 'frontend/tests/helpers';
import page from 'frontend/tests/pages/school';

module('Acceptance | School - Vocabularies', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    this.school = await this.server.create('school');
    await setupAuthentication({ administeredSchools: [this.school] });

    await this.server.create('vocabulary', {
      school: this.school,
      terms: await this.server.createList('term', 2),
    });

    await this.server.create('vocabulary', {
      school: this.school,
      terms: await this.server.createList('term', 1),
    });
  });

  test('collapsed', async function (assert) {
    await page.visit({ schoolId: this.school.id });
    assert.strictEqual(currentURL(), '/schools/1');
    await takeScreenshot(assert);
    const { vocabulariesCollapsed: c } = page.root;

    assert.strictEqual(c.title, 'Vocabularies (2)');
    assert.strictEqual(c.vocabularies.length, 2);
    assert.strictEqual(c.vocabularies[0].title, 'Vocabulary 1');
    assert.strictEqual(c.vocabularies[0].summary, 'There are 2 terms');
    assert.strictEqual(c.vocabularies[1].title, 'Vocabulary 2');
    assert.strictEqual(c.vocabularies[1].summary, 'There is 1 term');
  });

  test('expanded', async function (assert) {
    await page.visit({ schoolId: this.school.id, schoolVocabularyDetails: true });
    await takeScreenshot(assert);
    const { vocabulariesExpanded: c } = page.root;

    assert.strictEqual(c.title, 'Vocabularies (2)');
    assert.strictEqual(c.vocabulariesList.vocabularies.length, 2);
    assert.strictEqual(c.vocabulariesList.vocabularies[0].title.text, 'Vocabulary 1');
    assert.strictEqual(c.vocabulariesList.vocabularies[0].termsCount, '2');
    assert.ok(c.vocabulariesList.vocabularies[0].hasDeleteButton);
    assert.ok(c.vocabulariesList.vocabularies[0].deleteButtonIsDisabled);
    assert.strictEqual(c.vocabulariesList.vocabularies[1].title.text, 'Vocabulary 2');
    assert.strictEqual(c.vocabulariesList.vocabularies[1].termsCount, '1');
    assert.ok(c.vocabulariesList.vocabularies[1].hasDeleteButton);
    assert.ok(c.vocabulariesList.vocabularies[1].deleteButtonIsDisabled);
  });

  test('add new vocabulary', async function (assert) {
    await page.visit({ schoolId: this.school.id, schoolVocabularyDetails: true });
    const { vocabulariesExpanded: c } = page.root;

    await c.openNewVocabularyForm();
    await c.newVocabularyForm.title.set('New Vocabulary');
    await c.newVocabularyForm.submit.click();

    assert.strictEqual(c.title, 'Vocabularies (3)');
    assert.strictEqual(c.vocabulariesList.vocabularies.length, 3);
    assert.strictEqual(c.vocabulariesList.vocabularies[0].title.text, 'New Vocabulary');
    assert.strictEqual(c.vocabulariesList.vocabularies[1].title.text, 'Vocabulary 1');
    assert.strictEqual(c.vocabulariesList.vocabularies[2].title.text, 'Vocabulary 2');
  });

  test('delete vocabulary', async function (assert) {
    await this.server.create('vocabulary', {
      school: this.school,
    });
    await page.visit({ schoolId: this.school.id, schoolVocabularyDetails: true });
    const { vocabulariesExpanded: c } = page.root;

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
