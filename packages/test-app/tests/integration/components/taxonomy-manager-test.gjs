import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { component } from 'ilios-common/page-objects/components/taxonomy-manager';
import TaxonomyManager from 'ilios-common/components/taxonomy-manager';
import noop from 'ilios-common/helpers/noop';
import { array } from '@ember/helper';

module('Integration | Component | taxonomy manager', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school', { title: 'Medicine' });
    const vocab1 = this.server.create('vocabulary', {
      active: true,
      title: 'Foo',
      school,
    });
    const vocab2 = this.server.create('vocabulary', {
      active: false,
      title: 'Bar',
      school,
    });
    const vocab3 = this.server.create('vocabulary', {
      active: true,
      title: 'Baz',
      school,
    });
    const subTerm1 = this.server.create('term', {
      active: true,
      title: 'Palo Alto',
      vocabulary: vocab1,
    });
    const subTerm2 = this.server.create('term', {
      active: true,
      title: 'Schnitzelwirt',
      vocabulary: vocab1,
    });
    const subTerm3 = this.server.create('term', {
      active: true,
      title: 'Rainjacket',
      vocabulary: vocab1,
    });

    const term1 = this.server.create('term', {
      active: true,
      title: 'Alpha',
      vocabulary: vocab1,
      children: [subTerm2],
    });
    const term2 = this.server.create('term', {
      active: true,
      title: 'Beta',
      vocabulary: vocab1,
      children: [subTerm1, subTerm3],
    });
    const term3 = this.server.create('term', {
      active: true,
      title: 'Gamma',
      vocabulary: vocab2,
    });

    this.vocabModel1 = await this.owner.lookup('service:store').findRecord('vocabulary', vocab1.id);
    this.vocabModel2 = await this.owner.lookup('service:store').findRecord('vocabulary', vocab2.id);
    this.vocabModel3 = await this.owner.lookup('service:store').findRecord('vocabulary', vocab3.id);
    this.termModel1 = await this.owner.lookup('service:store').findRecord('term', term1.id);
    this.termModel2 = await this.owner.lookup('service:store').findRecord('term', term2.id);
    this.termModel3 = await this.owner.lookup('service:store').findRecord('term', term3.id);
  });

  test('it renders', async function (assert) {
    this.set('assignableVocabularies', [this.vocabModel1, this.vocabModel2, this.vocabModel3]);
    this.set('selectedTerms', [this.termModel1, this.termModel2, this.termModel3]);

    await render(
      <template>
        <TaxonomyManager
          @vocabularies={{this.assignableVocabularies}}
          @selectedTerms={{this.selectedTerms}}
          @add={{(noop)}}
          @remove={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.selectedTerms.length, 2);
    assert.strictEqual(component.selectedTerms[0].title, 'Foo (Medicine)');
    assert.strictEqual(component.selectedTerms[0].terms[0].name, 'Alpha');
    assert.strictEqual(component.selectedTerms[0].terms[1].name, 'Beta');
    assert.strictEqual(component.selectedTerms[1].title, 'Bar (Medicine) (inactive)');
    assert.strictEqual(component.selectedTerms[1].terms[0].name, 'Gamma');

    assert.strictEqual(component.vocabulary.options.length, 1);
    assert.strictEqual(component.vocabulary.options[0].value, '1');
    assert.strictEqual(component.vocabulary.options[0].text, 'Foo (Medicine)');
    assert.ok(component.vocabulary.options[0].isSelected);

    assert.strictEqual(component.availableTerms.length, 2);
    assert.strictEqual(component.availableTerms[0].name, 'Alpha');
    assert.ok(component.availableTerms[0].isSelected);
    assert.strictEqual(component.availableTerms[0].children.length, 1);
    assert.strictEqual(component.availableTerms[0].children[0].name, 'Schnitzelwirt');
    assert.strictEqual(component.availableTerms[1].name, 'Beta');
    assert.ok(component.availableTerms[1].isSelected);
    assert.strictEqual(component.availableTerms[1].children.length, 2);
    assert.strictEqual(component.availableTerms[1].children[0].name, 'Palo Alto');
    assert.strictEqual(component.availableTerms[1].children[1].name, 'Rainjacket');
  });

  test('select/deselect term', async function (assert) {
    assert.expect(14);
    this.set('assignableVocabularies', [this.vocabModel1]);
    this.set('selectedTerms', [this.termModel1]);
    this.set('add', (term) => {
      assert.strictEqual(term, this.termModel2);
      this.set('selectedTerms', [...this.selectedTerms, term]);
    });
    this.set('remove', (term) => {
      assert.strictEqual(term, this.termModel2);
      this.set(
        'selectedTerms',
        this.selectedTerms.filter((t) => t !== term),
      );
    });

    await render(
      <template>
        <TaxonomyManager
          @vocabularies={{this.assignableVocabularies}}
          @selectedTerms={{this.selectedTerms}}
          @add={{this.add}}
          @remove={{this.remove}}
        />
      </template>,
    );

    assert.notOk(component.selectedTerms[0].terms[1].isPresent);
    assert.notOk(component.availableTerms[1].isSelected);

    await component.availableTerms[1].toggle();

    assert.ok(component.selectedTerms[0].terms[1].isPresent);
    assert.ok(component.availableTerms[1].isSelected);

    await component.availableTerms[1].toggle();

    assert.notOk(component.selectedTerms[0].terms[1].isPresent);
    assert.notOk(component.availableTerms[1].isSelected);

    await component.availableTerms[1].toggle();

    assert.ok(component.selectedTerms[0].terms[1].isPresent);
    assert.ok(component.availableTerms[1].isSelected);

    await component.selectedTerms[0].terms[1].remove();

    assert.notOk(component.selectedTerms[0].terms[1].isPresent);
    assert.notOk(component.availableTerms[1].isSelected);
  });

  test('switch vocabularies', async function (assert) {
    this.vocabModel2.set('active', true);
    this.set('assignableVocabularies', [this.vocabModel1, this.vocabModel2]);
    this.set('selectedTerms', [this.termModel1, this.termModel2, this.termModel3]);

    await render(
      <template>
        <TaxonomyManager
          @vocabularies={{this.assignableVocabularies}}
          @selectedTerms={{this.selectedTerms}}
          @add={{(noop)}}
          @remove={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.vocabulary.options.length, 2);
    assert.strictEqual(component.vocabulary.options[0].value, '1');
    assert.strictEqual(component.vocabulary.options[0].text, 'Foo (Medicine)');
    assert.strictEqual(component.vocabulary.options[1].value, '2');
    assert.strictEqual(component.vocabulary.options[1].text, 'Bar (Medicine)');

    assert.strictEqual(component.availableTerms.length, 2);
    assert.strictEqual(component.availableTerms[0].name, 'Alpha');
    assert.strictEqual(component.availableTerms[1].name, 'Beta');

    await component.vocabulary.set('2');

    assert.strictEqual(component.availableTerms.length, 1);
    assert.strictEqual(component.availableTerms[0].name, 'Gamma');
  });

  test('filter terms', async function (assert) {
    this.set('assignableVocabularies', [this.vocabModel1, this.vocabModel2]);
    this.set('selectedTerms', [this.termModel1, this.termModel2, this.termModel3]);

    await render(
      <template>
        <TaxonomyManager
          @vocabularies={{this.assignableVocabularies}}
          @selectedTerms={{this.selectedTerms}}
          @add={{(noop)}}
          @remove={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.availableTerms.length, 2);
    assert.strictEqual(component.availableTerms[0].name, 'Alpha');
    assert.strictEqual(component.availableTerms[0].children.length, 1);
    assert.strictEqual(component.availableTerms[0].children[0].name, 'Schnitzelwirt');
    assert.strictEqual(component.availableTerms[1].name, 'Beta');
    assert.strictEqual(component.availableTerms[1].children.length, 2);
    assert.strictEqual(component.availableTerms[1].children[0].name, 'Palo Alto');
    assert.strictEqual(component.availableTerms[1].children[1].name, 'Rainjacket');

    await component.filter.set('Al');

    assert.strictEqual(component.availableTerms.length, 2);
    assert.strictEqual(component.availableTerms[0].name, 'Alpha');
    assert.strictEqual(component.availableTerms[0].children.length, 0);
    assert.strictEqual(component.availableTerms[1].name, 'Beta');
    assert.strictEqual(component.availableTerms[1].children.length, 1);
    assert.strictEqual(component.availableTerms[1].children[0].name, 'Palo Alto');
  });

  test('given vocabulary is selected', async function (assert) {
    this.vocabModel2.set('active', true);

    this.set('assignableVocabularies', [this.vocabModel1, this.vocabModel2, this.vocabModel3]);
    this.set('selectedTerms', [this.termModel1, this.termModel2, this.termModel3]);
    this.set('vocabulary', this.vocabModel2);

    await render(
      <template>
        <TaxonomyManager
          @vocabularies={{this.assignableVocabularies}}
          @vocabulary={{this.vocabulary}}
          @selectedTerms={{this.selectedTerms}}
          @add={{(noop)}}
          @remove={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.vocabulary.options.length, 2);
    assert.notOk(component.vocabulary.options[0].isSelected);
    assert.ok(component.vocabulary.options[1].isSelected);
    assert.strictEqual(component.availableTerms.length, 1);
    assert.strictEqual(component.availableTerms[0].name, 'Gamma');
  });

  test('vocabulary without active top-level terms is not assignable', async function (assert) {
    // deactivate all top-level terms in vocabulary 1
    this.termModel1.set('active', false);
    this.termModel2.set('active', false);

    this.set('assignableVocabularies', [this.vocabModel1]);
    await render(
      <template>
        <TaxonomyManager
          @vocabularies={{this.assignableVocabularies}}
          @selectedTerms={{(array)}}
          @add={{(noop)}}
          @remove={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.vocabulary.options.length, 0);
  });
});
