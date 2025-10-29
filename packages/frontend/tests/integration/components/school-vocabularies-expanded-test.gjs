import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/school-vocabularies-expanded';
import SchoolVocabulariesExpanded from 'frontend/components/school-vocabularies-expanded';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | school vocabularies expanded', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    this.server.createList('vocabulary', 2, { school });
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);

    this.set('school', schoolModel);
    await render(
      <template>
        <SchoolVocabulariesExpanded
          @school={{this.school}}
          @collapse={{(noop)}}
          @setSchoolManagedVocabulary={{(noop)}}
          @setSchoolManagedVocabularyTerm={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.title, 'Vocabularies (2)');
    assert.strictEqual(component.vocabulariesList.vocabularies.length, 2);
    assert.strictEqual(component.vocabulariesList.vocabularies[0].title.text, 'Vocabulary 1');
    assert.strictEqual(component.vocabulariesList.vocabularies[1].title.text, 'Vocabulary 2');
    assert.notOk(component.vocabularyManager.isVisible);
    assert.notOk(component.termManager.isVisible);
  });

  test('collapse', async function (assert) {
    const school = this.server.create('school');
    this.server.createList('vocabulary', 2, { school });
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('collapse', () => {
      assert.step('collapse called');
    });
    this.set('school', schoolModel);

    await render(
      <template>
        <SchoolVocabulariesExpanded
          @school={{this.school}}
          @collapse={{this.collapse}}
          @setSchoolManagedVocabulary={{(noop)}}
          @setSchoolManagedVocabularyTerm={{(noop)}}
        />
      </template>,
    );

    await component.collapse();
    assert.verifySteps(['collapse called']);
  });

  test('manage vocabulary', async function (assert) {
    const school = this.server.create('school');
    const vocabulary = this.server.create('vocabulary', { school });
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    this.set('vocabularyId', vocabulary.id);

    await render(
      <template>
        <SchoolVocabulariesExpanded
          @school={{this.school}}
          @collapse={{(noop)}}
          @managedVocabularyId={{this.vocabularyId}}
          @setSchoolManagedVocabulary={{(noop)}}
          @setSchoolManagedVocabularyTerm={{(noop)}}
        />
      </template>,
    );

    assert.notOk(component.vocabulariesList.isVisible);
    assert.ok(component.vocabularyManager.isVisible);
    assert.notOk(component.termManager.isVisible);
  });

  test('manage term', async function (assert) {
    const school = this.server.create('school');
    const vocabulary = this.server.create('vocabulary', { school });
    const term = this.server.create('term', { vocabulary });
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    this.set('termId', term.id);
    this.set('vocabularyId', vocabulary.id);

    await render(
      <template>
        <SchoolVocabulariesExpanded
          @school={{this.school}}
          @collapse={{(noop)}}
          @managedTermId={{this.termId}}
          @managedVocabularyId={{this.vocabularyId}}
          @setSchoolManagedVocabulary={{(noop)}}
          @setSchoolManagedVocabularyTerm={{(noop)}}
        />
      </template>,
    );

    assert.notOk(component.vocabulariesList.isVisible);
    assert.notOk(component.vocabularyManager.isVisible);
    assert.ok(component.termManager.isVisible);
  });
});
