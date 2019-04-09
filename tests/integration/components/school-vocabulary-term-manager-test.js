import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/school-vocabulary-term-manager';

module('Integration | Component | school vocabulary term manager', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    assert.expect(11);

    const vocabulary = this.server.create('vocabulary');
    const grandParent = this.server.create('term', {
      title: 'grandparent',
      vocabulary
    });
    const parent = this.server.create('term', {
      vocabulary,
      parent: grandParent
    });
    const term = this.server.create('term', {
      vocabulary,
      parent,
      description: 'some description'
    });
    this.server.create('term', {
      parent: term,
      active: false,
    });
    this.server.create('term', {
      parent: term,
      active: true,
    });

    const vocabularyModel = await this.owner.lookup('service:store').find('vocabulary', vocabulary.id);
    const termModel = await this.owner.lookup('service:store').find('term', term.id);

    this.set('term', termModel);
    this.set('vocabulary', vocabularyModel);
    this.set('nothing', () => {});
    await render(hbs`{{
      school-vocabulary-term-manager
      term=term
      vocabulary=vocabulary
      manageTerm=(action nothing)
      manageVocabulary=(action nothing)
      canUpdate=true
      canDelete=true
      canCreate=true
    }}`);

    assert.equal(component.title, `Title: ${term.title}`);
    assert.equal(component.description, `Description: ${term.description}`);
    assert.equal(component.breadcrumbs.all, 'All Vocabularies');
    assert.equal(component.breadcrumbs.vocabulary, vocabulary.title);
    assert.equal(component.breadcrumbs.terms.length, 3);
    assert.equal(component.breadcrumbs.terms[0].text, grandParent.title);
    assert.equal(component.breadcrumbs.terms[1].text, parent.title);
    assert.equal(component.breadcrumbs.terms[2].text, term.title);

    assert.equal(component.subTerms.list.length, 2);
    assert.equal(component.subTerms.list[0].text, 'term 3 (inactive)');
    assert.equal(component.subTerms.list[1].text, 'term 4');
  });

  test('activate inactive term', async function(assert) {
    assert.expect(3);
    const vocabulary = this.server.create('vocabulary');
    const term = this.server.create('term', {
      vocabulary,
      active: false,
    });
    const vocabularyModel = await this.owner.lookup('service:store').find('vocabulary', vocabulary.id);
    const termModel = await this.owner.lookup('service:store').find('term', term.id);

    this.set('term', termModel);
    this.set('vocabulary', vocabularyModel);
    this.set('nothing', () => {});
    await render(hbs`{{
      school-vocabulary-term-manager
      term=term
      vocabulary=vocabulary
      manageTerm=(action nothing)
      manageVocabulary=(action nothing)
      canUpdate=true
      canDelete=true
      canCreate=true
    }}`);
    assert.notOk(component.isActive.active);
    await component.isActive.toggle();
    assert.ok(component.isActive.active);
    assert.ok(this.server.db.terms[0].active);
  });

  test('inactive active term', async function(assert) {
    assert.expect(3);
    const vocabulary = this.server.create('vocabulary');
    const term = this.server.create('term', {
      vocabulary,
      active: true,
    });
    const vocabularyModel = await this.owner.lookup('service:store').find('vocabulary', vocabulary.id);
    const termModel = await this.owner.lookup('service:store').find('term', term.id);

    this.set('term', termModel);
    this.set('vocabulary', vocabularyModel);
    this.set('nothing', () => {});
    await render(hbs`{{
      school-vocabulary-term-manager
      term=term
      vocabulary=vocabulary
      manageTerm=(action nothing)
      manageVocabulary=(action nothing)
      canUpdate=true
      canDelete=true
      canCreate=true
    }}`);
    assert.ok(component.isActive.active);
    await component.isActive.toggle();
    assert.notOk(component.isActive.active);
    assert.notOk(this.server.db.terms[0].active);
  });

  test('change title', async function(assert) {
    assert.expect(2);

    const vocabulary = this.server.create('vocabulary');
    const term = this.server.create('term', {
      vocabulary,
      active: true,
    });
    const vocabularyModel = await this.owner.lookup('service:store').find('vocabulary', vocabulary.id);
    const termModel = await this.owner.lookup('service:store').find('term', term.id);

    this.set('vocabulary', vocabularyModel);
    this.set('term', termModel);
    this.set('nothing', () => {});
    await render(hbs`{{
      school-vocabulary-term-manager
      term=term
      vocabulary=vocabulary
      manageTerm=(action nothing)
      manageVocabulary=(action nothing)
      canUpdate=true
      canDelete=true
      canCreate=true
    }}`);
    assert.equal(component.title, `Title: ${term.title}`);
    await component.editTitle();
    await component.changeTitle('new title');
    await component.saveTitle();
    assert.equal(this.server.db.terms[0].title, 'new title');
  });

  test('cant set empty term title', async function(assert) {
    assert.expect(5);

    const vocabulary = this.server.create('vocabulary');
    const term = this.server.create('term', {
      vocabulary,
      active: true,
    });
    const vocabularyModel = await this.owner.lookup('service:store').find('vocabulary', vocabulary.id);
    const termModel = await this.owner.lookup('service:store').find('term', term.id);

    this.set('vocabulary', vocabularyModel);
    this.set('term', termModel);
    this.set('nothing', () => {});
    await render(hbs`{{
      school-vocabulary-term-manager
      term=term
      vocabulary=vocabulary
      manageTerm=(action nothing)
      manageVocabulary=(action nothing)
      canUpdate=true
      canDelete=true
      canCreate=true
    }}`);
    assert.equal(component.title, `Title: ${term.title}`);
    assert.notOk(component.hasError);
    await component.editTitle();
    await component.changeTitle('');
    await component.saveTitle();
    assert.ok(component.hasError);
    assert.equal(component.errorMessage, 'This field can not be blank');
    assert.equal(this.server.db.terms[0].title, 'term 0');
  });

  test('prevent duplicate term title', async function(assert) {
    assert.expect(5);

    const vocabulary = this.server.create('vocabulary');
    const term = this.server.create('term', {
      vocabulary,
      active: true,
    });
    this.server.create('term', {
      title: 'duplicate one',
      vocabulary,
    });
    const vocabularyModel = await this.owner.lookup('service:store').find('vocabulary', vocabulary.id);
    const termModel = await this.owner.lookup('service:store').find('term', term.id);

    this.set('vocabulary', vocabularyModel);
    this.set('term', termModel);
    this.set('nothing', () => {});
    await render(hbs`{{
      school-vocabulary-term-manager
      term=term
      vocabulary=vocabulary
      manageTerm=(action nothing)
      manageVocabulary=(action nothing)
      canUpdate=true
      canDelete=true
      canCreate=true
    }}`);
    assert.equal(component.title, `Title: ${term.title}`);
    assert.notOk(component.hasError);
    await component.editTitle();
    await component.changeTitle('duplicate one');
    await component.saveTitle();
    assert.ok(component.hasError);
    assert.equal(component.errorMessage, 'Term is a duplicate');
    assert.equal(this.server.db.terms[0].title, 'term 0');
  });

  test('add term', async function(assert) {
    assert.expect(5);
    const vocabulary = this.server.create('vocabulary');
    const term = this.server.create('term', {
      vocabulary,
      active: true,
    });
    const vocabularyModel = await this.owner.lookup('service:store').find('vocabulary', vocabulary.id);
    const termModel = await this.owner.lookup('service:store').find('term', term.id);

    this.set('vocabulary', vocabularyModel);
    this.set('term', termModel);
    this.set('nothing', () => {});
    await render(hbs`{{
      school-vocabulary-term-manager
      term=term
      vocabulary=vocabulary
      manageTerm=(action nothing)
      manageVocabulary=(action nothing)
      canUpdate=true
      canDelete=true
      canCreate=true
    }}`);
    assert.equal(component.title, `Title: ${term.title}`);
    assert.equal(component.subTerms.list.length, 0);

    await component.subTerms.newTermForm.setTitle('new term');
    await component.subTerms.newTermForm.save();
    assert.equal(component.subTerms.list.length, 1);

    assert.equal(this.server.db.terms[1].title, 'new term');
    assert.equal(this.server.db.terms[1].vocabularyId, vocabulary.id);
  });

  test('cant add term with empty title', async function(assert) {
    assert.expect(6);
    const vocabulary = this.server.create('vocabulary');
    const term = this.server.create('term', {
      vocabulary,
      active: true,
    });
    const vocabularyModel = await this.owner.lookup('service:store').find('vocabulary', vocabulary.id);
    const termModel = await this.owner.lookup('service:store').find('term', term.id);

    this.set('vocabulary', vocabularyModel);
    this.set('term', termModel);
    this.set('nothing', () => {});
    await render(hbs`{{
      school-vocabulary-term-manager
      term=term
      vocabulary=vocabulary
      manageTerm=(action nothing)
      manageVocabulary=(action nothing)
      canUpdate=true
      canDelete=true
      canCreate=true
    }}`);
    assert.equal(component.title, `Title: ${term.title}`);
    assert.equal(component.subTerms.list.length, 0);

    assert.notOk(component.subTerms.newTermForm.hasError);
    await component.subTerms.newTermForm.setTitle('');
    await component.subTerms.newTermForm.save();
    assert.equal(component.subTerms.list.length, 0);
    assert.ok(component.subTerms.newTermForm.hasError);
    assert.equal(component.subTerms.newTermForm.errorMessage, 'This field can not be blank');
  });

  test('cant add term with duplicate title', async function(assert) {
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


    const vocabularyModel = await this.owner.lookup('service:store').find('vocabulary', vocabulary.id);
    const termModel = await this.owner.lookup('service:store').find('term', term.id);

    this.set('vocabulary', vocabularyModel);
    this.set('term', termModel);
    this.set('nothing', () => {});
    await render(hbs`{{
      school-vocabulary-term-manager
      term=term
      vocabulary=vocabulary
      manageTerm=(action nothing)
      manageVocabulary=(action nothing)
      canUpdate=true
      canDelete=true
      canCreate=true
    }}`);
    assert.equal(component.title, `Title: ${term.title}`);
    assert.equal(component.subTerms.list.length, 1);

    assert.notOk(component.subTerms.newTermForm.hasError);
    await component.subTerms.newTermForm.setTitle('duplicate term');
    await component.subTerms.newTermForm.save();
    assert.equal(component.subTerms.list.length, 1);
    assert.ok(component.subTerms.newTermForm.hasError);
    assert.equal(component.subTerms.newTermForm.errorMessage, 'Term is a duplicate');
  });
});
