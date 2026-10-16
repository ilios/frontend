import { module, test } from 'qunit';
import { setupApplicationTest, setupAuthentication, takeScreenshot } from 'frontend/tests/helpers';
import page from 'frontend/tests/pages/school';

module('Acceptance | School - Vocabulary Manager', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    this.school = await this.server.create('school');
    await setupAuthentication({ administeredSchools: [this.school] });

    await this.server.create('vocabulary', {
      school: this.school,
      terms: await this.server.createList('term', 2),
    });
  });

  test('add new vocabulary top-level term', async function (assert) {
    await page.visit({
      schoolId: this.school.id,
      schoolManagedVocabulary: 1,
      schoolVocabularyDetails: true,
    });
    const { vocabularyManager: vm } = page.root.vocabulariesExpanded;

    assert.strictEqual(vm.vocabularyTitle.text, 'Vocabulary 1');
    assert.strictEqual(vm.terms.termsList.items.length, 2);

    await vm.toggleNewVocabularyTermForm();
    await takeScreenshot(assert, 'new top-level term form');
    await vm.newTermForm.setTitle('New Term 1');
    await vm.newTermForm.save();
    await takeScreenshot(assert, 'post-save');
    assert.strictEqual(vm.terms.termsList.items.length, 3);
  });

  test('add new vocabulary sub-term', async function (assert) {
    await page.visit({
      schoolId: this.school.id,
      schoolManagedVocabulary: 1,
      schoolVocabularyDetails: true,
    });
    const { vocabularyManager: vm } = page.root.vocabulariesExpanded;

    assert.strictEqual(vm.terms.termsList.items[0].title, 'term 0');
    assert.strictEqual(vm.terms.termsList.items[1].title, 'term 1');
    assert.strictEqual(vm.vocabularyTermsTitle.text, 'Terms (2 total)');

    await vm.terms.termsList.items[0].click();
    await takeScreenshot(assert, 'edit term form');
    assert.ok(vm.terms.termsList.items[0].hasEditTermForm);
    assert.strictEqual(vm.terms.termsList.items[0].editTermForm.title, 'Edit Term');
    assert.ok(vm.terms.termsList.items[0].editTermForm.hasAddSubTerm);
    await vm.terms.termsList.items[0].editTermForm.addSubTerm();
    await takeScreenshot(assert, 'new sub-term form');
    assert.strictEqual(vm.terms.termsList.items[0].newSubTermForm.title, 'New Sub-term');
    await vm.terms.termsList.items[0].newSubTermForm.setTitle('term 0, subterm 0');
    await vm.terms.termsList.items[0].newSubTermForm.save();
    await takeScreenshot(assert, 'post-save');
    assert.strictEqual(vm.terms.termsList.items[0].title, 'term 0');
    assert.strictEqual(vm.terms.termsList.nestedLists[0].items[0].title, 'term 0, subterm 0');
    assert.strictEqual(vm.terms.termsList.items[1].title, 'term 1');
    assert.strictEqual(vm.vocabularyTermsTitle.text, 'Terms (3 total)');
  });

  test('edit existing vocabulary term', async function (assert) {
    await page.visit({
      schoolId: this.school.id,
      schoolManagedVocabulary: 1,
      schoolVocabularyDetails: true,
    });
    const { vocabularyManager: vm } = page.root.vocabulariesExpanded;

    await vm.terms.termsList.items[0].click();
    await takeScreenshot(assert, 'edit term form');
    await vm.terms.termsList.items[0].editTermForm.setTitle('term 0, the best');
    await vm.terms.termsList.items[0].editTermForm.save();
    await takeScreenshot(assert, 'post-save');
    assert.strictEqual(vm.terms.termsList.items[0].title, 'term 0, the best');
  });

  test('delete existing vocabulary term', async function (assert) {
    await page.visit({
      schoolId: this.school.id,
      schoolManagedVocabulary: 1,
      schoolVocabularyDetails: true,
    });
    const { vocabularyManager: vm } = page.root.vocabulariesExpanded;

    assert.strictEqual(vm.vocabularyTermsTitle.text, 'Terms (2 total)');

    await vm.terms.termsList.items[0].click();
    await takeScreenshot(assert, 'edit term form');
    assert.ok(vm.terms.termsList.items[0].editTermForm.hasDeleteTerm);
    await vm.terms.termsList.items[0].editTermForm.deleteTerm();
    await takeScreenshot(assert, 'delete term form');
    assert.ok(vm.terms.termsList.items[0].hasConfirmRemoval);
    await vm.terms.termsList.items[0].confirmRemoval();
    await takeScreenshot(assert, 'post-save');
    assert.strictEqual(vm.vocabularyTermsTitle.text, 'Terms (1 total)');
  });

  test('delete existing vocabulary term but cancel', async function (assert) {
    await page.visit({
      schoolId: this.school.id,
      schoolManagedVocabulary: 1,
      schoolVocabularyDetails: true,
    });
    const { vocabularyManager: vm } = page.root.vocabulariesExpanded;

    assert.strictEqual(vm.vocabularyTermsTitle.text, 'Terms (2 total)');

    await vm.terms.termsList.items[0].click();
    await takeScreenshot(assert, 'edit term form');
    assert.ok(vm.terms.termsList.items[0].editTermForm.hasDeleteTerm);
    await vm.terms.termsList.items[0].editTermForm.deleteTerm();
    await takeScreenshot(assert, 'edit term form');
    assert.ok(vm.terms.termsList.items[0].hasConfirmRemoval);
    await vm.terms.termsList.items[0].cancelRemoval();
    await takeScreenshot(assert, 'post-cancel');
    assert.strictEqual(vm.vocabularyTermsTitle.text, 'Terms (2 total)');
  });
});
