import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/school-vocabulary-term-manager';

module('Integration | Component | school vocabulary term manager', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const vocabulary = this.server.create('vocabulary');
    const grandParent = this.server.create('term', {
      title: 'grandparent',
      vocabulary,
    });
    const parent = this.server.create('term', {
      vocabulary,
      parent: grandParent,
    });
    const term = this.server.create('term', {
      vocabulary,
      parent,
      description: 'some description',
    });
    const subTerm = this.server.create('term', {
      vocabulary,
      parent: term,
      active: false,
    });
    this.server.create('term', {
      vocabulary,
      parent: term,
      active: true,
    });
    this.server.create('term', {
      vocabulary,
      parent: subTerm,
      active: false,
    });

    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);
    const termModel = await this.owner.lookup('service:store').findRecord('term', term.id);

    this.set('term', termModel);
    this.set('vocabulary', vocabularyModel);
    await render(hbs`<SchoolVocabularyTermManager
      @term={{this.term}}
      @vocabulary={{this.vocabulary}}
      @manageTerm={{(noop)}}
      @manageVocabulary={{(noop)}}
      @canUpdate={{true}}
      @canDelete={{true}}
      @canCreate={{true}}
    />`);

    assert.strictEqual(component.title, `Title: ${term.title}`);
    assert.strictEqual(component.description, `Description: ${term.description}`);
    assert.strictEqual(component.breadcrumbs.all, 'All Vocabularies');
    assert.strictEqual(component.breadcrumbs.vocabulary, vocabulary.title);
    assert.strictEqual(component.breadcrumbs.terms.length, 3);
    assert.strictEqual(component.breadcrumbs.terms[0].text, grandParent.title);
    assert.strictEqual(component.breadcrumbs.terms[1].text, parent.title);
    assert.strictEqual(component.breadcrumbs.terms[2].text, term.title);

    assert.strictEqual(component.subTerms.list.length, 2);
    assert.strictEqual(
      component.subTerms.list[0].text,
      'term 3 This term has sub-terms. (inactive)'
    );
    assert.ok(component.subTerms.list[0].hasChildren);
    assert.strictEqual(component.subTerms.list[1].text, 'term 4');
    assert.notOk(component.subTerms.list[1].hasChildren);
  });

  test('activate inactive term', async function (assert) {
    assert.expect(3);
    const vocabulary = this.server.create('vocabulary');
    const term = this.server.create('term', {
      vocabulary,
      active: false,
    });
    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);
    const termModel = await this.owner.lookup('service:store').findRecord('term', term.id);

    this.set('term', termModel);
    this.set('vocabulary', vocabularyModel);
    await render(hbs`<SchoolVocabularyTermManager
      @term={{this.term}}
      @vocabulary={{this.vocabulary}}
      @manageTerm={{(noop)}}
      @manageVocabulary={{(noop)}}
      @canUpdate={{true}}
      @canDelete={{true}}
      @canCreate={{true}}
    />`);
    assert.strictEqual(component.isActive.yesNoToggle.checked, 'false');
    await component.isActive.yesNoToggle.click();
    assert.strictEqual(component.isActive.yesNoToggle.checked, 'true');
    assert.ok(this.server.db.terms[0].active);
  });

  test('inactivate active term', async function (assert) {
    assert.expect(3);
    const vocabulary = this.server.create('vocabulary');
    const term = this.server.create('term', {
      vocabulary,
      active: true,
    });
    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);
    const termModel = await this.owner.lookup('service:store').findRecord('term', term.id);

    this.set('term', termModel);
    this.set('vocabulary', vocabularyModel);
    await render(hbs`<SchoolVocabularyTermManager
      @term={{this.term}}
      @vocabulary={{this.vocabulary}}
      @manageTerm={{(noop)}}
      @manageVocabulary={{(noop)}}
      @canUpdate={{true}}
      @canDelete={{true}}
      @canCreate={{true}}
    />`);
    assert.strictEqual(component.isActive.yesNoToggle.checked, 'true');
    await component.isActive.yesNoToggle.click();
    assert.strictEqual(component.isActive.yesNoToggle.checked, 'false');
    assert.notOk(this.server.db.terms[0].active);
  });

  test('change title', async function (assert) {
    assert.expect(2);

    const vocabulary = this.server.create('vocabulary');
    const term = this.server.create('term', {
      vocabulary,
      active: true,
    });
    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);
    const termModel = await this.owner.lookup('service:store').findRecord('term', term.id);

    this.set('vocabulary', vocabularyModel);
    this.set('term', termModel);
    await render(hbs`<SchoolVocabularyTermManager
      @term={{this.term}}
      @vocabulary={{this.vocabulary}}
      @manageTerm={{(noop)}}
      @manageVocabulary={{(noop)}}
      @canUpdate={{true}}
      @canDelete={{true}}
      @canCreate={{true}}
    />`);
    assert.strictEqual(component.title, `Title: ${term.title}`);
    await component.editTitle();
    await component.changeTitle('new title');
    await component.saveTitle();
    assert.strictEqual(this.server.db.terms[0].title, 'new title');
  });

  test("can't set empty term title", async function (assert) {
    assert.expect(5);

    const vocabulary = this.server.create('vocabulary');
    const term = this.server.create('term', {
      vocabulary,
      active: true,
    });
    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);
    const termModel = await this.owner.lookup('service:store').findRecord('term', term.id);

    this.set('vocabulary', vocabularyModel);
    this.set('term', termModel);
    await render(hbs`<SchoolVocabularyTermManager
      @term={{this.term}}
      @vocabulary={{this.vocabulary}}
      @manageTerm={{(noop)}}
      @manageVocabulary={{(noop)}}
      @canUpdate={{true}}
      @canDelete={{true}}
      @canCreate={{true}}
    />`);
    assert.strictEqual(component.title, `Title: ${term.title}`);
    assert.notOk(component.hasError);
    await component.editTitle();
    await component.changeTitle('');
    await component.saveTitle();
    assert.ok(component.hasError);
    assert.strictEqual(component.errorMessage, 'This field can not be blank');
    assert.strictEqual(this.server.db.terms[0].title, 'term 0');
  });

  test('prevent duplicate term title', async function (assert) {
    assert.expect(5);

    const vocabulary = this.server.create('vocabulary');
    const term = this.server.create('term', {
      vocabulary,
      active: true,
    });
    this.server.create('term', {
      parent: term,
      title: 'duplicate one',
      vocabulary,
    });
    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);
    const termModel = await this.owner.lookup('service:store').findRecord('term', term.id);

    this.set('vocabulary', vocabularyModel);
    this.set('term', termModel);
    await render(hbs`<SchoolVocabularyTermManager
      @term={{this.term}}
      @vocabulary={{this.vocabulary}}
      @manageTerm={{(noop)}}
      @manageVocabulary={{(noop)}}
      @canUpdate={{true}}
      @canDelete={{true}}
      @canCreate={{true}}
    />`);
    assert.strictEqual(component.title, `Title: ${term.title}`);
    assert.notOk(component.hasError);
    await component.editTitle();
    await component.changeTitle('duplicate one');
    await component.saveTitle();
    assert.ok(component.hasError);
    assert.strictEqual(component.errorMessage, 'Term is a duplicate');
    assert.strictEqual(this.server.db.terms[0].title, 'term 0');
  });

  test('add term', async function (assert) {
    assert.expect(5);
    const vocabulary = this.server.create('vocabulary');
    const term = this.server.create('term', {
      vocabulary,
      active: true,
    });
    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);
    const termModel = await this.owner.lookup('service:store').findRecord('term', term.id);

    this.set('vocabulary', vocabularyModel);
    this.set('term', termModel);
    await render(hbs`<SchoolVocabularyTermManager
      @term={{this.term}}
      @vocabulary={{this.vocabulary}}
      @manageTerm={{(noop)}}
      @manageVocabulary={{(noop)}}
      @canUpdate={{true}}
      @canDelete={{true}}
      @canCreate={{true}}
    />`);
    assert.strictEqual(component.title, `Title: ${term.title}`);
    assert.strictEqual(component.subTerms.list.length, 0);

    await component.subTerms.newTermForm.setTitle('new term');
    await component.subTerms.newTermForm.save();
    assert.strictEqual(component.subTerms.list.length, 1);

    assert.strictEqual(this.server.db.terms[1].title, 'new term');
    assert.strictEqual(this.server.db.terms[1].vocabularyId, vocabulary.id);
  });

  test("can't add term with empty title", async function (assert) {
    assert.expect(6);
    const vocabulary = this.server.create('vocabulary');
    const term = this.server.create('term', {
      vocabulary,
      active: true,
    });
    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);
    const termModel = await this.owner.lookup('service:store').findRecord('term', term.id);

    this.set('vocabulary', vocabularyModel);
    this.set('term', termModel);
    await render(hbs`<SchoolVocabularyTermManager
      @term={{this.term}}
      @vocabulary={{this.vocabulary}}
      @manageTerm={{(noop)}}
      @manageVocabulary={{(noop)}}
      @canUpdate={{true}}
      @canDelete={{true}}
      @canCreate={{true}}
    />`);
    assert.strictEqual(component.title, `Title: ${term.title}`);
    assert.strictEqual(component.subTerms.list.length, 0);

    assert.notOk(component.subTerms.newTermForm.hasError);
    await component.subTerms.newTermForm.setTitle('');
    await component.subTerms.newTermForm.save();
    assert.strictEqual(component.subTerms.list.length, 0);
    assert.ok(component.subTerms.newTermForm.hasError);
    assert.strictEqual(component.subTerms.newTermForm.errorMessage, 'This field can not be blank');
  });

  test("can't add term with duplicate title", async function (assert) {
    assert.expect(6);
    const vocabulary = this.server.create('vocabulary');
    const term = this.server.create('term', {
      vocabulary,
      active: true,
    });
    this.server.create('term', {
      title: 'duplicate term',
      vocabulary,
      parent: term,
    });

    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);
    const termModel = await this.owner.lookup('service:store').findRecord('term', term.id);

    this.set('vocabulary', vocabularyModel);
    this.set('term', termModel);
    await render(hbs`<SchoolVocabularyTermManager
      @term={{this.term}}
      @vocabulary={{this.vocabulary}}
      @manageTerm={{(noop)}}
      @manageVocabulary={{(noop)}}
      @canUpdate={{true}}
      @canDelete={{true}}
      @canCreate={{true}}
    />`);
    assert.strictEqual(component.title, `Title: ${term.title}`);
    assert.strictEqual(component.subTerms.list.length, 1);

    assert.notOk(component.subTerms.newTermForm.hasError);
    await component.subTerms.newTermForm.setTitle('duplicate term');
    await component.subTerms.newTermForm.save();
    assert.strictEqual(component.subTerms.list.length, 1);
    assert.ok(component.subTerms.newTermForm.hasError);
    assert.strictEqual(component.subTerms.newTermForm.errorMessage, 'Term is a duplicate');
  });
});
