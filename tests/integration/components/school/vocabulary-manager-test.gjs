import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'frontend/tests/pages/components/school/vocabulary-manager';
import { setupMSW } from 'frontend/tests/msw';
import VocabularyManager from 'frontend/components/school/vocabulary-manager';
import noop from 'frontend/helpers/noop';

module('Integration | Component | school/vocabulary-manager', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  test('it renders', async function (assert) {
    const school = await this.server.create('school');
    const vocabulary = await this.server.create('vocabulary', { school });
    const term = await this.server.create('term', {
      vocabulary,
    });
    await this.server.create('term', {
      active: true,
      vocabulary,
    });
    const subterm = await this.server.create('term', {
      vocabulary,
      parent: term,
      active: false,
    });
    await this.server.create('term', {
      vocabulary,
      parent: subterm,
      active: true,
    });
    await this.server.create('term', {
      vocabulary,
      parent: subterm,
      active: false,
    });

    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);

    this.set('vocabulary', vocabularyModel);
    await render(
      <template>
        <VocabularyManager
          @vocabulary={{this.vocabulary}}
          @manageTerm={{(noop)}}
          @manageVocabulary={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.vocabularyTitle.text, vocabulary.title);
    assert.strictEqual(component.vocabularyTermsTitle.text, 'Terms (5 total)');
    assert.strictEqual(component.terms.termsList.items.length, 2);

    assert.strictEqual(component.terms.termsList.items[0].title, 'term 0');
    assert.ok(component.terms.termsList.items[0].isLabeledAsInactive);
    assert.strictEqual(component.terms.termsList.items[1].title, 'term 1');
    assert.notOk(component.terms.termsList.items[1].isLabeledAsInactive);

    assert.strictEqual(component.terms.termsList.nestedLists[0].items[0].title, 'term 2');
    assert.ok(component.terms.termsList.nestedLists[0].items[0].isLabeledAsInactive);
    assert.strictEqual(
      component.terms.termsList.nestedLists[0].nestedLists[0].items[0].title,
      'term 3',
    );
    assert.notOk(
      component.terms.termsList.nestedLists[0].nestedLists[0].items[0].isLabeledAsInactive,
    );
    assert.strictEqual(
      component.terms.termsList.nestedLists[0].nestedLists[0].items[1].title,
      'term 4',
    );
    assert.ok(component.terms.termsList.nestedLists[0].nestedLists[0].items[1].isLabeledAsInactive);
  });

  test('change vocabulary title', async function (assert) {
    const school = await this.server.create('school');
    const vocabulary = await this.server.create('vocabulary', { school });
    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);

    this.set('vocabulary', vocabularyModel);
    await render(
      <template>
        <VocabularyManager
          @vocabulary={{this.vocabulary}}
          @manageTerm={{(noop)}}
          @manageVocabulary={{(noop)}}
          @canUpdate={{true}}
        />
      </template>,
    );
    assert.strictEqual(component.vocabularyTitle.text, vocabulary.title);
    await component.vocabularyTitle.edit();
    await component.vocabularyTitle.change('new title');
    await component.vocabularyTitle.save();
    assert.strictEqual(this.server.db.vocabulary.all()[0].title, 'new title');
  });

  test('cancel vocabulary title changes', async function (assert) {
    const school = await this.server.create('school');
    const vocabulary = await this.server.create('vocabulary', { school });
    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);

    this.set('vocabulary', vocabularyModel);
    await render(
      <template>
        <VocabularyManager
          @vocabulary={{this.vocabulary}}
          @manageTerm={{(noop)}}
          @manageVocabulary={{(noop)}}
          @canUpdate={{true}}
        />
      </template>,
    );
    assert.strictEqual(component.vocabularyTitle.text, vocabulary.title);
    await component.vocabularyTitle.edit();
    await component.vocabularyTitle.change('new title');
    await component.vocabularyTitle.cancelChanges();
    assert.strictEqual(component.vocabularyTitle.text, vocabulary.title);
  });

  test('validation fails if vocabulary title is blank', async function (assert) {
    const school = await this.server.create('school');
    const vocabulary = await this.server.create('vocabulary', { school });
    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);

    this.set('vocabulary', vocabularyModel);
    await render(
      <template>
        <VocabularyManager
          @vocabulary={{this.vocabulary}}
          @manageTerm={{(noop)}}
          @manageVocabulary={{(noop)}}
          @canUpdate={{true}}
        />
      </template>,
    );
    assert.strictEqual(component.vocabularyTitle.text, vocabulary.title);
    assert.notOk(component.hasError);
    await component.vocabularyTitle.edit();
    await component.vocabularyTitle.change('');
    await component.vocabularyTitle.save();
    assert.ok(component.hasError);
    assert.strictEqual(component.error, 'Title can not be blank');
    assert.strictEqual(this.server.db.vocabulary.all()[0].title, 'Vocabulary 1');
  });

  test('validation fails if vocabulary title is too long', async function (assert) {
    const school = await this.server.create('school');
    const vocabulary = await this.server.create('vocabulary', { school });
    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);

    this.set('vocabulary', vocabularyModel);
    await render(
      <template>
        <VocabularyManager
          @vocabulary={{this.vocabulary}}
          @manageTerm={{(noop)}}
          @manageVocabulary={{(noop)}}
          @canUpdate={{true}}
        />
      </template>,
    );
    assert.strictEqual(component.vocabularyTitle.text, vocabulary.title);
    assert.notOk(component.hasError);
    await component.vocabularyTitle.edit();
    await component.vocabularyTitle.change('a'.repeat(201));
    await component.vocabularyTitle.save();
    assert.ok(component.hasError);
    assert.strictEqual(component.error, 'Title is too long (maximum is 200 characters)');
    assert.strictEqual(this.server.db.vocabulary.all()[0].title, 'Vocabulary 1');
  });

  test('prevent duplicate vocabulary title', async function (assert) {
    const school = await this.server.create('school');
    const vocabulary = await this.server.create('vocabulary', { school });
    await this.server.create('vocabulary', {
      school,
      title: 'duplicate one',
    });
    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);

    this.set('vocabulary', vocabularyModel);
    await render(
      <template>
        <VocabularyManager
          @vocabulary={{this.vocabulary}}
          @manageTerm={{(noop)}}
          @manageVocabulary={{(noop)}}
          @canUpdate={{true}}
        />
      </template>,
    );
    assert.strictEqual(component.vocabularyTitle.text, vocabulary.title);
    assert.notOk(component.hasError);
    await component.vocabularyTitle.edit();
    await component.vocabularyTitle.change('duplicate one');
    await component.vocabularyTitle.save();
    assert.ok(component.hasError);
    assert.strictEqual(component.error, 'Title is a duplicate');
    assert.strictEqual(this.server.db.vocabulary.all()[0].title, 'Vocabulary 1');
  });

  test('add term', async function (assert) {
    const school = await this.server.create('school');
    const vocabulary = await this.server.create('vocabulary', { school });
    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);

    this.set('vocabulary', vocabularyModel);
    await render(
      <template>
        <VocabularyManager
          @vocabulary={{this.vocabulary}}
          @manageTerm={{(noop)}}
          @manageVocabulary={{(noop)}}
          @canCreate={{true}}
        />
      </template>,
    );
    assert.strictEqual(component.vocabularyTitle.text, vocabulary.title);
    assert.strictEqual(component.vocabularyTermsTitle.text, 'Terms (0 total)');
    assert.strictEqual(component.terms.termsList.items.length, 0);

    await component.toggleNewVocabularyTermForm();
    await component.newTermForm.setTitle('new term');
    await component.newTermForm.save();
    assert.strictEqual(component.vocabularyTermsTitle.text, 'Terms (1 total)');
    assert.strictEqual(component.terms.termsList.items.length, 1, 'term count correct');

    assert.strictEqual(this.server.db.term.all()[0].title, 'new term');
    assert.strictEqual(this.server.db.term.all()[0].id, vocabulary.id);
  });

  test('cannot add term with empty title', async function (assert) {
    const school = await this.server.create('school');
    const vocabulary = await this.server.create('vocabulary', { school });
    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);

    this.set('vocabulary', vocabularyModel);
    await render(
      <template>
        <VocabularyManager
          @vocabulary={{this.vocabulary}}
          @manageTerm={{(noop)}}
          @manageVocabulary={{(noop)}}
          @canCreate={{true}}
        />
      </template>,
    );
    assert.strictEqual(component.vocabularyTitle.text, vocabulary.title);
    assert.strictEqual(component.vocabularyTermsTitle.text, 'Terms (0 total)');
    assert.strictEqual(component.terms.termsList.items.length, 0);

    assert.notOk(component.newTermForm.hasError);

    await component.toggleNewVocabularyTermForm();
    await component.newTermForm.setTitle('');
    await component.newTermForm.save();
    assert.ok(component.newTermForm.hasError);
    assert.strictEqual(component.newTermForm.errorMessage, 'Term can not be blank');
    assert.strictEqual(component.vocabularyTermsTitle.text, 'Terms (0 total)');
    assert.strictEqual(component.terms.termsList.items.length, 0);
  });

  test('cannot add term with duplicate title', async function (assert) {
    const school = await this.server.create('school');
    const vocabulary = await this.server.create('vocabulary', { school });
    await this.server.create('term', {
      vocabulary,
    });
    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);

    this.set('vocabulary', vocabularyModel);
    await render(
      <template>
        <VocabularyManager
          @vocabulary={{this.vocabulary}}
          @manageTerm={{(noop)}}
          @manageVocabulary={{(noop)}}
          @canCreate={{true}}
        />
      </template>,
    );
    assert.strictEqual(component.vocabularyTitle.text, vocabulary.title);
    assert.strictEqual(component.vocabularyTermsTitle.text, 'Terms (1 total)');
    assert.strictEqual(component.terms.termsList.items.length, 1);

    assert.notOk(component.newTermForm.hasError);

    await component.toggleNewVocabularyTermForm();
    await component.newTermForm.setTitle('term 0');
    await component.newTermForm.save();
    assert.ok(component.newTermForm.hasError);
    assert.strictEqual(component.newTermForm.errorMessage, 'Term is a duplicate');
    assert.strictEqual(component.vocabularyTermsTitle.text, 'Terms (1 total)');
    assert.strictEqual(component.terms.termsList.items.length, 1);
  });
});
