import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn,find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { resolve } from 'rsvp';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | taxonomy manager', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    const school = this.server.create('school', { title: 'Medicine' });
    const vocab1 = this.server.create('vocabulary', { active: true, title: 'Foo', school });
    const vocab2 = this.server.create('vocabulary', { active: false, title: 'Bar', school });
    const vocab3 = this.server.create('vocabulary', { active: true, title: 'Baz', school });
    const term1 = this.server.create('term', { active: true, title: 'Alpha', vocabulary: vocab1 });
    const term2 = this.server.create('term', { active: true, title: 'Beta',  vocabulary: vocab1 });
    const term3 = this.server.create('term', { active: true, title: 'Gamma', vocabulary: vocab2 });

    this.vocabModel1 = await this.owner.lookup('service:store').find('vocabulary', vocab1.id);
    this.vocabModel2 = await this.owner.lookup('service:store').find('vocabulary', vocab2.id);
    this.vocabModel3 = await this.owner.lookup('service:store').find('vocabulary', vocab3.id);
    this.termModel1 = await this.owner.lookup('service:store').find('term', term1.id);
    this.termModel2 = await this.owner.lookup('service:store').find('term', term2.id);
    this.termModel3 = await this.owner.lookup('service:store').find('term', term3.id);
  });

  test('it renders', async function(assert) {
    assert.expect(13);

    this.set('assignableVocabularies', resolve([ this.vocabModel1, this.vocabModel2, this.vocabModel3 ]));
    this.set('selectedTerms', [ this.termModel1, this.termModel2, this.termModel3 ]);
    this.set('nothing', () => {});

    await render(hbs`<TaxonomyManager
      @vocabularies={{await this.assignableVocabularies}}
      @selectedTerms={{this.selectedTerms}}
      @add={{action this.nothing}}
      @remove={{action this.nothing}}
    />`);

    assert.dom('.detail-terms-list').exists({ count: 2 });
    assert.dom('.detail-terms-list:nth-of-type(1) [data-test-title]').hasText('Foo (Medicine)');
    assert.dom('.detail-terms-list:nth-of-type(1) .detail-terms-list-item:nth-of-type(2)').hasText('Beta');
    assert.dom('.detail-terms-list:nth-of-type(2) [data-test-title]').hasText('Bar (Medicine) (inactive)');
    assert.dom('.detail-terms-list:nth-of-type(2) .detail-terms-list-item').hasText('Gamma');

    assert.dom('.vocabulary-picker option').exists({ count: 1 });
    assert.dom('.vocabulary-picker option:nth-of-type(1)').hasValue('1');
    assert.dom('.vocabulary-picker option:nth-of-type(1)').hasText('Foo (Medicine)');

    assert.dom('.selectable-terms-list-item').exists({ count: 2 });
    assert.dom('.top-level:nth-of-type(1) .selectable-terms-list-item:nth-of-type(1)')
      .hasText('Alpha');
    assert.dom('.top-level:nth-of-type(1) .selectable-terms-list-item:nth-of-type(1)')
      .hasClass('selected');
    assert.dom('.top-level:nth-of-type(2) .selectable-terms-list-item:nth-of-type(1)')
      .hasText('Beta');
    assert.dom('.top-level:nth-of-type(2) .selectable-terms-list-item:nth-of-type(1)')
      .hasClass('selected');
  });

  test('select/deselect term', async function(assert) {
    assert.expect(11);
    this.set('assignableVocabularies', resolve([ this.vocabModel1 ]));
    this.set('selectedTerms', [ this.termModel1, this.termModel2 ]);
    this.set('add', (term) => {
      assert.equal(term, this.termModel2);
      this.selectedTerms.pushObject(term);
    });
    this.set('remove', (term) => {
      assert.equal(term, this.termModel2);
      this.selectedTerms.removeObject(term);
    });

    await render(hbs`<TaxonomyManager
      @vocabularies={{await this.assignableVocabularies}}
      @selectedTerms={{this.selectedTerms}}
      @add={{action this.add}}
      @remove={{action this.remove}}
    />`);

    const termInDetailsTagList = '.detail-terms-list:nth-of-type(1) .detail-terms-list-item:nth-of-type(2)';
    const termInSelectableTermsList = '.top-level:nth-of-type(2) .selectable-terms-list-item:nth-of-type(1)';

    assert.dom(termInDetailsTagList).exists();
    assert.dom(termInSelectableTermsList).hasClass('selected');

    await click(find(termInSelectableTermsList));

    assert.dom(termInDetailsTagList).doesNotExist();
    assert.dom(termInSelectableTermsList).hasNoClass('selected');

    await click(find(termInSelectableTermsList));

    assert.dom(termInDetailsTagList).exists();
    assert.dom(termInSelectableTermsList).hasClass('selected');

    await click(find(termInDetailsTagList));

    assert.dom(termInDetailsTagList).doesNotExist();
    assert.dom(termInSelectableTermsList).hasNoClass('selected');
  });

  test('switch vocabularies', async function(assert) {
    assert.expect(10);
    this.vocabModel2.set('active', true);
    this.set('assignableVocabularies', resolve([ this.vocabModel1, this.vocabModel2]));
    this.set('selectedTerms', [ this.termModel1, this.termModel2, this.termModel3 ]);
    this.set('nothing', () => {});

    await render(hbs`<TaxonomyManager
      @vocabularies={{await this.assignableVocabularies}}
      @selectedTerms={{this.selectedTerms}}
      @add={{action this.nothing}}
      @remove={{action this.nothing}}
    />`);

    assert.dom('.vocabulary-picker option').exists({ count: 2 });
    assert.dom('.vocabulary-picker option:nth-of-type(1)').hasValue('1');
    assert.dom('.vocabulary-picker option:nth-of-type(1)').hasText('Foo (Medicine)');
    assert.dom('.vocabulary-picker option:nth-of-type(2)').hasValue('2');
    assert.dom('.vocabulary-picker option:nth-of-type(2)').hasText('Bar (Medicine)');

    assert.dom('.selectable-terms-list-item').exists({ count: 2 });
    assert.dom('.top-level:nth-of-type(1) .selectable-terms-list-item:nth-of-type(1)')
      .hasText('Alpha');
    assert.dom('.top-level:nth-of-type(2) .selectable-terms-list-item:nth-of-type(1)')
      .hasText('Beta');

    await fillIn('.vocabulary-picker select', '2');

    assert.dom('.selectable-terms-list-item').exists({ count: 1 });
    assert.dom('.top-level:nth-of-type(1) .selectable-terms-list-item:nth-of-type(1)').hasText('Gamma');
  });

  test('filter terms', async function(assert) {
    //assert.expect(10);
    this.set('assignableVocabularies', resolve([ this.vocabModel1, this.vocabModel2]));
    this.set('selectedTerms', [ this.termModel1, this.termModel2, this.termModel3 ]);
    this.set('nothing', () => {});

    await render(hbs`<TaxonomyManager
      @vocabularies={{await this.assignableVocabularies}}
      @selectedTerms={{this.selectedTerms}}
      @add={{action this.nothing}}
      @remove={{action this.nothing}}
    />`);

    assert.dom('.selectable-terms-list-item').exists({ count: 2 });
    assert.dom('.top-level:nth-of-type(1) .selectable-terms-list-item:nth-of-type(1)')
      .hasText('Alpha');
    assert.dom('.top-level:nth-of-type(2) .selectable-terms-list-item:nth-of-type(1)')
      .hasText('Beta');

    await fillIn('.vocabulary-picker input', 'Beta');

    assert.dom('.selectable-terms-list-item').exists({ count: 1 });
    assert.dom('.top-level:nth-of-type(1) .selectable-terms-list-item:nth-of-type(1)').hasText('Beta');
  });
});
