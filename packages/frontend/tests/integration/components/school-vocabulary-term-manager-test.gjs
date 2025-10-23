import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/school-vocabulary-term-manager';
import SchoolVocabularyTermManager from 'frontend/components/school-vocabulary-term-manager';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | school vocabulary term manager', function (hooks) {
  setupRenderingTest(hooks);
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
    await render(
      <template>
        <SchoolVocabularyTermManager
          @term={{this.term}}
          @vocabulary={{this.vocabulary}}
          @manageTerm={{(noop)}}
          @manageVocabulary={{(noop)}}
          @canUpdate={{true}}
          @canDelete={{true}}
          @canCreate={{true}}
        />
      </template>,
    );

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
      'term 3 This term has sub-terms. (inactive)',
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
    await render(
      <template>
        <SchoolVocabularyTermManager
          @term={{this.term}}
          @vocabulary={{this.vocabulary}}
          @manageTerm={{(noop)}}
          @manageVocabulary={{(noop)}}
          @canUpdate={{true}}
          @canDelete={{true}}
          @canCreate={{true}}
        />
      </template>,
    );
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
    await render(
      <template>
        <SchoolVocabularyTermManager
          @term={{this.term}}
          @vocabulary={{this.vocabulary}}
          @manageTerm={{(noop)}}
          @manageVocabulary={{(noop)}}
          @canUpdate={{true}}
          @canDelete={{true}}
          @canCreate={{true}}
        />
      </template>,
    );
    assert.strictEqual(component.isActive.yesNoToggle.checked, 'true');
    await component.isActive.yesNoToggle.click();
    assert.strictEqual(component.isActive.yesNoToggle.checked, 'false');
    assert.notOk(this.server.db.terms[0].active);
  });

  test('change term title', async function (assert) {
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
    await render(
      <template>
        <SchoolVocabularyTermManager
          @term={{this.term}}
          @vocabulary={{this.vocabulary}}
          @manageTerm={{(noop)}}
          @manageVocabulary={{(noop)}}
          @canUpdate={{true}}
          @canDelete={{true}}
          @canCreate={{true}}
        />
      </template>,
    );
    assert.strictEqual(component.title, `Title: ${term.title}`);
    await component.editTitle();
    await component.changeTitle('new title');
    await component.saveTitle();
    assert.strictEqual(this.server.db.terms[0].title, 'new title');
  });

  test('cancel term title changes', async function (assert) {
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
    await render(
      <template>
        <SchoolVocabularyTermManager
          @term={{this.term}}
          @vocabulary={{this.vocabulary}}
          @manageTerm={{(noop)}}
          @manageVocabulary={{(noop)}}
          @canUpdate={{true}}
          @canDelete={{true}}
          @canCreate={{true}}
        />
      </template>,
    );
    assert.strictEqual(component.title, `Title: ${term.title}`);
    await component.editTitle();
    await component.changeTitle('new title');
    await component.cancelTitleChanges();
    assert.strictEqual(component.title, `Title: ${term.title}`);
  });

  test('validation fails if term title is blank', async function (assert) {
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
    await render(
      <template>
        <SchoolVocabularyTermManager
          @term={{this.term}}
          @vocabulary={{this.vocabulary}}
          @manageTerm={{(noop)}}
          @manageVocabulary={{(noop)}}
          @canUpdate={{true}}
          @canDelete={{true}}
          @canCreate={{true}}
        />
      </template>,
    );
    assert.strictEqual(component.title, `Title: ${term.title}`);
    assert.notOk(component.hasError);
    await component.editTitle();
    await component.changeTitle('');
    await component.saveTitle();
    assert.ok(component.hasError);
    assert.strictEqual(component.error, 'Title can not be blank');
    assert.strictEqual(this.server.db.terms[0].title, 'term 0');
  });

  test('validation fails if term title is too long', async function (assert) {
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
    await render(
      <template>
        <SchoolVocabularyTermManager
          @term={{this.term}}
          @vocabulary={{this.vocabulary}}
          @manageTerm={{(noop)}}
          @manageVocabulary={{(noop)}}
          @canUpdate={{true}}
          @canDelete={{true}}
          @canCreate={{true}}
        />
      </template>,
    );
    assert.strictEqual(component.title, `Title: ${term.title}`);
    assert.notOk(component.hasError);
    await component.editTitle();
    await component.changeTitle('a'.repeat(201));
    await component.saveTitle();
    assert.ok(component.hasError);
    assert.strictEqual(component.error, 'Title is too long (maximum is 200 characters)');
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
    await render(
      <template>
        <SchoolVocabularyTermManager
          @term={{this.term}}
          @vocabulary={{this.vocabulary}}
          @manageTerm={{(noop)}}
          @manageVocabulary={{(noop)}}
          @canUpdate={{true}}
          @canDelete={{true}}
          @canCreate={{true}}
        />
      </template>,
    );
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
    await render(
      <template>
        <SchoolVocabularyTermManager
          @term={{this.term}}
          @vocabulary={{this.vocabulary}}
          @manageTerm={{(noop)}}
          @manageVocabulary={{(noop)}}
          @canUpdate={{true}}
          @canDelete={{true}}
          @canCreate={{true}}
        />
      </template>,
    );
    assert.strictEqual(component.title, `Title: ${term.title}`);
    assert.strictEqual(component.subTerms.list.length, 0);

    assert.notOk(component.subTerms.newTermForm.hasError);
    await component.subTerms.newTermForm.setTitle('');
    await component.subTerms.newTermForm.save();
    assert.strictEqual(component.subTerms.list.length, 0);
    assert.ok(component.subTerms.newTermForm.hasError);
    assert.strictEqual(component.subTerms.newTermForm.errorMessage, 'Term can not be blank');
  });

  test("can't rename nested term with duplicate title", async function (assert) {
    const vocabulary = this.server.create('vocabulary');
    const topLevelTerm = this.server.create('term', {
      vocabulary,
    });
    const term = this.server.create('term', {
      vocabulary,
      title: 'term',
      active: true,
      parent: topLevelTerm,
    });
    this.server.create('term', {
      vocabulary,
      title: 'duplicate term',
      active: true,
      parent: topLevelTerm,
    });

    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);
    const termModel = await this.owner.lookup('service:store').findRecord('term', term.id);

    this.set('vocabulary', vocabularyModel);
    this.set('term', termModel);
    await render(
      <template>
        <SchoolVocabularyTermManager
          @term={{this.term}}
          @vocabulary={{this.vocabulary}}
          @manageTerm={{(noop)}}
          @manageVocabulary={{(noop)}}
          @canUpdate={{true}}
          @canDelete={{true}}
          @canCreate={{true}}
        />
      </template>,
    );
    assert.strictEqual(component.title, `Title: ${term.title}`);
    assert.notOk(component.hasError);
    await component.editTitle();
    await component.changeTitle('duplicate term');
    await component.saveTitle();
    assert.ok(component.hasError);
    assert.strictEqual(component.error, 'Title is a duplicate');
  });

  test("can't rename top-level term with duplicate title", async function (assert) {
    const vocabulary = this.server.create('vocabulary');
    const term = this.server.create('term', {
      vocabulary,
      title: 'term',
      active: true,
    });
    this.server.create('term', {
      vocabulary,
      title: 'duplicate term',
      active: true,
    });

    const vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);
    const termModel = await this.owner.lookup('service:store').findRecord('term', term.id);

    this.set('vocabulary', vocabularyModel);
    this.set('term', termModel);
    await render(
      <template>
        <SchoolVocabularyTermManager
          @term={{this.term}}
          @vocabulary={{this.vocabulary}}
          @manageTerm={{(noop)}}
          @manageVocabulary={{(noop)}}
          @canUpdate={{true}}
          @canDelete={{true}}
          @canCreate={{true}}
        />
      </template>,
    );
    assert.strictEqual(component.title, `Title: ${term.title}`);
    assert.notOk(component.hasError);
    await component.editTitle();
    await component.changeTitle('duplicate term');
    await component.saveTitle();
    assert.ok(component.hasError);
    assert.strictEqual(component.error, 'Title is a duplicate');
  });
});
