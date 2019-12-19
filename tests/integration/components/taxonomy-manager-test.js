import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { resolve } from 'rsvp';
import { setupMirage } from 'ember-cli-mirage/test-support';


module('Integration | Component | taxonomy manager', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    assert.expect(9);

    const school = this.server.create('school', { title: 'Medicine' });
    const vocab1 = this.server.create('vocabulary', { active: true, title: 'Foo', school });
    const vocab2 = this.server.create('vocabulary', { active: false, title: 'Bar', school });
    const vocab3 = this.server.create('vocabulary', { active: true, title: 'Baz', school });
    const term1 = this.server.create('term', { active: true, title: 'Alpha', vocabulary: vocab1 });
    const term2 = this.server.create('term', { active: true, title: 'Beta',  vocabulary: vocab1 });
    const term3 = this.server.create('term', { active: true, title: 'Gamma', vocabulary: vocab2 });

    const vocabModel1 = await this.owner.lookup('service:store').find('vocabulary', vocab1.id);
    const vocabModel2 = await this.owner.lookup('service:store').find('vocabulary', vocab2.id);
    const vocabModel3 = await this.owner.lookup('service:store').find('vocabulary', vocab3.id);
    const termModel1 = await this.owner.lookup('service:store').find('term', term1.id);
    const termModel2 = await this.owner.lookup('service:store').find('term', term2.id);
    const termModel3 = await this.owner.lookup('service:store').find('term', term3.id);

    this.set('assignableVocabularies', resolve([ vocabModel1, vocabModel2, vocabModel3 ]));
    this.set('selectedTerms', [ termModel1, termModel2, termModel3 ]);
    this.set('nothing', () => {});

    await render(hbs`<TaxonomyManager
      @vocabularies={{await this.assignableVocabularies}}
      @selectedTerms={{this.selectedTerms}}
      @add={{action this.nothing}}
      @remove={{action this.nothing}}
    />`);
    assert.dom('.detail-terms-list').exists({ count: 2 });
    assert.dom('.detail-terms-list:nth-of-type(1)').includesText('Foo (Medicine)');
    assert.dom('.detail-terms-list:nth-of-type(1) .detail-terms-list-item').hasText('Alpha');
    assert.dom('.detail-terms-list:nth-of-type(1) .detail-terms-list-item:nth-of-type(2)').hasText('Beta');
    assert.dom('.detail-terms-list:nth-of-type(2)').includesText('Bar (Medicine)');
    assert.dom('.detail-terms-list:nth-of-type(2) .detail-terms-list-item').hasText('Gamma');

    assert.dom('.vocabulary-picker option').exists({ count: 1 });
    assert.dom('.vocabulary-picker option').hasValue('1');
    assert.dom('.vocabulary-picker option').hasText('Foo (Medicine)');
  });
});
