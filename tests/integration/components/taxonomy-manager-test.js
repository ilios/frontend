import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import { resolve } from 'rsvp';

module('Integration | Component | taxonomy manager', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(9);

    const school = EmberObject.create({
      id: 1,
      title: 'Medicine'
    });

    const vocab1 = EmberObject.create({
      id: 1,
      active: true,
      title: 'Foo',
      school,
      termCount: 2
    });

    const vocab2 = EmberObject.create({
      id: 2,
      active: false,
      title: 'Bar',
      school,
      termCount: 1
    });

    const vocab3 = EmberObject.create({
      id: 3,
      active: true,
      title: 'Baz',
      school,
      termCount: 0
    });

    const term1 = EmberObject.create({
      id: 1,
      isActiveInTree: true,
      title: 'Alpha',
      titleWithParentTitles: resolve('Alpha'),
      isTopLevel: true,
      belongsTo() {
        return {
          id() {
            return vocab1.get('id');
          }
        };
      },
      vocabulary: vocab1
    });

    const term2 = EmberObject.create({
      id: 2,
      isActiveInTree: true,
      title: 'Beta',
      titleWithParentTitles: resolve('Beta'),
      isTopLevel: true,
      belongsTo(){
        return {
          id() {
            return vocab1.get('id');
          }
        };
      },
      vocabulary: vocab1
    });

    const term3 = EmberObject.create({
      id: 3,
      isActiveInTree: true,
      title: 'Gamma',
      titleWithParentTitles: resolve('Gamma'),
      isTopLevel: true,
      belongsTo(){
        return {
          id() {
            return vocab2.get('id');
          }
        };
      },
      vocabulary: vocab2
    });

    vocab1.set('terms', [ term1, term2 ]);
    vocab2.set('terms', [ term3 ]);
    vocab3.set('terms', []);

    const subject = EmberObject.create({
      assignableVocabularies: [ vocab1, vocab2, vocab3 ]
    });

    const selectedTerms = [ term1, term2, term3 ];

    this.set('subject', subject);
    this.set('selectedTerms', selectedTerms);
    this.set('nothing', () => {});

    await render(hbs`<TaxonomyManager
      @vocabularies={{this.subject.assignableVocabularies}}
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
