import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios/tests/pages/components/school-vocabulary-manager';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | school vocabulary manager', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    const vocabulary = this.server.create('vocabulary', { school });
    const term = this.server.create('term', {
      vocabulary,
    });
    this.server.create('term', {
      active: true,
      vocabulary,
    });
    this.server.create('term', {
      vocabulary,
      parent: term,
      active: false,
    });

    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);

    this.set('vocabulary', vocabularyModel);
    await render(hbs`<SchoolVocabularyManager
      @vocabulary={{this.vocabulary}}
      @manageTerm={{(noop)}}
      @manageVocabulary={{(noop)}}
    />`);
    assert.strictEqual(component.title, `Title: ${vocabulary.title} (3 total)`);
    assert.strictEqual(component.breadcrumbs.all, 'All Vocabularies');
    assert.strictEqual(component.breadcrumbs.vocabulary, vocabulary.title);
    assert.strictEqual(component.terms.list.length, 2);
    assert.strictEqual(component.terms.list[0].text, 'term 0 This term has sub-terms. (inactive)');
    assert.ok(component.terms.list[0].hasChildren);
    assert.strictEqual(component.terms.list[1].text, 'term 1');
    assert.notOk(component.terms.list[1].hasChildren);
  });

  test('change vocabulary title', async function (assert) {
    assert.expect(2);

    const school = this.server.create('school');
    const vocabulary = this.server.create('vocabulary', { school });
    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);

    this.set('vocabulary', vocabularyModel);
    await render(hbs`<SchoolVocabularyManager
      @vocabulary={{this.vocabulary}}
      @manageTerm={{(noop)}}
      @manageVocabulary={{(noop)}}
      @canUpdate={{true}}
    />`);
    assert.strictEqual(component.title, `Title: ${vocabulary.title} (0 total)`);
    await component.editTitle();
    await component.changeTitle('new title');
    await component.saveTitle();
    assert.strictEqual(this.server.db.vocabularies[0].title, 'new title');
  });

  test('cant set empty vocabulary title', async function (assert) {
    assert.expect(5);

    const school = this.server.create('school');
    const vocabulary = this.server.create('vocabulary', { school });
    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);

    this.set('vocabulary', vocabularyModel);
    await render(hbs`<SchoolVocabularyManager
      @vocabulary={{this.vocabulary}}
      @manageTerm={{(noop)}}
      @manageVocabulary={{(noop)}}
      @canUpdate={{true}}
    />`);
    assert.strictEqual(component.title, `Title: ${vocabulary.title} (0 total)`);
    assert.notOk(component.hasError);
    await component.editTitle();
    await component.changeTitle('');
    await component.saveTitle();
    assert.ok(component.hasError);
    assert.strictEqual(component.errorMessage, 'This field can not be blank');
    assert.strictEqual(this.server.db.vocabularies[0].title, 'Vocabulary 1');
  });

  test('prevent duplicate vocabulary title', async function (assert) {
    assert.expect(5);

    const school = this.server.create('school');
    const vocabulary = this.server.create('vocabulary', { school });
    this.server.create('vocabulary', {
      school,
      title: 'duplicate one',
    });
    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);

    this.set('vocabulary', vocabularyModel);
    await render(hbs`<SchoolVocabularyManager
      @vocabulary={{this.vocabulary}}
      @manageTerm={{(noop)}}
      @manageVocabulary={{(noop)}}
      @canUpdate={{true}}
    />`);
    assert.strictEqual(component.title, `Title: ${vocabulary.title} (0 total)`);
    assert.notOk(component.hasError);
    await component.editTitle();
    await component.changeTitle('duplicate one');
    await component.saveTitle();
    assert.ok(component.hasError);
    assert.strictEqual(component.errorMessage, 'Vocabulary is a duplicate');
    assert.strictEqual(this.server.db.vocabularies[0].title, 'Vocabulary 1');
  });

  test('add term', async function (assert) {
    assert.expect(5);

    const school = this.server.create('school');
    const vocabulary = this.server.create('vocabulary', { school });
    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);

    this.set('vocabulary', vocabularyModel);
    await render(hbs`<SchoolVocabularyManager
      @vocabulary={{this.vocabulary}}
      @manageTerm={{(noop)}}
      @manageVocabulary={{(noop)}}
      @canCreate={{true}}
    />`);
    assert.strictEqual(component.title, `Title: ${vocabulary.title} (0 total)`);
    assert.strictEqual(component.terms.list.length, 0);

    await component.terms.newTermForm.setTitle('new term');
    await component.terms.newTermForm.save();
    assert.strictEqual(component.terms.list.length, 1);

    assert.strictEqual(this.server.db.terms[0].title, 'new term');
    assert.strictEqual(this.server.db.terms[0].vocabularyId, vocabulary.id);
  });

  test('cant add term with empty title', async function (assert) {
    assert.expect(6);

    const school = this.server.create('school');
    const vocabulary = this.server.create('vocabulary', { school });
    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);

    this.set('vocabulary', vocabularyModel);
    await render(hbs`<SchoolVocabularyManager
      @vocabulary={{this.vocabulary}}
      @manageTerm={{(noop)}}
      @manageVocabulary={{(noop)}}
      @canCreate={{true}}
    />`);
    assert.strictEqual(component.title, `Title: ${vocabulary.title} (0 total)`);
    assert.strictEqual(component.terms.list.length, 0);

    assert.notOk(component.terms.newTermForm.hasError);
    await component.terms.newTermForm.setTitle('');
    await component.terms.newTermForm.save();
    assert.ok(component.terms.newTermForm.hasError);
    assert.strictEqual(component.terms.newTermForm.errorMessage, 'This field can not be blank');
    assert.strictEqual(component.terms.list.length, 0);
  });

  test('cant add term with duplicate title', async function (assert) {
    assert.expect(6);

    const school = this.server.create('school');
    const vocabulary = this.server.create('vocabulary', { school });
    this.server.create('term', {
      vocabulary,
    });
    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);

    this.set('vocabulary', vocabularyModel);
    await render(hbs`<SchoolVocabularyManager
      @vocabulary={{this.vocabulary}}
      @manageTerm={{(noop)}}
      @manageVocabulary={{(noop)}}
      @canCreate={{true}}
    />`);
    assert.strictEqual(component.title, `Title: ${vocabulary.title} (1 total)`);
    assert.strictEqual(component.terms.list.length, 1);

    assert.notOk(component.terms.newTermForm.hasError);
    await component.terms.newTermForm.setTitle('term 0');
    await component.terms.newTermForm.save();
    assert.ok(component.terms.newTermForm.hasError);
    assert.strictEqual(component.terms.newTermForm.errorMessage, 'Term is a duplicate');
    assert.strictEqual(component.terms.list.length, 1);
  });
});
