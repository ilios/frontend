import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios/tests/pages/components/school-vocabularies-expanded';

module('Integration | Component | school vocabularies expanded', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    this.server.createList('vocabulary', 2, { school });
    const schoolModel = await this.owner.lookup('service:store').find('school', school.id);

    this.set('school', schoolModel);
    await render(hbs`<SchoolVocabulariesExpanded
      @school={{this.school}}
      @collapse={{(noop)}}
      @setSchoolManagedVocabulary={{(noop)}}
      @setSchoolManagedVocabularyTerm={{(noop)}}
    />`);

    assert.equal(component.title, 'Vocabularies (2)');
    assert.equal(component.vocabulariesList.vocabularies.length, 2);
    assert.equal(component.vocabulariesList.vocabularies[0].title.text, 'Vocabulary 1');
    assert.equal(component.vocabulariesList.vocabularies[1].title.text, 'Vocabulary 2');
    assert.notOk(component.vocabularyManager.isVisible);
    assert.notOk(component.termManager.isVisible);
  });

  test('collapse', async function (assert) {
    assert.expect(1);
    const school = this.server.create('school');
    this.server.createList('vocabulary', 2, { school });
    const schoolModel = await this.owner.lookup('service:store').find('school', school.id);
    this.set('collapse', () => {
      assert.ok(true, 'collapse triggered.');
    });
    this.set('school', schoolModel);

    await render(hbs`<SchoolVocabulariesExpanded
      @school={{this.school}}
      @collapse={{this.collapse}}
      @setSchoolManagedVocabulary={{(noop)}}
      @setSchoolManagedVocabularyTerm={{(noop)}}
    />`);

    await component.collapse();
  });

  test('manage vocabulary', async function (assert) {
    const school = this.server.create('school');
    const vocabulary = this.server.create('vocabulary', { school });
    const schoolModel = await this.owner.lookup('service:store').find('school', school.id);
    this.set('school', schoolModel);
    this.set('vocabularyId', vocabulary.id);

    await render(hbs`<SchoolVocabulariesExpanded
      @school={{this.school}}
      @collapse={{(noop)}}
      @managedVocabularyId={{this.vocabularyId}}
      @setSchoolManagedVocabulary={{(noop)}}
      @setSchoolManagedVocabularyTerm={{(noop)}}
    />`);

    assert.notOk(component.vocabulariesList.isVisible);
    assert.ok(component.vocabularyManager.isVisible);
    assert.notOk(component.termManager.isVisible);
  });

  test('manage term', async function (assert) {
    const school = this.server.create('school');
    const vocabulary = this.server.create('vocabulary', { school });
    const term = this.server.create('term', { vocabulary });
    const schoolModel = await this.owner.lookup('service:store').find('school', school.id);
    this.set('school', schoolModel);
    this.set('termId', term.id);
    this.set('vocabularyId', vocabulary.id);

    await render(hbs`<SchoolVocabulariesExpanded
      @school={{this.school}}
      @collapse={{(noop)}}
      @managedTermId={{this.termId}}
      @managedVocabularyId={{this.vocabularyId}}
      @setSchoolManagedVocabulary={{(noop)}}
      @setSchoolManagedVocabularyTerm={{(noop)}}
    />`);

    assert.notOk(component.vocabulariesList.isVisible);
    assert.notOk(component.vocabularyManager.isVisible);
    assert.ok(component.termManager.isVisible);
  });
});
