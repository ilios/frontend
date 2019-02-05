import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { run } from '@ember/runloop';
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

    const vocabularyModel = await run(() => this.owner.lookup('service:store').find('vocabulary', vocabulary.id));
    const termModel = await run(() => this.owner.lookup('service:store').find('term', term.id));

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
    const vocabularyModel = await run(() => this.owner.lookup('service:store').find('vocabulary', vocabulary.id));
    const termModel = await run(() => this.owner.lookup('service:store').find('term', term.id));

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
    const vocabularyModel = await run(() => this.owner.lookup('service:store').find('vocabulary', vocabulary.id));
    const termModel = await run(() => this.owner.lookup('service:store').find('term', term.id));

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
});
